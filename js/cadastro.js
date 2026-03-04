const form = document.getElementById("formFuncionario");

if (form) {
  const cpfInput = document.getElementById("cpf");
  aplicarMascaraCPF(cpfInput);

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const funcionarios = getFuncionarios();

    const novo = {
      id: Date.now(),
      nome: document.getElementById("nome").value,
      cpf: cpfInput.value,
      departamento: document.getElementById("departamento").value,
      nivel: document.getElementById("nivel").value,
      dataCadastro: document.getElementById("dataCadastro").value
    };

    funcionarios.push(novo);
    salvarFuncionarios(funcionarios);

    alert("Funcionário cadastrado!");
    form.reset();
  });
}