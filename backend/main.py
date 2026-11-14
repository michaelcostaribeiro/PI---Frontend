from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
import os

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


@app.get("/")
def read_root():
    return {"status": "ok", "mensagem": "API Affiliate KPI rodando com sucesso!"}


@app.get("/api/afiliados/{usuario_id}/produtos")
def get_produtos_afiliado(usuario_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = '''
        SELECT p.id AS produto_id, p.nome, l.nome AS loja, p.imagem_url,
               SUM(m.comissao_gerada) AS comissao,
               SUM(m.cliques)         AS cliques,
               SUM(m.vendas)          AS vendas
        FROM afiliacao a
        JOIN produto p        ON p.id = a.produto_id
        JOIN loja l           ON l.id = p.loja_id
        JOIN metrica_diaria m ON m.afiliacao_id = a.id
        WHERE a.usuario_id = %s
          AND m.data BETWEEN '2026-08-10' AND '2026-08-16'
        GROUP BY a.id, p.id, p.nome, l.nome, p.imagem_url
        ORDER BY vendas DESC
    '''

    cursor.execute(query, (usuario_id,))
    resultados = cursor.fetchall()

    cursor.close()
    conn.close()

    return {"produtos": resultados}


@app.get("/api/usuarios/{usuario_id}/notificacoes/nao-lidas")
def get_notificacoes_nao_lidas(usuario_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = "SELECT COUNT(*) AS nao_lidas FROM notificacao WHERE usuario_id = %s AND visto_em IS NULL"

    cursor.execute(query, (usuario_id,))
    resultado = cursor.fetchone()

    cursor.close()
    conn.close()

    return resultado
