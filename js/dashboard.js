function carregarDashboard() {
  const funcionarios = getFuncionarios();

  document.getElementById("total").innerText = funcionarios.length;

  document.getElementById("totalTI").innerText =
    funcionarios.filter(f => f.departamento === "TI").length;

  document.getElementById("totalRH").innerText =
    funcionarios.filter(f => f.departamento === "RH").length;
}

carregarDashboard();