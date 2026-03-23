// ============================================================
// dashboard.js — Métricas e distribuição por departamento
// ============================================================

const DEPT_LIST   = ['TI', 'RH', 'Financeiro', 'Comercial', 'Operações'];
const DEPT_COLORS = ['success', 'warn', '', '', ''];

/**
 * Atualiza todos os elementos do Dashboard com os dados atuais.
 * Chamado ao navegar para a tela de dashboard e após exclusões.
 */
function updateDashboard() {
  _renderTotal();
  _renderDeptCards();
  _renderDeptBreakdown();
}

/**
 * Renderiza o card de total de funcionários.
 * @private
 */
function _renderTotal() {
  document.getElementById('dash-total').textContent = funcionarios.length;
}

/**
 * Renderiza os cards de contagem por departamento dentro do stats-grid.
 * @private
 */
function _renderDeptCards() {
  const counts    = _countByDept();
  const container = document.getElementById('dept-cards-container');
  container.innerHTML = '';

  DEPT_LIST.forEach((dept, i) => {
    const card = document.createElement('div');
    card.className = `stat-card ${DEPT_COLORS[i] || ''}`;
    card.innerHTML = `
      <div class="stat-label">Depto. ${dept}</div>
      <div class="stat-value">${counts[dept] || 0}</div>
      <div class="stat-badge">funcionários</div>
    `;
    container.appendChild(card);
  });
}

/**
 * Renderiza as pills de distribuição por departamento.
 * @private
 */
function _renderDeptBreakdown() {
  const counts    = _countByDept();
  const breakdown = document.getElementById('dept-breakdown');
  breakdown.innerHTML = '';

  DEPT_LIST.forEach(dept => {
    const pill = document.createElement('div');
    pill.className = 'dept-pill';
    pill.innerHTML = `
      <div class="dept-pill-label">${dept}</div>
      <div class="dept-pill-count">${counts[dept] || 0}</div>
    `;
    breakdown.appendChild(pill);
  });
}

/**
 * Retorna um objeto { [dept]: count } com a contagem de funcionários por departamento.
 * @private
 * @returns {Object.<string, number>}
 */
function _countByDept() {
  return funcionarios.reduce((acc, f) => {
    acc[f.dept] = (acc[f.dept] || 0) + 1;
    return acc;
  }, {});
}

// ── INIT ──
updateDashboard();