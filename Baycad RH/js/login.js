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

   const result = await response.json();
   console.log(result);

    if (response.ok) {
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
