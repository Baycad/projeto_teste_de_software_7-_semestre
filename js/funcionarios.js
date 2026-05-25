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

// Executa a primeira carga da tabela ao abrir a página
renderTabela();
