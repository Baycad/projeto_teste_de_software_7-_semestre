from sqlalchemy import Column, Integer, String
from database import Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Funcionario(Base):
    __tablename__ = "funcionarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    cpf = Column(String, unique=True, index=True, nullable=False)
    departamento = Column(String, nullable=False)
    nivel = Column(String, nullable=True)
    data_admissao = Column(String, nullable=False) # Armazenado como YYYY-MM-DD
    senha_hash = Column(String, nullable=False)

    def verificar_senha(self, senha: str):
        return pwd_context.verify(senha, self.senha_hash)

    @staticmethod
    def gerar_hash(senha: str):
        return pwd_context.hash(senha)