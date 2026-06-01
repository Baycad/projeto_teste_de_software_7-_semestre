function getFuncionarios() {
  return JSON.parse(localStorage.getItem("funcionarios")) || [];
}

function salvarFuncionarios(lista) {
  localStorage.setItem("funcionarios", JSON.stringify(lista));
}