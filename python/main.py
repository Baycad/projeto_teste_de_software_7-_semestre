from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
import schemas
from database import engine, get_db

# Cria as tabelas no banco de dados automaticamente ao iniciar
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Baycad RH API")

# Permite que o seu HTML (mesmo rodando local) acesse a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 1. CADASTRAR FUNCIONÁRIO
@app.post("/api/funcionarios", response_model=schemas.FuncionarioResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_funcionario(func_in: schemas.FuncionarioCreate, db: Session = Depends(get_db)):
    # O CPF já chega limpo (só dígitos) graças ao @field_validator do schemas.py
    db_func = db.query(models.Funcionario).filter(models.Funcionario.cpf == func_in.cpf).first()
    if db_func:
        raise HTTPException(status_code=400, detail="CPF já cadastrado.")

    novo_funcionario = models.Funcionario(
        nome=func_in.nome,
        cpf=func_in.cpf,              # já limpo, sem necessidade de tratar aqui
        departamento=func_in.departamento,
        nivel=func_in.nivel,
        data_admissao=func_in.data_admissao,
        senha_hash=models.Funcionario.gerar_hash(func_in.senha)
    )
    db.add(novo_funcionario)
    db.commit()
    db.refresh(novo_funcionario)
    return novo_funcionario


# 2. LISTAR FUNCIONÁRIOS (Com Filtro de Busca e Departamento)
@app.get("/api/funcionarios", response_model=list[schemas.FuncionarioResponse])
def listar_funcionarios(busca: Optional[str] = None, dept: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Funcionario)

    if dept:
        query = query.filter(models.Funcionario.departamento == dept)
    if busca:
        # Busca por nome ou por CPF
        busca_limpa = "".join(filter(str.isdigit, busca))
        if busca_limpa:
            query = query.filter(models.Funcionario.cpf.contains(busca_limpa))
        else:
            query = query.filter(models.Funcionario.nome.contains(busca))

    return query.all()


# 3. EXCLUIR FUNCIONÁRIO
@app.delete("/api/funcionarios/{func_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_funcionario(func_id: int, db: Session = Depends(get_db)):
    db_func = db.query(models.Funcionario).filter(models.Funcionario.id == func_id).first()
    if not db_func:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado.")
    db.delete(db_func)
    db.commit()
    return None


# 4. DADOS DO DASHBOARD
@app.get("/api/dashboard")
def dados_dashboard(db: Session = Depends(get_db)):
    total = db.query(models.Funcionario).count()

    # Agrupa quantidade por departamento
    resultados = db.query(
        models.Funcionario.departamento,
        func.count(models.Funcionario.id)
    ).group_by(models.Funcionario.departamento).all()

    por_departamento = {dept: qtd for dept, qtd in resultados}

    return {
        "total": total,
        "por_departamento": por_departamento
    }