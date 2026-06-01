# 🧪 Testes Automatizados — Baycad RH

Três camadas de teste, do mais isolado ao mais realista:

| Camada | Arquivo | O que valida | Precisa de servidor? |
|--------|---------|--------------|----------------------|
| **Unitários** | `test_unit.py` | Lógica isolada: hash de senha, schemas Pydantic, normalização de CPF | ❌ Não |
| **API** | `test_api.py` | Endpoints REST com banco SQLite **em memória** (isolado) | ❌ Não |
| **E2E** | `test_e2e.py` | Fluxo no navegador real (frontend → API → banco) | ✅ Sim |

Total: **40 casos** (13 unitários · 21 de API · 6 E2E).

---

## Instalação

```powershell
pip install -r requirements-dev.txt
```

---

## Executando

### Unitários e de API (rápidos, sem servidor)
```powershell
pytest python/tests/test_unit.py python/tests/test_api.py -v
```
Usam um banco SQLite em memória criado a cada teste (fixtures em `conftest.py`),
portanto **não tocam** o `baycad_rh.db` real.

### E2E (navegador real)
Pré-requisitos — deixe os dois servidores no ar em terminais separados:
```powershell
# Terminal 1 — backend
python -m uvicorn main:app --app-dir python      # porta 8000

# Terminal 2 — frontend
python -m http.server 5500                        # porta 5500
```
Depois:
```powershell
pytest python/tests/test_e2e.py -v
```
Os testes E2E usam o **Google Chrome instalado** (`channel="chrome"`), sem baixar
binários. Cada teste gera um CPF válido aleatório e nomes só com letras para evitar
colisões. Se o Playwright não estiver instalado, os testes E2E são automaticamente
**ignorados** (skip), sem quebrar a suíte.

### Tudo de uma vez
```powershell
pytest          # lê o pytest.ini (testpaths = python/tests)
```

---

## Mapa dos casos de teste

**Unitários (`test_unit.py`)**
- UT-01..04 — hash BCrypt (não retorna texto puro, verifica correta/incorreta, salt)
- UT-05..09 — `FuncionarioCreate` (válido, nome curto, senha curta, CPF curto, nível default)
- UT-10..11 — `FuncionarioUpdate` (parcial e vazio)
- UT-12..13 — normalização de CPF (com e sem máscara)

**API (`test_api.py`)**
- API-01..04 — cadastro (sucesso, CPF duplicado, payload inválido, senha curta)
- API-05..08 — login (sucesso, CPF sem máscara, senha errada, CPF inexistente)
- API-09..12 — listagem (todos, filtro por depto, busca por nome, busca por CPF)
- API-13..17 — edição (parcial, troca de senha, CPF duplicado, inexistente, mantém senha)
- API-18..19 — exclusão (sucesso, inexistente)
- API-20..21 — dashboard (vazio, agregação por departamento)

**E2E (`test_e2e.py`)**
- E2E-01 — login inválido exibe erro
- E2E-02 — cadastro → login → dashboard
- E2E-03 — edição via modal
- E2E-04 — exclusão com confirmação
- E2E-05 — modal "Solicitar acesso"
- E2E-06 — logout
