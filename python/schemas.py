from pydantic import BaseModel, Field
from typing import Optional

class FuncionarioCreate(BaseModel):
    nome: str = Field(..., min_length=3, max_length=70)
    cpf: str = Field(..., min_length=11, max_length=14)
    departamento: str
    nivel: Optional[str] = "Júnior"
    data_admissao: str
    senha: str = Field(..., min_length=6)

class FuncionarioUpdate(BaseModel):
    # Todos os campos são opcionais: atualiza apenas o que for enviado
    nome: Optional[str] = Field(None, min_length=3, max_length=70)
    cpf: Optional[str] = Field(None, min_length=11, max_length=14)
    departamento: Optional[str] = None
    nivel: Optional[str] = None
    data_admissao: Optional[str] = None
    senha: Optional[str] = Field(None, min_length=6)

class FuncionarioResponse(BaseModel):
    id: int
    nome: str
    cpf: str
    departamento: str
    nivel: Optional[str]
    data_admissao: str

    class Config:
        from_attributes = True