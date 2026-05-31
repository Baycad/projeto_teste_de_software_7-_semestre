from pydantic import BaseModel, Field, field_validator
from typing import Optional


class FuncionarioCreate(BaseModel):
    nome: str = Field(..., min_length=3, max_length=70)
    cpf: str                          # min/max removidos — o validator abaixo cuida disso
    departamento: str
    nivel: Optional[str] = "Júnior"
    data_admissao: str
    senha: str = Field(..., min_length=6)

    @field_validator("cpf")
    @classmethod
    def validar_cpf(cls, v):
        # Remove qualquer formatação (pontos, traços, espaços) antes de validar
        limpo = "".join(filter(str.isdigit, v))
        if len(limpo) != 11:
            raise ValueError("CPF deve conter 11 dígitos.")
        return limpo                  # Retorna já limpo para o main.py usar direto


class FuncionarioResponse(BaseModel):
    id: int
    nome: str
    cpf: str
    departamento: str
    nivel: Optional[str]
    data_admissao: str

    class Config:
        from_attributes = True