// ============================================================
// funcionarios.js — Listagem, busca, filtro e exclusão
// ============================================================

let _deleteId = null;

// ── TABELA ──

/**
 * Renderiza a tabela de funcionários aplicando busca e filtro de departamento.
 * Chamado a cada input no campo de busca ou mudança no filtro.
 */
function renderTabela() {
  const filtered = _filtrarFuncionarios();
  const tbody    = document.getElementById('tabela-body');
  const empty    = document.getElementById('tabela-empty');

  if (filtered.length === 0) {
    tbody.innerHTML    = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  tbody.innerHTML = filtered.map(_buildRow).join('');
}

/**
 * Filtra o array global `funcionarios` pela busca e pelo departamento selecionado.
 * @private
 * @returns {Array} funcionários filtrados
 */
function _filtrarFuncionarios() {
  const query = document.getElementById('search-input').value
    .toLowerCase()
    .replace(/[.\-]/g, '');
  const dept = document.getElementById('filter-dept').value;

  return funcionarios.filter(f => {
    const cpfLimpo   = f.cpf.replace(/[.\-]/g, '');
    const matchBusca = !query || f.nome.toLowerCase().includes(query) || cpfLimpo.includes(query);
    const matchDept  = !dept  || f.dept === dept;
    return matchBusca && matchDept;
  });
}

/**
 * Monta o HTML de uma linha da tabela.
 * @private
 * @param {Object} f - Funcionário
 * @returns {string} HTML da <tr>
 */
function _buildRow(f) {
  const deptClass = f.dept.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return `
    <tr>
      <td><strong>${f.nome}</strong></td>
      <td class="cpf-cell">${f.cpf}</td>
      <td><span class="badge badge-${deptClass}">${f.dept}</span></td>
      <td><span class="nivel-badge">${f.nivel}</span></td>
      <td style="color:var(--text-muted);font-size:13px">${formatDate(f.data)}</td>
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

/**
 * Limpa os campos de busca e filtro e re-renderiza a tabela.
 */
function clearFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('filter-dept').value  = '';
  renderTabela();
}

// ── EXCLUSÃO ──

/**
 * Abre o modal de confirmação de exclusão para o funcionário informado.
 * @param {number} id - ID do funcionário
 */
function excluir(id) {
  _deleteId = id;
  const f   = funcionarios.find(x => x.id === id);
  document.getElementById('modal-nome').textContent = f ? f.nome : '';
  document.getElementById('modal-excluir').classList.add('open');
}

/**
 * Confirma e executa a exclusão do funcionário selecionado.
 * Atualiza tabela e dashboard após a operação.
 */
function confirmarExclusao() {
  funcionarios = funcionarios.filter(f => f.id !== _deleteId);
  saveData();
  closeModal();
  renderTabela();
  updateDashboard();
  toast('Funcionário excluído com sucesso.', 'success');
}

/**
 * Fecha o modal de confirmação de exclusão.
 */
function closeModal() {
  document.getElementById('modal-excluir').classList.remove('open');
  _deleteId = null;
}

// Fecha o modal ao clicar no overlay
document.getElementById('modal-excluir').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});