from datetime import date, timedelta
import os
from typing import Any, Optional

import mysql.connector
from fastapi import HTTPException


def get_db_connection():
    try:
        return mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "affiliate_kpi"),
            port=int(os.getenv("DB_PORT", "3306")),
        )
    except mysql.connector.Error as err:
        print(f"Erro ao conectar ao banco: {err}")
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")


def close_db_resources(cursor, conn):
    if cursor is not None:
        cursor.close()
    if conn is not None:
        conn.close()


def get_date_range(
    data_inicio: Optional[date],
    data_fim: Optional[date],
) -> tuple[date, date]:
    inicio = data_inicio or date(2026, 8, 10)
    fim = data_fim or date(2026, 8, 16)
    if inicio > fim:
        raise HTTPException(
            status_code=400,
            detail="data_inicio deve ser anterior ou igual a data_fim",
        )
    return inicio, fim


def percentage_change(current: float, previous: float) -> float:
    if previous == 0:
        return 0.0
    return round(((current / previous) - 1) * 100, 2)


def list_products(
    usuario_id: int,
    inicio: date,
    fim: date,
    ordenacao: str,
) -> list[dict[str, Any]]:
    order_by = {
        "vendas": "sold DESC",
        "comissao": "comissao DESC",
        "visualizacoes": "visualizacoes DESC",
    }.get(ordenacao)
    if order_by is None:
        raise HTTPException(status_code=400, detail="Ordenação inválida")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = f"""
        SELECT p.id AS id, p.nome AS name, l.nome AS store, p.imagem_url AS img_url,
               p.preco AS price,
               SUM(m.comissao_gerada) AS comissao,
               SUM(m.cliques) AS clicks,
               SUM(m.vendas) AS sold,
               SUM(m.visualizacoes) AS visualizacoes
        FROM afiliacao a
        JOIN produto p ON p.id = a.produto_id
        JOIN loja l ON l.id = p.loja_id
        JOIN metrica_diaria m ON m.afiliacao_id = a.id
        WHERE a.usuario_id = %s AND m.data BETWEEN %s AND %s
        GROUP BY a.id, p.id, p.nome, l.nome, p.imagem_url, p.preco
        ORDER BY {order_by}
    """
    try:
        cursor.execute(query, (usuario_id, inicio, fim))
        return cursor.fetchall()
    finally:
        close_db_resources(cursor, conn)


def create_product(usuario_id: int, product_data: dict[str, Any]) -> dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM usuario WHERE id = %s AND tipo = 'AFILIADO'",
            (usuario_id,),
        )
        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="Afiliado não encontrado")

        cursor.execute("SELECT id FROM loja ORDER BY RAND() LIMIT 1")
        store = cursor.fetchone()
        cursor.execute("SELECT id FROM categoria ORDER BY RAND() LIMIT 1")
        category = cursor.fetchone()
        if store is None or category is None:
            raise HTTPException(status_code=500, detail="Lojas ou categorias não cadastradas")

        cursor.execute(
            """
            INSERT INTO produto
              (loja_id, categoria_id, nome, fabricante, imagem_url, preco)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                store["id"],
                category["id"],
                product_data["name"],
                product_data["manufacturer"],
                product_data["image_url"],
                product_data["price"],
            ),
        )
        product_id = cursor.lastrowid

        cursor.execute(
            """
            INSERT INTO afiliacao
              (usuario_id, produto_id, link_afiliado, comissao_percentual)
            VALUES (%s, %s, %s, %s)
            """,
            (
                usuario_id,
                product_id,
                f"https://affiliate.example/afiliado/{usuario_id}/produto/{product_id}",
                product_data["commission"],
            ),
        )
        affiliation_id = cursor.lastrowid

        for metric in product_data["metrics"]:
            cursor.execute(
                """
                INSERT INTO metrica_diaria
                  (afiliacao_id, data, visualizacoes, cliques, vendas, comissao_gerada)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    affiliation_id,
                    metric["date"],
                    metric["views"],
                    metric["clicks"],
                    metric["sold"],
                    metric["commission"],
                ),
            )

        conn.commit()
        return {
            "id": product_id,
            "name": product_data["name"],
            "img_url": product_data["image_url"],
            "price": product_data["price"],
            "manufacturer": product_data["manufacturer"],
            "store_id": store["id"],
            "category_id": category["id"],
            "commission_percentual": product_data["commission"],
            "message": "Produto criado e persistido com sucesso",
        }
    except HTTPException:
        conn.rollback()
        raise
    except mysql.connector.Error as err:
        conn.rollback()
        print(f"Erro ao criar produto: {err}")
        raise HTTPException(status_code=500, detail="Não foi possível criar o produto")
    finally:
        close_db_resources(cursor, conn)


