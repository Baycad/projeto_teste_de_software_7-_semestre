# 🐞 Relatório de Erros e Evidências — Baycad RH

**Disciplina:** Teste de Software — 7º Semestre
**Data:** 01/06/2026
**Tipo:** Teste de validação / tratamento de erros (testes negativos)
**Metodologia:** Cenários de erro forçados automaticamente pelo navegador (Playwright + Google Chrome), com captura de evidências (screenshots) antes e depois da correção.

---

## 1. Resumo Executivo

Foram forçados **7 cenários de erro/validação** na interface. A execução revelou um
**defeito real (DEF-01)**: embora a lógica de validação funcione (o sistema bloqueia
ações inválidas), **as mensagens de erro nunca eram exibidas ao usuário**, deixando-o
sem qualquer feedback sobre o que estava errado.

O defeito foi **identificado, documentado, corrigido e reverificado**. Após a correção,
todas as mensagens passaram a aparecer corretamente.

| Item | Resultado |
|------|-----------|
| Cenários executados | 7 |
| Defeitos encontrados | 1 (DEF-01) — afeta 6 cenários |
| Severidade | **Alta** (usabilidade / feedback ao usuário) |
| Status | ✅ **Corrigido e reverificado** |

---

## 2. Ambiente de Teste

| Componente | Configuração |
|------------|--------------|
| Frontend | `http://127.0.0.1:5500` (servidor estático) |
| Backend | `http://127.0.0.1:8000` (FastAPI + Uvicorn) |
| Navegador | Google Chrome (headless), via Playwright |
| Resolução | 1366×820, escala 2× |
| Dados base | Lucas Fortuna (CPF 090.322.723-14), joao lima (CPF 067.417.581-60) |

---

## 3. Defeito Encontrado

### DEF-01 — Mensagens de validação não são exibidas

| Campo | Descrição |
|-------|-----------|
| **ID** | DEF-01 |
| **Título** | Mensagens de erro (`.field-error`) nunca aparecem na tela |
| **Severidade** | Alta |
| **Prioridade** | Alta |
| **Telas afetadas** | Login, Cadastro (todas as validações) e Edição |
| **Status** | Corrigido |

**Descrição:**
Ao submeter formulários com dados inválidos, o sistema corretamente **bloqueia** o
envio, porém **não mostra nenhuma mensagem** explicando o motivo. O usuário fica sem
feedback — o botão "não faz nada" aparentemente.

**Causa raiz (root cause):**
Divergência entre o nome da classe CSS e a classe manipulada pelo JavaScript:

- O **JavaScript** (em `login.js`, `cadastro.js` e `funcionarios.js`) adiciona a classe
  **`visible`** ao elemento de erro:
  ```js
  el.classList.add("visible");
  ```
- O **CSS** (`html/css/style.css`) só tornava o erro visível com a classe **`show`**:
  ```css
  .field-error { display: none; }
  .field-error.show { display: block; }   /* ← classe errada */
  ```

Como `visible` ≠ `show`, o elemento recebia a classe mas permanecia `display: none`.

**Correção aplicada** (`html/css/style.css`):
```css
.field-error.show,
.field-error.visible { display: block; }
```

**Evidência:** ver Seção 4 (comparativo antes × depois de cada cenário).

---

## 4. Cenários de Teste e Evidências

> Em cada cenário, a coluna **Antes** mostra o comportamento defeituoso (sem mensagem)
> e a coluna **Depois** mostra o resultado após a correção (mensagem visível).
> As imagens estão em `evidencias/antes/` e `evidencias/depois/`.

### CT-ERRO-01 — Login com credenciais inválidas
- **Passos:** informar CPF não cadastrado + senha qualquer → clicar em **Entrar**.
- **Esperado:** exibir "CPF ou senha incorretos.".
- **Antes:** nenhuma mensagem (DEF-01). **Depois:** mensagem exibida. ✅

| Antes | Depois |
|-------|--------|
| ![](evidencias/antes/erro01_login_invalido.png) | ![](evidencias/depois/erro01_login_invalido.png) |

