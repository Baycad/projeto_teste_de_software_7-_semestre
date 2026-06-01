"""
TESTES UNITÁRIOS — Baycad RH

Validam unidades isoladas de lógica, sem banco de dados nem HTTP:
- Hash de senha (models.Funcionario)
- Validação dos schemas Pydantic (schemas)
- Normalização de CPF (apenas dígitos)
"""
import pytest
from pydantic import ValidationError

import models
import schemas


# ─────────────────────────────────────────────────────────────
# UT-01 a UT-04 — Hash de senha (segurança)
# ─────────────────────────────────────────────────────────────
class TestHashSenha:
    def test_gerar_hash_nao_retorna_texto_puro(self):
        """UT-01: o hash gerado nunca deve ser igual à senha original."""
        senha = "senha123"
        hash_ = models.Funcionario.gerar_hash(senha)
        assert hash_ != senha
        assert len(hash_) > 0

    def test_verificar_senha_correta(self):
        """UT-02: senha correta deve ser validada contra o hash."""
        f = models.Funcionario(senha_hash=models.Funcionario.gerar_hash("senha123"))
        assert f.verificar_senha("senha123") is True

    def test_verificar_senha_incorreta(self):
        """UT-03: senha errada deve falhar na verificação."""
        f = models.Funcionario(senha_hash=models.Funcionario.gerar_hash("senha123"))
        assert f.verificar_senha("errada") is False

    def test_hashes_diferentes_para_mesma_senha(self):
        """UT-04: o salt do BCrypt produz hashes distintos para a mesma senha."""
        h1 = models.Funcionario.gerar_hash("senha123")
        h2 = models.Funcionario.gerar_hash("senha123")
        assert h1 != h2


# ─────────────────────────────────────────────────────────────
# UT-05 a UT-10 — Schemas Pydantic (validação de entrada)
# ─────────────────────────────────────────────────────────────
class TestSchemaCreate:
    def test_create_valido(self, ):
        """UT-05: payload completo e válido é aceito."""
        obj = schemas.FuncionarioCreate(
            nome="Maria Silva", cpf="52998224725", departamento="TI",
            nivel="Pleno", data_admissao="2024-01-15", senha="senha123",
        )
        assert obj.nome == "Maria Silva"

    def test_create_nome_curto_falha(self):
        """UT-06: nome com menos de 3 caracteres é rejeitado."""
        with pytest.raises(ValidationError):
            schemas.FuncionarioCreate(
                nome="Ma", cpf="52998224725", departamento="TI",
                data_admissao="2024-01-15", senha="senha123",
            )

    def test_create_senha_curta_falha(self):
        """UT-07: senha com menos de 6 caracteres é rejeitada."""
        with pytest.raises(ValidationError):
            schemas.FuncionarioCreate(
                nome="Maria Silva", cpf="52998224725", departamento="TI",
                data_admissao="2024-01-15", senha="123",
            )

    def test_create_cpf_curto_falha(self):
        """UT-08: CPF com menos de 11 caracteres é rejeitado."""
        with pytest.raises(ValidationError):
            schemas.FuncionarioCreate(
                nome="Maria Silva", cpf="123", departamento="TI",
                data_admissao="2024-01-15", senha="senha123",
            )

    def test_create_nivel_default(self):
        """UT-09: nível assume 'Júnior' quando não informado."""
        obj = schemas.FuncionarioCreate(
            nome="Maria Silva", cpf="52998224725", departamento="TI",
            data_admissao="2024-01-15", senha="senha123",
        )
        assert obj.nivel == "Júnior"


class TestSchemaUpdate:
    def test_update_parcial_permitido(self):
        """UT-10: FuncionarioUpdate aceita atualização parcial (só um campo)."""
        obj = schemas.FuncionarioUpdate(departamento="RH")
        enviados = obj.model_dump(exclude_unset=True)
        assert enviados == {"departamento": "RH"}

    def test_update_vazio_permitido(self):
        """UT-11: FuncionarioUpdate vazio não dispara erro (todos opcionais)."""
        obj = schemas.FuncionarioUpdate()
        assert obj.model_dump(exclude_unset=True) == {}


# ─────────────────────────────────────────────────────────────
# UT-12 — Normalização de CPF (apenas dígitos)
# ─────────────────────────────────────────────────────────────
class TestNormalizacaoCPF:
    @staticmethod
    def normalizar(cpf: str) -> str:
        # Mesma regra usada nas rotas de main.py
        return "".join(filter(str.isdigit, cpf))

    def test_remove_mascara(self):
        """UT-12: máscara do CPF é removida, restando só dígitos."""
        assert self.normalizar("529.982.247-25") == "52998224725"

    def test_ja_sem_mascara(self):
        """UT-13: CPF já sem máscara permanece inalterado."""
        assert self.normalizar("52998224725") == "52998224725"
