"""
Configuração compartilhada dos testes (pytest).

Cria um banco SQLite em memória isolado para cada teste, sobrescrevendo a
dependência get_db do FastAPI. Assim os testes não tocam o baycad_rh.db real.
"""
import os
import sys

# Garante que os módulos do backend (main, models, schemas, database) sejam
# importáveis a partir da pasta python/, independentemente de onde o pytest roda.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import database
import models
import main


@pytest.fixture
def db_session():
    """Sessão de banco isolada em memória (compartilhada via StaticPool)."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(
        bind=engine, autoflush=False, autocommit=False
    )
    models.Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        models.Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db_session):
    """TestClient da API usando o banco isolado."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    main.app.dependency_overrides[database.get_db] = override_get_db
    with TestClient(main.app) as c:
        yield c
    main.app.dependency_overrides.clear()


@pytest.fixture
def funcionario_payload():
    """Payload válido reutilizável para cadastro."""
    return {
        "nome": "Maria Silva",
        "cpf": "529.982.247-25",
        "departamento": "TI",
        "nivel": "Pleno",
        "data_admissao": "2024-01-15",
        "senha": "senha123",
    }
