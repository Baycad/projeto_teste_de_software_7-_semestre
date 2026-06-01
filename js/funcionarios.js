// ============================================================
// funcionarios.js — Listagem, busca, filtro e exclusão
// ============================================================

let _deleteId = null;

/**
 * Renderiza a tabela buscando os dados em tempo real da API com filtros
 */
async function renderTabela() {
  const busca = document.getElementById("search-input").value;
  const dept = document.getElementById("filter-dept").value;

  // Constrói os parâmetros dinâmicos de busca para a API
  let url = `${API_URL}/funcionarios?`;
  if (busca) url += `busca=${encodeURIComponent(busca)}&`;
  if (dept) url += `dept=${encodeURIComponent(dept)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erro ao listar funcionários");

    // Atualiza a lista global localmente para fins de consulta do Modal
    funcionarios = await response.json();

    const tbody = document.getElementById("tabela-body");
    const empty = document.getElementById("tabela-empty");

    if (funcionarios.length === 0) {
      tbody.innerHTML = "";
      empty.style.display = "block";
      return;
    }

    empty.style.display = "none";
    tbody.innerHTML = funcionarios.map(_buildRow).join("");
  } catch (error) {
    console.error("Erro na tabela:", error);
  }
}

function _buildRow(f) {
  // Trata o departamento mapeado do backend ("departamento")
  const deptClass = f.departamento
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return `
    <tr>
      <td><strong>${f.nome}</strong></td>
      <td class="cpf-cell">${f.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</td>
      <td><span class="badge badge-${deptClass}">${f.departamento}</span></td>
      <td><span class="nivel-badge">${f.nivel || "Júnior"}</span></td>
      <td style="color:var(--text-muted);font-size:13px">${formatDate(f.data_admissao)}</td>
      <td style="text-align:right">
        <button class="btn btn-ghost" onclick="editar(${f.id})">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Editar
        </button>
        <button class="btn btn-danger" onclick="excluir(${f.id})">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
          Excluir
        </button>
      </td>
    </tr>
  `;
}

function clearFilters() {
  document.getElementById("search-input").value = "";
  document.getElementById("filter-dept").value = "";
  renderTabela();
}

// ── EXCLUSÃO (Consumindo DELETE da API) ──

function excluir(id) {
  _deleteId = id;
  const f = funcionarios.find((x) => x.id === id);
  document.getElementById("modal-nome").textContent = f ? f.nome : "";
  document.getElementById("modal-excluir").classList.add("open");
}

async function confirmarExclusao() {
  if (!_deleteId) return;

  try {
    const response = await fetch(`${API_URL}/funcionarios/${_deleteId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      closeModal();
      renderTabela();
      toast("Funcionário excluído com sucesso.", "success");
    } else {
      toast("Não foi possível excluir o funcionário.", "error");
    }
  } catch (error) {
    console.error("Erro ao deletar:", error);
    toast("Erro de conexão com o servidor.", "error");
  }
}

function closeModal() {
  document.getElementById("modal-excluir").classList.remove("open");
  _deleteId = null;
}

document
  .getElementById("modal-excluir")
  .addEventListener("click", function (e) {
    if (e.target === this) closeModal();
  });

// ── EDIÇÃO (Consumindo PUT da API) ──

let _editId = null;

// Helpers de máscara, validação e erros (reutilizados pelo modal de edição)
function maskCPF(input) {
  let v = input.value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 9)
    v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/, "$1.$2");
  input.value = v;
}

function validarCPF(cpf) {
  const n = cpf.replace(/\D/g, "");
  if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += +n[i] * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== +n[9]) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += +n[i] * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === +n[10];
}

function showErr(field, msg) {
  const el = document.getElementById(`err-${field}`);
  if (el) {
    if (msg) el.textContent = msg;
    el.classList.add("visible");
  }
}

function clearErr(field) {
  const el = document.getElementById(`err-${field}`);
  if (el) el.classList.remove("visible");
}

// Abre o modal já preenchido com os dados do funcionário selecionado
function editar(id) {
  const f = funcionarios.find((x) => x.id === id);
  if (!f) return;
  _editId = id;

  document.getElementById("e-nome").value = f.nome;
  document.getElementById("e-cpf").value = f.cpf.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    "$1.$2.$3-$4"
  );
  document.getElementById("e-dept").value = f.departamento;
  document.getElementById("e-nivel").value = f.nivel || "Júnior";
  document.getElementById("e-data").value = f.data_admissao;
  document.getElementById("e-senha").value = "";

  document
    .querySelectorAll("#modal-editar .field-error")
    .forEach((el) => el.classList.remove("visible"));

  document.getElementById("modal-editar").classList.add("open");
}

function closeEditModal() {
  document.getElementById("modal-editar").classList.remove("open");
  _editId = null;
}

async function salvarEdicao() {
  if (!_editId) return;

  const nome = document.getElementById("e-nome").value.trim();
  const cpf = document.getElementById("e-cpf").value.trim();
  const departamento = document.getElementById("e-dept").value;
  const nivel = document.getElementById("e-nivel").value;
  const data_admissao = document.getElementById("e-data").value;
  const senha = document.getElementById("e-senha").value;

  let valido = true;

  if (nome.length < 3) {
    showErr("e-nome");
    valido = false;
  }
  if (!validarCPF(cpf)) {
    showErr("e-cpf", "CPF inválido.");
    valido = false;
  }
  if (!departamento) {
    showErr("e-dept");
    valido = false;
  }
  if (!data_admissao) {
    showErr("e-data");
    valido = false;
  }
  // Senha é opcional na edição, mas se preenchida deve ter ao menos 6 caracteres
  if (senha && senha.length < 6) {
    showErr("e-senha");
    valido = false;
  }

  if (!valido) return;

  const payload = { nome, cpf, departamento, nivel, data_admissao };
  if (senha) payload.senha = senha;

  try {
    const response = await fetch(`${API_URL}/funcionarios/${_editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      closeEditModal();
      renderTabela();
      toast("Funcionário atualizado com sucesso.", "success");
    } else {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 400 && errorData.detail === "CPF já cadastrado.") {
        showErr("e-cpf", "CPF já cadastrado no sistema.");
      } else {
        toast(errorData.detail || "Não foi possível atualizar.", "error");
      }
    }
  } catch (error) {
    console.error("Erro ao atualizar:", error);
    toast("Erro de conexão com o servidor.", "error");
  }
}

document
  .getElementById("modal-editar")
  .addEventListener("click", function (e) {
    if (e.target === this) closeEditModal();
  });

// Executa a primeira carga da tabela ao abrir a página
renderTabela();
