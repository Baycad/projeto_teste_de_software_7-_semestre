const lista = document.getElementById("listaFuncionarios");
const busca = document.getElementById("busca");
const filtro = document.getElementById("filtroDepartamento");

function renderizar(listaFuncionarios) {
  lista.innerHTML = "";

  listaFuncionarios.forEach(f => {
    lista.innerHTML += `
      <tr>
        <td>${f.nome}</td>
        <td>${f.cpf}</td>
        <td>${f.departamento}</td>
        <td>${f.nivel}</td>
        <td>${f.dataCadastro}</td>
        <td>
          <button onclick="excluir(${f.id})">Excluir</button>
        </td>
      </tr>
    `;
  });
}

function excluir(id) {
  let funcionarios = getFuncionarios();
  funcionarios = funcionarios.filter(f => f.id !== id);
  salvarFuncionarios(funcionarios);
  atualizar();
}

function atualizar() {
  let funcionarios = getFuncionarios();
  const termo = busca.value.toLowerCase();
  const depto = filtro.value;

  funcionarios = funcionarios.filter(f =>
    (f.nome.toLowerCase().includes(termo) ||
    f.cpf.includes(termo)) &&
    (depto === "" || f.departamento === depto)
  );

  renderizar(funcionarios);
}

busca.addEventListener("input", atualizar);
filtro.addEventListener("change", atualizar);

atualizar();