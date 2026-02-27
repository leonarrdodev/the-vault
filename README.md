# API de Segredos (Secret Manager)

Uma API RESTful construída com Node.js e Fastify para armazenamento e recuperação segura de segredos criptografados. A aplicação utiliza SQLite para persistência de dados e criptografia forte para garantir que apenas quem possui a senha mestre (`masterPassword`) consiga revelar o conteúdo.

## Tecnologias Utilizadas

* **Node.js** com **TypeScript**
* **Fastify** (Framework web de alta performance)
* **SQLite** (Banco de dados leve e embutido)
* **Módulo nativo `crypto`** (Derivação de chaves e criptografia AES)
* **JWT** (Autenticação de rotas)
* **Docker** (Para conteinerização e deploy)

---

## Arquitetura e Estrutura de Pastas

O projeto segue uma arquitetura modular, separando a regra de negócios das configurações globais:

* `src/core/`: Configurações globais, conexão com o banco de dados (`database.ts`) e serviços utilitários (`crypto.service.ts`).
* `src/modules/secrets/`: Domínio de segredos, contendo as rotas (`secrets.routes.ts`) e a camada de acesso a dados (`secrets.repository.ts`).

---

## Endpoints Principais

### Usuários / Autenticação

Essas rotas são públicas e servem para criar sua conta e gerar o token de acesso.

#### 1. Criar Usuário
* **Rota:** `POST /users/register`
* **Corpo da Requisição (JSON):**
    ```json
    {
      "username": "leo",
      "password": "minha-senha-de-login"
    }
    ```
* **Retorno Sucesso:** `201 Created`

#### 2. Fazer Login
* **Rota:** `POST /users/login`
* **Corpo da Requisição (JSON):**
    ```json
    {
      "username": "leo",
      "password": "minha-senha-de-login"
    }
    ```
* **Retorno Sucesso:** `200 OK`
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

---

### Segredos (Secret Manager)

**Aviso:** Todas as rotas abaixo exigem o token JWT (obtido no login) no cabeçalho da requisição: `Authorization: Bearer <token>`.

#### 1. Salvar um Novo Segredo
* **Rota:** `POST /secrets/`
* **Corpo da Requisição (JSON):**
    ```json
    {
      "title": "Senha do Banco",
      "secretValue": "minha-senha-super-secreta",
      "masterPassword": "senha-mestre-do-usuario"
    }
    ```
* **Retorno Sucesso:** `201 Created`

#### 2. Listar Segredos
* **Rota:** `GET /secrets/`
* **Retorno Sucesso:** `200 OK` (Retorna um array com os IDs e Títulos dos segredos).

#### 3. Revelar um Segredo
* **Rota:** `POST /secrets/:id/reveal`
* **Corpo da Requisição (JSON):**
    ```json
    {
      "masterPassword": "senha-mestre-do-usuario"
    }
    ```
* **Retorno Sucesso:** `200 OK`
    ```json
    {
      "secret": "minha-senha-super-secreta"
    }
    ```
##  Como Executar com Docker

1. Clone o repositório para a sua máquina (ou servidor):
```
git clone https://github.com/leonarrdodev/the-vault.git
cd the-vault
```

2. Crie o arquivo de variáveis de ambiente (se aplicável):


```
cp .env.example .env
```

3. Construa a imagem e suba o container:

```
docker compose up -d --build
```
A API estará disponível na porta definida (ex: http://localhost:3000).