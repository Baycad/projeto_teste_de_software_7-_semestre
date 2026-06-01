from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
import schemas
from database import engine, get_db
from typing import Optional
from pydantic import BaseModel

# Cria as tabelas no banco de dados automaticamente ao iniciar
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Baycad RH API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, mude para a URL do seu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#1. LOGIN DO FUNCIONÁRIO
from pydantic import BaseModel

class LoginRequest(BaseModel):
    cpf: str
    senha: str


@app.post("/api/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    cpf_limpo = "".join(filter(str.isdigit, request.cpf))

    db_func = (
        db.query(models.Funcionario)
        .filter(models.Funcionario.cpf == cpf_limpo)
        .first()
    )

    if not db_func or not db_func.verificar_senha(request.senha):
        raise HTTPException(
            status_code=401,
            detail="CPF ou senha inválidos."
        )

    return {
        "id": db_func.id,
        "nome": db_func.nome,
        "departamento": db_func.departamento,
        "nivel": db_func.nivel
    }

# 2. CADASTRAR FUNCIONÁRIO
@app.post("/api/funcionarios", response_model=schemas.FuncionarioResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_funcionario(func_in: schemas.FuncionarioCreate, db: Session = Depends(get_db)):
    # Verifica se o CPF já existe
    cpf_limpo = "".join(filter(str.isdigit, func_in.cpf))
    db_func = db.query(models.Funcionario).filter(models.Funcionario.cpf == cpf_limpo).first()
    if db_func:
        raise HTTPException(status_code=400, detail="CPF já cadastrado.")
    
    novo_funcionario = models.Funcionario(
        nome=func_in.nome,
        cpf=cpf_limpo,
        departamento=func_in.departamento,
        nivel=func_in.nivel,
        data_admissao=func_in.data_admissao,
        senha_hash=models.Funcionario.gerar_hash(func_in.senha)
    )
    db.add(novo_funcionario)
    db.commit()
    db.refresh(novo_funcionario)
    return novo_funcionario

# 3. LISTAR FUNCIONÁRIOS (Com Filtro de Busca e Departamento)
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

# 4. ATUALIZAR FUNCIONÁRIO
@app.put("/api/funcionarios/{func_id}", response_model=schemas.FuncionarioResponse)
def atualizar_funcionario(func_id: int, func_in: schemas.FuncionarioUpdate, db: Session = Depends(get_db)):
    db_func = db.query(models.Funcionario).filter(models.Funcionario.id == func_id).first()
    if not db_func:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado.")

    # Atualiza apenas os campos enviados na requisição
    dados = func_in.model_dump(exclude_unset=True)

    if "cpf" in dados:
        cpf_limpo = "".join(filter(str.isdigit, dados["cpf"]))
        # Verifica se o novo CPF já pertence a outro funcionário
        outro = (
            db.query(models.Funcionario)
            .filter(models.Funcionario.cpf == cpf_limpo, models.Funcionario.id != func_id)
            .first()
        )
        if outro:
            raise HTTPException(status_code=400, detail="CPF já cadastrado.")
        db_func.cpf = cpf_limpo

    if "senha" in dados:
        db_func.senha_hash = models.Funcionario.gerar_hash(dados["senha"])

    for campo in ("nome", "departamento", "nivel", "data_admissao"):
        if campo in dados:
            setattr(db_func, campo, dados[campo])

    db.commit()
    db.refresh(db_func)
    return db_func

# 5. EXCLUIR FUNCIONÁRIO
@app.delete("/api/funcionarios/{func_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_funcionario(func_id: int, db: Session = Depends(get_db)):
    db_func = db.query(models.Funcionario).filter(models.Funcionario.id == func_id).first()
    if not db_func:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado.")
    db.delete(db_func)
    db.commit()
    return None

# 6. DADOS DO DASHBOARD
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