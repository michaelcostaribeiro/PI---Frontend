from datetime import date, timedelta
import os
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
from pydantic import BaseModel, Field

app = FastAPI(
    title="Affiliate KPI - API",
    description="API para o MVP do Projeto Integrador Senac (Backend FastAPI + MySQL)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "affiliate_kpi"),
            port=int(os.getenv("DB_PORT", "3306"))
        )
        return conn
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


class ProductUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    price: float = Field(ge=0)
    img_url: Optional[str] = Field(default=None, max_length=500)


@app.get("/")
def read_root():
    return {"status": "ok", "mensagem": "API Affiliate KPI rodando com sucesso!"}


@app.get("/api/afiliados/{usuario_id}/produtos")
def get_produtos_afiliado(
    usuario_id: int,
    data_inicio: Optional[date] = Query(default=None),
    data_fim: Optional[date] = Query(default=None),
    ordenacao: str = Query(default="vendas"),
):
    inicio, fim = get_date_range(data_inicio, data_fim)
    order_by = {
        "vendas": "sold DESC",
        "comissao": "comissao DESC",
        "visualizacoes": "visualizacoes DESC",
    }.get(ordenacao)
    if order_by is None:
        raise HTTPException(status_code=400, detail="Ordenação inválida")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = f'''
        SELECT p.id AS id, p.nome AS name, l.nome AS store, p.imagem_url AS img_url,
               p.preco AS price,
               SUM(m.comissao_gerada) AS comissao,
               SUM(m.cliques) AS clicks,
               SUM(m.vendas) AS sold,
               SUM(m.visualizacoes) AS visualizacoes
        FROM afiliacao a
        JOIN produto p        ON p.id = a.produto_id
        JOIN loja l           ON l.id = p.loja_id
        JOIN metrica_diaria m ON m.afiliacao_id = a.id
        WHERE a.usuario_id = %s
          AND m.data BETWEEN %s AND %s
        GROUP BY a.id, p.id, p.nome, l.nome, p.imagem_url, p.preco
        ORDER BY {order_by}
    '''

    try:
        cursor.execute(query, (usuario_id, inicio, fim))
        return {"produtos": cursor.fetchall()}
    finally:
        close_db_resources(cursor, conn)


@app.get("/api/afiliados/{usuario_id}/produtos/{produto_id}")
def get_produto_afiliado(
    usuario_id: int,
    produto_id: int,
    data_inicio: Optional[date] = Query(default=None),
    data_fim: Optional[date] = Query(default=None),
):
    inicio, fim = get_date_range(data_inicio, data_fim)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    product_query = '''
        SELECT p.id, p.nome AS name, p.imagem_url AS img_url, p.preco AS price,
               l.nome AS store, a.id AS afiliacao_id,
               a.link_afiliado, a.comissao_percentual
        FROM afiliacao a
        JOIN produto p ON p.id = a.produto_id
        JOIN loja l ON l.id = p.loja_id
        WHERE a.usuario_id = %s AND p.id = %s
    '''
    metrics_query = '''
        SELECT data, visualizacoes AS views, cliques AS clicks,
               vendas AS sold, comissao_gerada AS commission
        FROM metrica_diaria
        WHERE afiliacao_id = %s AND data BETWEEN %s AND %s
        ORDER BY data
    '''
    summary_query = '''
        SELECT
          SUM(CASE WHEN data BETWEEN %s AND %s THEN cliques ELSE 0 END) AS current_clicks,
          SUM(CASE WHEN data BETWEEN %s AND %s THEN cliques ELSE 0 END) AS previous_clicks,
          SUM(CASE WHEN data BETWEEN %s AND %s THEN vendas ELSE 0 END) AS current_sold,
          SUM(CASE WHEN data BETWEEN %s AND %s THEN vendas ELSE 0 END) AS previous_sold,
          SUM(CASE WHEN data BETWEEN %s AND %s THEN comissao_gerada ELSE 0 END) AS current_commission,
          SUM(CASE WHEN data BETWEEN %s AND %s THEN comissao_gerada ELSE 0 END) AS previous_commission
        FROM metrica_diaria
        WHERE afiliacao_id = %s AND data BETWEEN %s AND %s
    '''

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
                inicio, fim,
                previous_inicio, previous_fim,
                inicio, fim,
                previous_inicio, previous_fim,
                inicio, fim,
                previous_inicio, previous_fim,
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


@app.put("/api/afiliados/{usuario_id}/produtos/{produto_id}")
def update_produto_afiliado(
    usuario_id: int,
    produto_id: int,
    payload: ProductUpdate,
):
    conn = get_db_connection()
    cursor = conn.cursor()

    ownership_query = '''
        SELECT p.id
        FROM afiliacao a
        JOIN produto p ON p.id = a.produto_id
        WHERE a.usuario_id = %s AND p.id = %s
    '''
    try:
        cursor.execute(ownership_query, (usuario_id, produto_id))
        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        cursor.execute(
            """
            UPDATE produto
            SET nome = %s, preco = %s, imagem_url = %s
            WHERE id = %s
            """,
            (payload.name, payload.price, payload.img_url, produto_id),
        )
        conn.commit()
        return {"status": "ok"}
    finally:
        close_db_resources(cursor, conn)


@app.get("/api/usuarios/{usuario_id}/notificacoes/nao-lidas")
def get_notificacoes_nao_lidas(usuario_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = "SELECT COUNT(*) AS nao_lidas FROM notificacao WHERE usuario_id = %s AND visto_em IS NULL"

    cursor.execute(query, (usuario_id,))
    resultado = cursor.fetchone()

    close_db_resources(cursor, conn)
    return resultado
