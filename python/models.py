from sqlalchemy import Column, Integer, String
from database import Base
import bcrypt


class Funcionario(Base):
    __tablename__ = "funcionarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    cpf = Column(String, unique=True, index=True, nullable=False)
    departamento = Column(String, nullable=False)
    nivel = Column(String, nullable=True)
    data_admissao = Column(String, nullable=False)  # Armazenado como YYYY-MM-DD
    senha_hash = Column(String, nullable=False)

    def verificar_senha(self, senha: str) -> bool:
        senha_bytes = senha.encode("utf-8")[:72]
        hash_bytes = self.senha_hash.encode("utf-8")
        return bcrypt.checkpw(senha_bytes, hash_bytes)

    @staticmethod
    def gerar_hash(senha: str) -> str:
        senha_bytes = senha.encode("utf-8")[:72]
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(senha_bytes, salt).decode("utf-8")