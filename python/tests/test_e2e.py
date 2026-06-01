"""
TESTES E2E (ponta a ponta) — Baycad RH

Exercitam o sistema pelo NAVEGADOR real (Playwright + Chrome), passando por
frontend → API → banco. Diferente dos testes de API/unitários, validam a
experiência do usuário: formulários, modais, navegação e mensagens na tela.

PRÉ-REQUISITOS para rodar:
  1. Backend no ar:   python -m uvicorn main:app --app-dir python   (porta 8000)
  2. Frontend no ar:  python -m http.server 5500                    (porta 5500)
  3. Playwright:      pip install playwright

Execução:
  pytest python/tests/test_e2e.py -v

Observação: estes testes criam (e excluem) dados no banco real do servidor em
execução. Cada teste usa um CPF válido gerado aleatoriamente para evitar colisões.
"""
import random
import re
import pytest

# Pula todos os testes deste arquivo se o Playwright não estiver instalado.
sync_api = pytest.importorskip("playwright.sync_api")
from playwright.sync_api import sync_playwright, expect  # noqa: E402

BASE = "http://127.0.0.1:5500/html"


def gerar_cpf():
    """Gera um CPF válido (com dígitos verificadores corretos), sem máscara."""
    n = [random.randint(0, 9) for _ in range(9)]
    for _ in range(2):
        s = sum((len(n) + 1 - i) * v for i, v in enumerate(n))
        d = (s * 10) % 11
        n.append(0 if d >= 10 else d)
    return "".join(map(str, n))


def mascarar(cpf):
    return f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}"


def nome_unico(prefixo):
    """Nome só com letras (sem dígitos) para busca textual confiável."""
    suf = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=5))
    return f"{prefixo} {suf}"


@pytest.fixture(scope="module")
def browser():
    with sync_playwright() as p:
        # channel="chrome" reutiliza o Google Chrome instalado (sem baixar binário)
        b = p.chromium.launch(channel="chrome", headless=True)
        yield b
        b.close()


@pytest.fixture
def page(browser):
    ctx = browser.new_context()
    pg = ctx.new_page()
    yield pg
    ctx.close()


def _cadastrar(page, nome, cpf, dept="TI", senha="senha123"):
    """Fluxo de cadastro pela tela, deixando o usuário na listagem."""
    page.goto(f"{BASE}/cadastro.html")
    page.fill("#f-nome", nome)
    page.fill("#f-cpf", cpf)
    page.select_option("#f-dept", dept)
    page.fill("#f-data", "2024-01-15")
    page.fill("#f-senha", senha)
    page.click("text=Salvar funcionário")
    page.wait_for_url("**/funcionarios.html", timeout=5000)


# ─────────────────────────────────────────────────────────────
# E2E-01 — Login inválido exibe mensagem de erro
# ─────────────────────────────────────────────────────────────
def test_login_invalido_mostra_erro(page):
    page.goto(f"{BASE}/login.html")
    page.fill("#l-cpf", "111.444.777-35")
    page.fill("#l-senha", "errada")
    page.click("text=Entrar")
    expect(page.locator("#err-login")).to_have_class(re.compile("visible"))


# ─────────────────────────────────────────────────────────────
# E2E-02 — Cadastro → Login → Dashboard (fluxo principal)
# ─────────────────────────────────────────────────────────────
def test_fluxo_cadastro_login_dashboard(page):
    cpf = gerar_cpf()
    nome = nome_unico("Fluxo")
    _cadastrar(page, nome, mascarar(cpf))

    # Login com o usuário recém-criado
    page.goto(f"{BASE}/login.html")
    page.fill("#l-cpf", mascarar(cpf))
    page.fill("#l-senha", "senha123")
    page.click("text=Entrar")

    # Deve cair no dashboard
    page.wait_for_url("**/index.html", timeout=5000)
    expect(page.locator(".page-title")).to_have_text("Dashboard")


# ─────────────────────────────────────────────────────────────
# E2E-03 — Edição de funcionário pelo modal
# ─────────────────────────────────────────────────────────────
def test_editar_funcionario(page):
    cpf = gerar_cpf()
    nome = nome_unico("Edicao")
    _cadastrar(page, nome, mascarar(cpf))

    page.goto(f"{BASE}/funcionarios.html")
    page.fill("#search-input", nome)

    # Auto-espera a linha do funcionário aparecer, depois clica em Editar nela
    row = page.locator("#tabela-body tr", has_text=nome)
    expect(row).to_be_visible()
    row.get_by_text("Editar").click()

    page.select_option("#e-dept", "RH")
    page.select_option("#e-nivel", "Sênior")
    page.click("text=Salvar alterações")

    # A linha deve refletir a alteração (departamento e nível)
    page.fill("#search-input", nome)
    row = page.locator("#tabela-body tr", has_text=nome)
    expect(row).to_contain_text("RH")
    expect(row).to_contain_text("Sênior")


# ─────────────────────────────────────────────────────────────
# E2E-04 — Exclusão de funcionário com confirmação
# ─────────────────────────────────────────────────────────────
def test_excluir_funcionario(page):
    cpf = gerar_cpf()
    nome = nome_unico("Exclusao")
    _cadastrar(page, nome, mascarar(cpf))

    page.goto(f"{BASE}/funcionarios.html")
    page.fill("#search-input", nome)

    row = page.locator("#tabela-body tr", has_text=nome)
    expect(row).to_be_visible()
    row.get_by_text("Excluir").click()
    page.click("text=Sim, excluir")  # confirma no modal

    # Após excluir, a busca pelo nome não deve mais encontrar o registro
    page.fill("#search-input", nome)
    expect(page.locator("#tabela-body tr", has_text=nome)).to_have_count(0)


# ─────────────────────────────────────────────────────────────
# E2E-05 — Modal "Solicitar acesso" exibe confirmação
# ─────────────────────────────────────────────────────────────
def test_solicitar_acesso(page):
    page.goto(f"{BASE}/login.html")
    page.click("text=Solicitar acesso")
    expect(page.locator("#modal-solicitar")).to_have_class(__import__("re").compile("open"))

    page.fill("#s-nome", "Candidato E2E")
    page.fill("#s-cpf", "111.444.777-35")
    page.fill("#s-email", "candidato@empresa.com")
    page.select_option("#s-dept", "TI")
    page.click("text=Enviar solicitação")

    expect(page.locator("#solicitar-sucesso")).to_be_visible()
    expect(page.locator("text=Solicitação enviada!")).to_be_visible()


# ─────────────────────────────────────────────────────────────
# E2E-06 — Logout volta para a tela de login
# ─────────────────────────────────────────────────────────────
def test_logout(page):
    page.goto(f"{BASE}/index.html")
    page.click("text=Sair")
    page.wait_for_url("**/login.html", timeout=5000)
    expect(page.locator("text=Acesso ao Sistema")).to_be_visible()
