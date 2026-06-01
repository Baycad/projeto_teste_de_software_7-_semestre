// ============================================================
// dashboard.js — Métricas e distribuição por departamento
// ============================================================

const DEPT_LIST = ["TI", "RH", "Financeiro", "Comercial", "Operações"];
const DEPT_COLORS = ["success", "warn", "", "", ""];

/**
 * Busca dados consolidados no backend e renderiza a tela
 */
async function updateDashboard() {
  try {
    const response = await fetch(`${API_URL}/dashboard`);
    if (!response.ok) throw new Error("Erro ao buscar dados do dashboard");

    const data = await response.json(); // { total: X, por_departamento: {...} }

    _renderTotal(data.total);
    _renderDeptCards(data.por_departamento);
    _renderDeptBreakdown(data.por_departamento);
  } catch (error) {
    console.error("Erro no dashboard:", error);
  }
}

function _renderTotal(total) {
  document.getElementById("dash-total").textContent = total;
}

function _renderDeptCards(por_departamento) {
  const container = document.getElementById("dept-cards-container");
  container.innerHTML = "";

  DEPT_LIST.forEach((dept, i) => {
    const qtd = por_departamento[dept] || 0;
    const card = document.createElement("div");
    card.className = `stat-card ${DEPT_COLORS[i] || ""}`;
    card.innerHTML = `
      <div class="stat-label">Depto. ${dept}</div>
      <div class="stat-value">${qtd}</div>
      <div class="stat-badge">funcionários</div>
    `;
    container.appendChild(card);
  });
}

function _renderDeptBreakdown(por_departamento) {
  const breakdown = document.getElementById("dept-breakdown");
  breakdown.innerHTML = "";

  DEPT_LIST.forEach((dept) => {
    const qtd = por_departamento[dept] || 0;
    const pill = document.createElement("div");
    pill.className = "dept-pill";
    pill.innerHTML = `
      <div class="dept-pill-label">${dept}</div>
      <div class="dept-pill-count">${qtd}</div>
    `;
    breakdown.appendChild(pill);
  });
}

// ── INIT ──
updateDashboard();
