// ============================================================
// js/cadastro.js — Controle exclusivo da tela de cadastro
// ============================================================

// ── MÁSCARA DO CPF ──
function maskCPF(input) {
  let v = input.value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 9)
    v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/, "$1.$2");
  input.value = v;
}

// ── VALIDAÇÕES VISUAIS DE ERRO ──
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

function resetForm() {
  document.getElementById("f-nome").value = "";
  document.getElementById("f-cpf").value = "";
  document.getElementById("f-dept").value = "";
  document.getElementById("f-nivel").value = "Júnior";
  document.getElementById("f-data").value = "";
  document.getElementById("f-senha").value = "";
  document
    .querySelectorAll(".field-error")
    .forEach((el) => el.classList.remove("visible"));
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

function toast(msg, type = "success") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.style.position = "fixed";
  el.style.bottom = "20px";
  el.style.right = "20px";
  el.style.background = type === "success" ? "#22c55e" : "#ef4444";
  el.style.color = "#fff";
  el.style.padding = "12px 24px";
  el.style.borderRadius = "6px";
  el.style.zIndex = "9999";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ── FUNÇÃO PRINCIPAL DE SALVAMENTO ──
async function salvarFuncionario(event) {
  if (event) event.preventDefault(); // Evita o recarregamento da página

  const nome = document.getElementById("f-nome").value.trim();
  const cpf = document.getElementById("f-cpf").value.trim();
  const departamento = document.getElementById("f-dept").value;
  const nivel = document.getElementById("f-nivel").value;
  const data_admissao = document.getElementById("f-data").value;
  const senha = document.getElementById("f-senha").value;

  let valido = true;

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

  const payload = {
    nome: nome,
    cpf: cpf,
    departamento: departamento, 
    nivel: nivel,
    data_admissao: data_admissao, 
    senha: senha,
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
      setTimeout(() => {
        window.location.href = "funcionarios.html";
      }, 1000);
    } else {
      const errorData = await response.json();
      if (
        response.status === 400 &&
        errorData.detail === "CPF já cadastrado."
      ) {
        showErr("cpf", "CPF já cadastrado no sistema.");
      } else {
        toast(errorData.detail || "Falha ao cadastrar.", "error");
      }
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    toast("Não foi possível conectar ao servidor backend.", "error");
  }
}