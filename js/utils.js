// ============================================================
// utils.js — Estado global, persistência, navegação e toasts
// ============================================================

// ── ESTADO GLOBAL ──
let funcionarios = JSON.parse(localStorage.getItem('baycad_rh') || '[]');

// Dados de exemplo iniciais
if (funcionarios.length === 0) {
  funcionarios = [
    { id: 1, nome: 'Lucas Soares', cpf: '084.235.331-31', dept: 'TI', nivel: 'Júnior', data: '2026-03-02' },
  ];
  saveData();
}

/**
 * Persiste o array de funcionários no localStorage.
 */
function saveData() {
  localStorage.setItem('baycad_rh', JSON.stringify(funcionarios));
}

// ── NAVEGAÇÃO ──

/**
 * Alterna entre as telas (dashboard | funcionarios | cadastrar).
 * @param {string} screen - ID da tela de destino
 */
function navigate(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById('screen-' + screen).classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick').includes(screen)) n.classList.add('active');
  });

  if (screen === 'dashboard')    updateDashboard();
  if (screen === 'funcionarios') renderTabela();
}

// ── TOAST ──

/**
 * Exibe uma notificação temporária na tela.
 * @param {string} msg  - Mensagem a exibir
 * @param {'success'|'error'} type - Tipo visual do toast
 */
function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;

  const icon = type === 'success'
    ? `<svg width="16" height="16" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<svg width="16" height="16" fill="none" stroke="#ef4444" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  el.innerHTML = icon + msg;
  document.getElementById('toasts').appendChild(el);

  requestAnimationFrame(() => el.classList.add('show'));

  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 400);
  }, 3500);
}

// ── FORMATAÇÃO ──

/**
 * Converte data no formato YYYY-MM-DD para DD/MM/YYYY.
 * @param {string} d
 * @returns {string}
 */
function formatDate(d) {
  if (!d) return '—';
  const [y, m, dia] = d.split('-');
  return `${dia}/${m}/${y}`;
}