### CT-ERRO-02 — Cadastro com campos obrigatórios vazios
- **Passos:** abrir Cadastro → clicar em **Salvar funcionário** sem preencher nada.
- **Esperado:** erros em Nome, CPF, Departamento, Data e Senha.
- **Antes:** nenhuma mensagem (DEF-01). **Depois:** todos os erros exibidos. ✅

| Antes | Depois |
|-------|--------|
| ![](evidencias/antes/erro02_campos_obrigatorios.png) | ![](evidencias/depois/erro02_campos_obrigatorios.png) |

### CT-ERRO-03 — Cadastro com CPF inválido
- **Passos:** preencher dados válidos, mas CPF `111.111.111-11` (dígitos repetidos).
- **Esperado:** "CPF inválido.".
- **Antes:** nenhuma mensagem (DEF-01). **Depois:** mensagem exibida. ✅

| Antes | Depois |
|-------|--------|
| ![](evidencias/antes/erro03_cpf_invalido.png) | ![](evidencias/depois/erro03_cpf_invalido.png) |

### CT-ERRO-04 — Cadastro com senha curta
- **Passos:** preencher dados válidos, mas senha com menos de 6 caracteres.
- **Esperado:** "A senha deve ter ao menos 6 caracteres.".
- **Antes:** nenhuma mensagem (DEF-01). **Depois:** mensagem exibida. ✅

| Antes | Depois |
|-------|--------|
| ![](evidencias/antes/erro04_senha_curta.png) | ![](evidencias/depois/erro04_senha_curta.png) |

### CT-ERRO-05 — Cadastro com CPF já existente
- **Passos:** cadastrar com o CPF do Lucas Fortuna (`090.322.723-14`).
- **Esperado:** "CPF já cadastrado no sistema." (resposta 400 da API).
- **Antes:** nenhuma mensagem (DEF-01). **Depois:** mensagem exibida. ✅

| Antes | Depois |
|-------|--------|
| ![](evidencias/antes/erro05_cpf_duplicado.png) | ![](evidencias/depois/erro05_cpf_duplicado.png) |

### CT-ERRO-06 — Edição com nova senha curta
- **Passos:** editar um funcionário e informar nova senha com menos de 6 caracteres.
- **Esperado:** "A senha deve ter ao menos 6 caracteres." no modal.
- **Antes:** nenhuma mensagem (DEF-01). **Depois:** mensagem exibida. ✅

| Antes | Depois |
|-------|--------|
| ![](evidencias/antes/erro06_edicao_senha_curta.png) | ![](evidencias/depois/erro06_edicao_senha_curta.png) |

### CT-ERRO-07 — Listagem com busca sem resultados
- **Passos:** buscar um termo inexistente na tela de Funcionários.
- **Esperado:** estado vazio "Nenhum funcionário encontrado.".
- **Resultado:** ✅ **funciona corretamente** — este cenário **não** é afetado pelo
  DEF-01, pois usa um mecanismo próprio (`#tabela-empty`), independente de `.field-error`.

| Antes | Depois |
|-------|--------|
| ![](evidencias/antes/erro07_busca_sem_resultado.png) | ![](evidencias/depois/erro07_busca_sem_resultado.png) |

---

## 5. Conclusão

O teste negativo cumpriu seu objetivo: ao forçar entradas inválidas, expôs um defeito
de **usabilidade de alto impacto** (DEF-01) que passaria despercebido em um teste de
"caminho feliz". A validação de regras de negócio estava correta, mas o **feedback ao
usuário estava quebrado** por uma simples divergência de nome de classe entre CSS e JS.

Após a correção de uma linha no CSS, **6 dos 7 cenários** passaram a exibir as mensagens
esperadas; o 7º já funcionava por usar outro mecanismo. Todos os cenários foram
**reverificados com evidência**.

**Recomendação adicional:** padronizar o nome da classe (`visible`) em CSS e JS e
adicionar um teste automatizado que verifique a *visibilidade real* das mensagens de
erro (e não apenas a presença da classe no DOM), evitando regressões futuras.
