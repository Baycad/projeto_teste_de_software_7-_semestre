// ============================================================
// cadastro.js — Formulário de cadastro, validações e salvamento
// ============================================================

// ── MÁSCARA ──
function maskCPF(input) {
  let v = input.value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 9)
    v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/, "$1.$2");
  input.value = v;
}

// ── VALIDAÇÕES ──
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
  const input = document.getElementById("f-" + field);
  const err = document.getElementById("err-" + field);
  if (input) input.classList.add("error");
  if (err) {
    if (msg) err.textContent = msg;
    err.classList.add("show");
  }
}

function clearErr(field) {
  const input = document.getElementById("f-" + field);
  const err = document.getElementById("err-" + field);
  if (input) input.classList.remove("error");
  if (err) err.classList.remove("show");
}

// ── SALVAR (Modificado para API) ──
async function salvarFuncionario() {
  // Captura os dados exatamente como estão nos IDs do seu HTML
  const nome = document.getElementById("f-nome").value.trim();
  const cpf = document.getElementById("f-cpf").value.trim();
  const departamento = document.getElementById("f-dept").value; // CORRIGIDO: de dept para departamento
  const nivel = document.getElementById("f-nivel").value;
  const data_admissao = document.getElementById("f-data").value;
  const senha = document.getElementById("f-senha").value;

  let valido = true;

  // Validações visuais da tela
  if (nome.length < 3) {
    showErr("nome");
    valido = false;
  }

  if (!validarCPF(cpf)) {
    showErr("cpf", "CPF inválido.");
    valido = false;
  }

  if (!departamento) {
    showErr("dept");
    valido = false;
  }

  if (!data_admissao) {
    showErr("data");
    valido = false;
  }

  if (senha.length < 6) {
    showErr("senha");
    valido = false;
  }

  if (!valido) return;

  // Monta o payload perfeitamente alinhado com o seu schemas.py
  const payload = {
    nome,
    cpf,
    departamento,
    nivel,
    data_admissao,
    senha,
  };

  try {
    const response = await fetch(`${API_URL}/funcionarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      resetForm();
      toast(`${nome} cadastrado com sucesso!`, "success");
      // Redireciona para a lista após o sucesso
      setTimeout(() => (window.location.href = "funcionarios.html"), 800);
    } else {
      const errorData = await response.json();
      // Se o erro for o CPF duplicado que tratamos no Python
      if (
        response.status === 400 &&
        errorData.detail === "CPF já cadastrado."
      ) {
        showErr("cpf", "CPF já cadastrado no sistema.");
      } else {
        toast(errorData.detail || "Falha ao cadastrar funcionário.", "error");
      }
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    toast("Não foi possível conectar ao servidor.", "error");
  }
}

// Monta objeto conforme schemas.py do backend
const payload = {
  nome,
  cpf,
  departamento,
  nivel,
  data_admissao,
  senha,
};

try {
  const response = await fetch(`${API_URL}/funcionarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    resetForm();
    toast(`${nome} cadastrado com sucesso!`, "success");
    setTimeout(() => (window.location.href = "funcionarios.html"), 800);
  } else {
    const errorData = await response.json();
    if (response.status === 400 && errorData.detail === "CPF já cadastrado.") {
      showErr("cpf", "CPF já cadastrado no sistema.");
    } else {
      toast(errorData.detail || "Falha ao cadastrar funcionário.", "error");
    }
  }
} catch (error) {
  console.error("Erro na requisição:", error);
  toast("Não foi possível conectar ao servidor.", "error");
}

function resetForm() {
  ["nome", "cpf", "data", "senha"].forEach((field) => {
    document.getElementById("f-" + field).value = "";
    clearErr(field);
  });
  document.getElementById("f-dept").value = "";
  document.getElementById("f-nivel").value = "Júnior";
  clearErr("dept");
}
