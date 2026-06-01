"""
TESTES DE API — Baycad RH

Exercitam os endpoints REST de ponta a ponta (HTTP → rota → banco isolado),
usando o TestClient do FastAPI. Cobrem login, CRUD de funcionários e dashboard.
"""


def _criar(client, payload):
    return client.post("/api/funcionarios", json=payload)


# ─────────────────────────────────────────────────────────────
# API-01 a API-04 — Cadastro
# ─────────────────────────────────────────────────────────────
class TestCadastro:
    def test_cadastro_sucesso(self, client, funcionario_payload):
        """API-01: cadastro válido retorna 201 e o CPF é salvo só com dígitos."""
        r = _criar(client, funcionario_payload)
        assert r.status_code == 201
        body = r.json()
        assert body["nome"] == "Maria Silva"
        assert body["cpf"] == "52998224725"  # máscara removida
        assert "senha" not in body and "senha_hash" not in body

    def test_cadastro_cpf_duplicado(self, client, funcionario_payload):
        """API-02: cadastrar o mesmo CPF duas vezes retorna 400."""
        _criar(client, funcionario_payload)
        r = _criar(client, funcionario_payload)
        assert r.status_code == 400
        assert r.json()["detail"] == "CPF já cadastrado."

    def test_cadastro_payload_invalido(self, client):
        """API-03: payload sem campos obrigatórios retorna 422 (validação)."""
        r = client.post("/api/funcionarios", json={"nome": "X"})
        assert r.status_code == 422

    def test_cadastro_senha_curta(self, client, funcionario_payload):
        """API-04: senha com menos de 6 caracteres retorna 422."""
        funcionario_payload["senha"] = "123"
        r = _criar(client, funcionario_payload)
        assert r.status_code == 422


# ─────────────────────────────────────────────────────────────
# API-05 a API-08 — Login
# ─────────────────────────────────────────────────────────────
class TestLogin:
    def test_login_sucesso(self, client, funcionario_payload):
        """API-05: login com CPF e senha corretos retorna 200 e dados básicos."""
        _criar(client, funcionario_payload)
        r = client.post("/api/login", json={"cpf": "529.982.247-25", "senha": "senha123"})
        assert r.status_code == 200
        body = r.json()
        assert body["nome"] == "Maria Silva"
        assert body["departamento"] == "TI"

    def test_login_cpf_sem_mascara(self, client, funcionario_payload):
        """API-06: login aceita CPF sem máscara (normalização)."""
        _criar(client, funcionario_payload)
        r = client.post("/api/login", json={"cpf": "52998224725", "senha": "senha123"})
        assert r.status_code == 200

    def test_login_senha_errada(self, client, funcionario_payload):
        """API-07: senha incorreta retorna 401."""
        _criar(client, funcionario_payload)
        r = client.post("/api/login", json={"cpf": "52998224725", "senha": "errada"})
        assert r.status_code == 401

    def test_login_cpf_inexistente(self, client):
        """API-08: CPF não cadastrado retorna 401."""
        r = client.post("/api/login", json={"cpf": "11144477735", "senha": "qualquer"})
        assert r.status_code == 401


# ─────────────────────────────────────────────────────────────
# API-09 a API-12 — Listagem, busca e filtro
# ─────────────────────────────────────────────────────────────
class TestListagem:
    def _seed(self, client):
        _criar(client, {"nome": "Maria Silva", "cpf": "52998224725", "departamento": "TI",
                        "nivel": "Pleno", "data_admissao": "2024-01-15", "senha": "senha123"})
        _criar(client, {"nome": "Joao Souza", "cpf": "16899535009", "departamento": "RH",
                        "nivel": "Junior", "data_admissao": "2024-02-10", "senha": "senha123"})

    def test_listar_todos(self, client):
        """API-09: lista todos os funcionários cadastrados."""
        self._seed(client)
        r = client.get("/api/funcionarios")
        assert r.status_code == 200
        assert len(r.json()) == 2

    def test_filtro_por_departamento(self, client):
        """API-10: filtro por departamento retorna apenas o setor pedido."""
        self._seed(client)
        r = client.get("/api/funcionarios", params={"dept": "RH"})
        assert len(r.json()) == 1
        assert r.json()[0]["nome"] == "Joao Souza"

    def test_busca_por_nome(self, client):
        """API-11: busca textual filtra por nome."""
        self._seed(client)
        r = client.get("/api/funcionarios", params={"busca": "Maria"})
        assert len(r.json()) == 1
        assert r.json()[0]["nome"] == "Maria Silva"

    def test_busca_por_cpf(self, client):
        """API-12: busca numérica filtra por CPF."""
        self._seed(client)
        r = client.get("/api/funcionarios", params={"busca": "168"})
        assert len(r.json()) == 1
        assert r.json()[0]["cpf"] == "16899535009"


