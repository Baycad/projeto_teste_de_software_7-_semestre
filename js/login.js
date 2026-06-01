// ============================================================
// js/login.js — Controle de Autenticação
// ============================================================

// MÁSCARA DO CPF
function maskCPF(input) {
  let v = input.value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 9)
    v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/, "$1.$2");
  input.value = v;
}

function clearErr(field) {
  const el = document.getElementById(`err-${field}`);
  if (el) el.classList.remove("visible");
}

// ── SOLICITAÇÃO DE ACESSO (demonstrativo, sem backend) ──

function abrirSolicitacao(event) {
  if (event) event.preventDefault();
  // Garante que o modal abra sempre no estado de formulário
  document.getElementById("solicitar-form").style.display = "block";
  document.getElementById("solicitar-sucesso").style.display = "none";
  document.getElementById("modal-solicitar").classList.add("open");
}

function fecharSolicitacao() {
  document.getElementById("modal-solicitar").classList.remove("open");
  // Limpa os campos para a próxima abertura
  ["s-nome", "s-cpf", "s-email", "s-dept", "s-justificativa"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

function enviarSolicitacao() {
  const nome = document.getElementById("s-nome").value.trim();
  const cpf = document.getElementById("s-cpf").value.trim();
  const email = document.getElementById("s-email").value.trim();
  const dept = document.getElementById("s-dept").value;

  // Validação mínima apenas para a demonstração
  if (!nome || !cpf || !email || !dept) {
    alert("Preencha nome, CPF, e-mail e departamento.");
    return;
  }

  // Não há backend: apenas exibe a tela de confirmação
  document.getElementById("solicitar-form").style.display = "none";
  document.getElementById("solicitar-sucesso").style.display = "block";
}

async function efetuarLogin(event) {
  event.preventDefault(); // Impede o refresh da página

  const cpf = document.getElementById("l-cpf").value.trim();
  const senha = document.getElementById("l-senha").value;
  const errEl = document.getElementById("err-login");

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf, senha }),
    });

    if (response.ok) {
      // Lê o corpo da resposta apenas uma vez
      const data = await response.json();

      // Armazena sessão simples para o frontend saber que está logado
      localStorage.setItem("usuario_logado", JSON.stringify(data));

      // Redireciona para a Dashboard
      window.location.href = "index.html";
    } else {
      // Exibe mensagem de erro (CPF ou Senha incorretos)
      if (errEl) errEl.classList.add("visible");
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    alert("Não foi possível conectar ao servidor backend.");
  }
}

// Fecha o modal de solicitação ao clicar fora dele
document
  .getElementById("modal-solicitar")
  .addEventListener("click", function (e) {
    if (e.target === this) fecharSolicitacao();
  });
