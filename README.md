# Escola de IA - Sistema de Inscrição

Este é um sistema completo de inscrição para a Escola de IA, composto por um Frontend em Vue.js e um Backend em Node.js com MongoDB.

## Estrutura do Projeto

- **/backend**: Código da API, modelos e uploads.
- **/frontend**: Interface do usuário (Formulário e Admin).

## Pré-requisitos

1. **Node.js**: Instalado.
2. **MongoDB**: Deve estar rodando localmente na porta padrão (`27017`). Se não tiver o MongoDB instalado, instale-o ou configure uma URI de conexão no arquivo `backend/server.js`.

## Como Rodar

### 1. Backend API

Abra um terminal na pasta `backend` e execute:

```bash
cd backend
npm install
npm start
```

O servidor rodará em `http://localhost:3000`.

### 2. Frontend

Abra outro terminal na pasta `frontend` e execute:

```bash
cd frontend
npm install
npm run dev
```

Acesse o sistema em `http://localhost:5173`.

## Funcionalidades

### Aluno (Inscrição)
- Acesso à página inicial.
- Preenchimento de dados pessoais e seleção de curso.
- Upload do comprovativo de pagamento.
- Feedback visual de sucesso.

### Admin
- Acesso em `/admin`.
- Login (Usuário: `admin`, Senha: `admin123`).
- Visualização de todas as inscrições.
- Aprovação/Rejeição de inscrições.
- Visualização do comprovativo (clique em "Ver Arquivo").

## Stack Tecnológica

- **Frontend**: Vue.js 3, Vite, CSS Vanilla (Responsivo).
- **Backend**: Node.js, Express, Multer (Uploads).
- **Banco de Dados**: MongoDB.

## Notas

- As cores Laranja e Branco foram aplicadas conforme solicitado.
- O sistema é responsivo, priorizando uso mobile.
- Os comprovativos de pagamento são salvos na pasta `backend/uploads`.
