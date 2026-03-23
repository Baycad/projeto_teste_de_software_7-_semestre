// ============================================================
// cadastro.js — Formulário de cadastro, validações e salvamento
// ============================================================

// ── MÁSCARA ──

/**
 * Aplica a máscara 000.000.000-00 ao campo CPF conforme o usuário digita.
 * @param {HTMLInputElement} input
 */
function maskCPF(input) {
  let v = input.value.replace(/\D/g, '').slice(0, 11);
  if      (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/,        '$1.$2.$3');
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/,               '$1.$2');
  input.value = v;
}

// ── VALIDAÇÕES ──

/**
 * Valida um CPF usando o algoritmo dos dígitos verificadores.
 * Aceita CPF com ou sem máscara.
 * @param {string} cpf
 * @returns {boolean}
 */
function validarCPF(cpf) {
  const n = cpf.replace(/\D/g, '');
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

/**
 * Verifica se o CPF informado já está cadastrado no sistema.
 * @param {string} cpf
 * @returns {boolean}
 */
function cpfDuplicado(cpf) {
  const cpfNum = cpf.replace(/\D/g, '');
  return funcionarios.some(f => f.cpf.replace(/\D/g, '') === cpfNum);
}

// ── FEEDBACK DE CAMPOS ──

/**
 * Marca um campo como inválido e exibe a mensagem de erro.
 * @param {string} field  - Sufixo do ID do campo (ex: 'nome' → #f-nome, #err-nome)
 * @param {string} [msg]  - Mensagem de erro personalizada (opcional)
 */
function showErr(field, msg) {
  const input = document.getElementById('f-' + field);
  const err   = document.getElementById('err-' + field);
  if (input) input.classList.add('error');
  if (err)   { if (msg) err.textContent = msg; err.classList.add('show'); }
}

/**
 * Remove o estado de erro de um campo.
 * @param {string} field
 */
function clearErr(field) {
  const input = document.getElementById('f-' + field);
  const err   = document.getElementById('err-' + field);
  if (input) input.classList.remove('error');
  if (err)   err.classList.remove('show');
}

// ── SALVAR ──

/**
 * Coleta, valida e salva um novo funcionário.
 * Redireciona para a tela de Funcionários em caso de sucesso.
 */
function salvarFuncionario() {
  const nome  = document.getElementById('f-nome').value.trim();
  const cpf   = document.getElementById('f-cpf').value.trim();
  const dept  = document.getElementById('f-dept').value;
  const nivel = document.getElementById('f-nivel').value;
  const data  = document.getElementById('f-data').value;
  const senha = document.getElementById('f-senha').value;

  let valido = true;

  if (nome.length < 3) {
    showErr('nome');
    valido = false;
  }

  if (!validarCPF(cpf)) {
    showErr('cpf', 'CPF inválido.');
    valido = false;
  } else if (cpfDuplicado(cpf)) {
    showErr('cpf', 'CPF já cadastrado no sistema.');
    valido = false;
  }

  if (!dept) {
    showErr('dept');
    valido = false;
  }

  if (!data) {
    showErr('data');
    valido = false;
  }

  if (senha.length < 6) {
    showErr('senha');
    valido = false;
  }

  if (!valido) return;

  funcionarios.push({ id: Date.now(), nome, cpf, dept, nivel, data });
  saveData();
  resetForm();
  toast(`${nome} cadastrado com sucesso!`, 'success');
  setTimeout(() => window.location.href = 'funcionarios.html', 800);
}

// ── LIMPAR FORMULÁRIO ──

/**
 * Reseta todos os campos do formulário de cadastro para o estado inicial.
 */
function resetForm() {
  ['nome', 'cpf', 'data', 'senha'].forEach(field => {
    document.getElementById('f-' + field).value = '';
    clearErr(field);
  });
  document.getElementById('f-dept').value  = '';
  document.getElementById('f-nivel').value = 'Júnior';
  clearErr('dept');
} 