# ─────────────────────────────────────────────────────────────
# API-13 a API-17 — Edição (PUT)
# ─────────────────────────────────────────────────────────────
class TestEdicao:
    def test_edicao_parcial(self, client, funcionario_payload):
        """API-13: atualização parcial altera só os campos enviados."""
        fid = _criar(client, funcionario_payload).json()["id"]
        r = client.put(f"/api/funcionarios/{fid}", json={"departamento": "RH", "nivel": "Sênior"})
        assert r.status_code == 200
        body = r.json()
        assert body["departamento"] == "RH"
        assert body["nivel"] == "Sênior"
        assert body["nome"] == "Maria Silva"  # inalterado

    def test_edicao_troca_senha_permite_login(self, client, funcionario_payload):
        """API-14: ao trocar a senha, o login passa a usar a nova."""
        fid = _criar(client, funcionario_payload).json()["id"]
        client.put(f"/api/funcionarios/{fid}", json={"senha": "novaSenha9"})
        assert client.post("/api/login", json={"cpf": "52998224725", "senha": "novaSenha9"}).status_code == 200
        assert client.post("/api/login", json={"cpf": "52998224725", "senha": "senha123"}).status_code == 401

    def test_edicao_cpf_duplicado(self, client):
        """API-15: trocar para um CPF já usado por outro funcionário retorna 400."""
        _criar(client, {"nome": "Maria Silva", "cpf": "52998224725", "departamento": "TI",
                        "data_admissao": "2024-01-15", "senha": "senha123"})
        fid2 = _criar(client, {"nome": "Joao Souza", "cpf": "16899535009", "departamento": "RH",
                               "data_admissao": "2024-02-10", "senha": "senha123"}).json()["id"]
        r = client.put(f"/api/funcionarios/{fid2}", json={"cpf": "52998224725"})
        assert r.status_code == 400
        assert r.json()["detail"] == "CPF já cadastrado."

    def test_edicao_inexistente(self, client):
        """API-16: editar ID inexistente retorna 404."""
        r = client.put("/api/funcionarios/999", json={"nome": "Fulano"})
        assert r.status_code == 404

    def test_edicao_mantem_senha_quando_omitida(self, client, funcionario_payload):
        """API-17: editar sem enviar senha mantém a senha original."""
        fid = _criar(client, funcionario_payload).json()["id"]
        client.put(f"/api/funcionarios/{fid}", json={"nivel": "Sênior"})
        assert client.post("/api/login", json={"cpf": "52998224725", "senha": "senha123"}).status_code == 200


# ─────────────────────────────────────────────────────────────
# API-18 a API-19 — Exclusão (DELETE)
# ─────────────────────────────────────────────────────────────
class TestExclusao:
    def test_exclusao_sucesso(self, client, funcionario_payload):
        """API-18: exclusão retorna 204 e remove o registro."""
        fid = _criar(client, funcionario_payload).json()["id"]
        r = client.delete(f"/api/funcionarios/{fid}")
        assert r.status_code == 204
        assert len(client.get("/api/funcionarios").json()) == 0

    def test_exclusao_inexistente(self, client):
        """API-19: excluir ID inexistente retorna 404."""
        assert client.delete("/api/funcionarios/999").status_code == 404


# ─────────────────────────────────────────────────────────────
# API-20 a API-21 — Dashboard
# ─────────────────────────────────────────────────────────────
class TestDashboard:
    def test_dashboard_vazio(self, client):
        """API-20: dashboard sem dados retorna total 0."""
        r = client.get("/api/dashboard")
        assert r.status_code == 200
        assert r.json()["total"] == 0

    def test_dashboard_agrega_por_departamento(self, client):
        """API-21: dashboard agrega total e contagem por departamento."""
        _criar(client, {"nome": "Maria Silva", "cpf": "52998224725", "departamento": "TI",
                        "data_admissao": "2024-01-15", "senha": "senha123"})
        _criar(client, {"nome": "Joao Souza", "cpf": "16899535009", "departamento": "RH",
                        "data_admissao": "2024-02-10", "senha": "senha123"})
        body = client.get("/api/dashboard").json()
        assert body["total"] == 2
        assert body["por_departamento"]["TI"] == 1
        assert body["por_departamento"]["RH"] == 1
