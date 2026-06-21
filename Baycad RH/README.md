# 🏢 Sistema de RH – Projeto de Teste de Software

Sistema web de Gestão de Recursos Humanos desenvolvido como projeto prático da disciplina de **Teste de Software – 7º Semestre**.

A aplicação permite o gerenciamento de funcionários por meio de uma interface web integrada a uma API desenvolvida em Python, possibilitando operações de cadastro, consulta e administração de dados.

---

# 🎯 Objetivo do Projeto

Este projeto tem como finalidade:

* Desenvolver um sistema web para gerenciamento de funcionários;
* Aplicar conceitos de Engenharia e Teste de Software;
* Executar testes funcionais e exploratórios;
* Identificar, documentar e corrigir defeitos;
* Simular cenários reais de validação de sistemas corporativos.

---

# 🏗 Arquitetura do Sistema

O sistema segue uma arquitetura cliente-servidor composta por:

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Python
* FastAPI
* Uvicorn

### Banco de Dados

* SQLite

### Segurança

* Hash de senhas utilizando Passlib + BCrypt

---

# 📁 Estrutura do Projeto

```text
.
├── css/
│   └── style.css
│
├── js/
│   ├── cadastro.js
│   ├── dashboard.js
│   ├── funcionarios.js
│   ├── database.js
│   └── utils.js
│
├── python/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   └── baycad_rh.db
│
├── cadastro.html
├── funcionarios.html
├── index.html
├── requirements.txt
└── README.md
```

---

# ⚙ Funcionalidades Implementadas

### Gestão de Funcionários

* Cadastro de funcionários
* Listagem de funcionários
* Busca por nome
* Busca por CPF
* Exclusão de registros
* Validação de dados de entrada

### Segurança

* Armazenamento seguro de senhas
* Criptografia utilizando BCrypt
* Proteção contra armazenamento de senhas em texto puro

### Interface

* Dashboard administrativo
* Máscara automática para CPF
* Feedback visual para operações do usuário
* Atualização dinâmica de dados

---

# 🧪 Testes Aplicados

O sistema foi utilizado para aplicação prática dos seguintes tipos de teste:

### Testes Funcionais

* Cadastro de funcionários
* Consulta de registros
* Exclusão de funcionários
* Validação de formulários

### Testes de Validação

* Campos obrigatórios
* CPF inválido
* E-mails inválidos
* Entradas inconsistentes

### Testes Exploratórios

* Navegação entre páginas
* Comportamento inesperado do usuário
* Tratamento de exceções

### Testes de Integração

* Comunicação Frontend ↔ Backend
* Persistência no banco SQLite
* Consistência dos dados

---

# 🐞 Problemas Identificados Durante os Testes

Durante o desenvolvimento e execução dos testes foram identificados e corrigidos diversos problemas, incluindo:

* Erro de carregamento de scripts JavaScript;
* Declaração duplicada da constante `API_URL`;
* Problemas de integração entre frontend e backend;
* Erros relacionados à política CORS;
* Incompatibilidade entre versões do Passlib e BCrypt;
* Falhas no processamento de hash de senha;
* Erros de validação de dados enviados à API.

---

# 🚀 Como Executar o Projeto

## 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
```

## 2. Criar ambiente virtual

```bash
python -m venv venv
```

## 3. Ativar ambiente virtual

### Windows

```bash
venv\Scripts\activate
```

### Linux/Mac

```bash
source venv/bin/activate
```

## 4. Instalar dependências

```bash
pip install -r requirements.txt
```

## 5. Iniciar o servidor

```bash
uvicorn python.main:app --reload
```

O backend será iniciado em:

```text
http://127.0.0.1:8000
```

---

# 🌐 Deploy

Versão pública disponível em:

https://testedesoftwaresistemarh.netlify.app

> Observação: o deploy hospedado no Netlify disponibiliza apenas o frontend. O backend FastAPI deve estar em execução separadamente para que todas as funcionalidades operem corretamente.

---

# 👨‍💻 Disciplina

**Teste de Software – 7º Semestre**

Projeto acadêmico desenvolvido para aplicação prática de técnicas de testes, validação de sistemas e documentação de defeitos.

---

# 📄 Licença

Projeto desenvolvido para fins educacionais e acadêmicos.
Todos os direitos reservados aos autores do projeto.