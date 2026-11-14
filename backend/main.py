from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.controllers import router


app = FastAPI(
    title="Affiliate KPI - API",
    description="API para o MVP do Projeto Integrador Senac (Backend FastAPI + MySQL)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