def get_product(
    usuario_id: int,
    produto_id: int,
    inicio: date,
    fim: date,
) -> dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    product_query = """
        SELECT p.id, p.nome AS name, p.imagem_url AS img_url, p.preco AS price,
               l.nome AS store, a.id AS afiliacao_id,
               a.link_afiliado, a.comissao_percentual
        FROM afiliacao a
        JOIN produto p ON p.id = a.produto_id
        JOIN loja l ON l.id = p.loja_id
        WHERE a.usuario_id = %s AND p.id = %s
    """
    metrics_query = """
        SELECT data, visualizacoes AS views, cliques AS clicks,
               vendas AS sold, comissao_gerada AS commission
        FROM metrica_diaria
        WHERE afiliacao_id = %s AND data BETWEEN %s AND %s
        ORDER BY data
    """
    summary_query = """
        SELECT
          SUM(CASE WHEN data BETWEEN %s AND %s THEN cliques ELSE 0 END) AS current_clicks,
          SUM(CASE WHEN data BETWEEN %s AND %s THEN cliques ELSE 0 END) AS previous_clicks,
          SUM(CASE WHEN data BETWEEN %s AND %s THEN vendas ELSE 0 END) AS current_sold,
          SUM(CASE WHEN data BETWEEN %s AND %s THEN vendas ELSE 0 END) AS previous_sold,
          SUM(CASE WHEN data BETWEEN %s AND %s THEN comissao_gerada ELSE 0 END) AS current_commission,
          SUM(CASE WHEN data BETWEEN %s AND %s THEN comissao_gerada ELSE 0 END) AS previous_commission
        FROM metrica_diaria
        WHERE afiliacao_id = %s AND data BETWEEN %s AND %s
    """
    try:
        cursor.execute(product_query, (usuario_id, produto_id))
        product = cursor.fetchone()
        if product is None:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        cursor.execute(metrics_query, (product["afiliacao_id"], inicio, fim))
        metrics = cursor.fetchall()
        for metric in metrics:
            metric["date"] = metric.pop("data").isoformat()

        period_length = (fim - inicio).days + 1
        previous_inicio = inicio - timedelta(days=period_length)
        previous_fim = inicio - timedelta(days=1)
        cursor.execute(
            summary_query,
            (
                inicio, fim, previous_inicio, previous_fim,
                inicio, fim, previous_inicio, previous_fim,
                inicio, fim, previous_inicio, previous_fim,
                product["afiliacao_id"], previous_inicio, fim,
            ),
        )
        summary = cursor.fetchone()
        current_clicks = summary["current_clicks"] or 0
        previous_clicks = summary["previous_clicks"] or 0
        current_sold = summary["current_sold"] or 0
        previous_sold = summary["previous_sold"] or 0
        current_commission = float(summary["current_commission"] or 0)
        previous_commission = float(summary["previous_commission"] or 0)

        product["metrics"] = metrics
        product["clicks"] = current_clicks
        product["sold"] = current_sold
        product["commission"] = current_commission
        product["trends"] = {
            "clicks": percentage_change(current_clicks, previous_clicks),
            "sold": percentage_change(current_sold, previous_sold),
            "commission": percentage_change(current_commission, previous_commission),
        }
        return product
    finally:
        close_db_resources(cursor, conn)


def update_product(usuario_id: int, produto_id: int, product: dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT p.id FROM afiliacao a
            JOIN produto p ON p.id = a.produto_id
            WHERE a.usuario_id = %s AND p.id = %s
            """,
            (usuario_id, produto_id),
        )
        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        cursor.execute(
            """
            UPDATE produto SET nome = %s, preco = %s, imagem_url = %s
            WHERE id = %s
            """,
            (product["name"], product["price"], product["img_url"], produto_id),
        )
        conn.commit()
        return {"status": "ok"}
    finally:
        close_db_resources(cursor, conn)


def delete_product(usuario_id: int, produto_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM afiliacao WHERE usuario_id = %s AND produto_id = %s",
            (usuario_id, produto_id),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Produto não encontrado no catálogo")
        conn.commit()
        return {"status": "ok", "message": "Produto removido do catálogo"}
    except HTTPException:
        conn.rollback()
        raise
    except mysql.connector.Error as err:
        conn.rollback()
        print(f"Erro ao remover produto: {err}")
        raise HTTPException(status_code=500, detail="Não foi possível remover o produto")
    finally:
        close_db_resources(cursor, conn)


def get_unread_notifications(usuario_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT COUNT(*) AS nao_lidas FROM notificacao "
            "WHERE usuario_id = %s AND visto_em IS NULL",
            (usuario_id,),
        )
        return cursor.fetchone()
    finally:
        close_db_resources(cursor, conn)
