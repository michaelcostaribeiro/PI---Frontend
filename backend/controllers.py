from datetime import date
from typing import Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from backend.fake_api import generate_product_data
from backend.services import (
    create_product,
    delete_product,
    get_date_range,
    get_product,
    get_unread_notifications,
    list_products,
    update_product,
)


router = APIRouter()


class ProductPayload(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    price: float = Field(ge=0)
    img_url: Optional[str] = Field(default=None, max_length=500)


@router.get("/")
def read_root():
    return {"status": "ok", "mensagem": "API Affiliate KPI rodando com sucesso!"}


@router.get("/api/afiliados/{usuario_id}/produtos")
def get_produtos_afiliado(
    usuario_id: int,
    data_inicio: Optional[date] = Query(default=None),
    data_fim: Optional[date] = Query(default=None),
    ordenacao: str = Query(default="vendas"),
):
    inicio, fim = get_date_range(data_inicio, data_fim)
    return {"produtos": list_products(usuario_id, inicio, fim, ordenacao)}


@router.post("/api/afiliados/{usuario_id}/produtos")
def create_produto(usuario_id: int, payload: ProductPayload):
    product_data = generate_product_data(payload.name, payload.price, payload.img_url)
    return create_product(usuario_id, product_data)


@router.get("/api/afiliados/{usuario_id}/produtos/{produto_id}")
def get_produto_afiliado(
    usuario_id: int,
    produto_id: int,
    data_inicio: Optional[date] = Query(default=None),
    data_fim: Optional[date] = Query(default=None),
):
    inicio, fim = get_date_range(data_inicio, data_fim)
    return get_product(usuario_id, produto_id, inicio, fim)


@router.put("/api/afiliados/{usuario_id}/produtos/{produto_id}")
def update_produto_afiliado(
    usuario_id: int,
    produto_id: int,
    payload: ProductPayload,
):
    return update_product(usuario_id, produto_id, payload.model_dump())


@router.delete("/api/afiliados/{usuario_id}/produtos/{produto_id}")
def delete_produto_afiliado(usuario_id: int, produto_id: int):
    return delete_product(usuario_id, produto_id)


@router.get("/api/usuarios/{usuario_id}/notificacoes/nao-lidas")
def get_notificacoes_nao_lidas(usuario_id: int):
    return get_unread_notifications(usuario_id)
