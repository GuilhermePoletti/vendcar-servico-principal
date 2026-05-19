# VendCar — Serviço Principal

> **Projeto acadêmico FIAP** — Sistema de Revenda de Veículos implementado com **Microsserviços**, **Arquitetura Hexagonal** e **TDD-First**.

[![CI](https://github.com/GuilhermePoletti/vendcar-servico-principal/actions/workflows/pr-check.yml/badge.svg)](https://github.com/GuilhermePoletti/vendcar-servico-principal/actions)

---

## 📋 Sobre o Projeto

O **VendCar** é uma plataforma de revenda de veículos composta por **2 microsserviços** independentes que se comunicam exclusivamente via HTTP:

| Serviço | Responsabilidade | Repositório |
|---------|-----------------|-------------|
| **Serviço Principal** (este) | Catálogo de veículos, clientes, marcas e autenticação JWT | [vendcar-servico-principal](https://github.com/GuilhermePoletti/vendcar-servico-principal) |
| **Serviço de Vendas** | Orquestração SAGA de vendas, webhook de pagamento, worker de eventos | [vendcar-servico-vendas](https://github.com/GuilhermePoletti/vendcar-servico-vendas) |

### Funcionalidades deste Serviço
- CRUD completo de **Clientes** (nome, CPF, email)
- CRUD completo de **Veículos** (marca, modelo, ano, cor, preço, status)
- Catálogo de **Marcas** (10 pré-cadastradas via seed)
- **Autenticação JWT** (registro e login de operadores)
- Endpoints SAGA: `/veiculos/:id/reservar`, `/vender`, `/disponibilizar`

---

## 🏗️ Arquitetura Hexagonal (Ports & Adapters)

O projeto segue **estritamente** a Arquitetura Hexagonal, com 3 camadas de dependência unidirecional:

```
┌─────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE                     │
│  Controllers · Prisma Repos · HTTP Adapters · Auth  │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │               APPLICATION                    │    │
│  │     Use Cases · Ports (In/Out interfaces)    │    │
│  │                                              │    │
│  │  ┌───────────────────────────────────────┐  │    │
│  │  │              DOMAIN                    │  │    │
│  │  │   Entities · Enums · Exceptions        │  │    │
│  │  │   (TypeScript puro, sem dependências)  │  │    │
│  │  └───────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**Regras de dependência**:
- `infrastructure/` → `application/` → `domain/` ✅
- `domain/` → `application/` ❌ PROIBIDO
- `domain/` → `infrastructure/` ❌ PROIBIDO
- `application/` → `infrastructure/` ❌ PROIBIDO

A camada `domain/` contém **TypeScript puro** — sem decorators do NestJS, Prisma ou qualquer lib externa.

### Estrutura de Pastas

```
src/
├── domain/                    # 🟢 Entidades, Enums, Exceções (TypeScript puro)
│   ├── entities/              # Cliente, Veiculo, Marca, Usuario
│   ├── enums/                 # StatusVeiculo, RoleUsuario
│   └── exceptions/            # DomainException
├── application/               # 🟡 Use Cases + Ports (interfaces)
│   ├── ports/out/             # ClienteRepositoryPort, VeiculoRepositoryPort, etc.
│   └── use-cases/             # 14 use cases (Cliente, Veiculo, Auth)
└── infrastructure/            # 🔴 Adapters concretos
    ├── adapters/in/           # Controllers REST (NestJS)
    ├── adapters/out/          # Repositórios Prisma
    ├── auth/                  # JwtAuthGuard, @Public() decorator
    ├── modules/               # NestJS DI Modules
    └── prisma/                # PrismaService
```

---

## 🛠️ Tecnologias

| Componente | Tecnologia |
|------------|------------|
| Runtime | Node.js 20 LTS |
| Framework | NestJS 11 |
| Linguagem | TypeScript 5 (strict) |
| ORM | Prisma 5 |
| Banco de Dados | PostgreSQL 16 |
| Autenticação | JWT (@nestjs/jwt + bcrypt) |
| Testes | Jest + ts-jest |
| Documentação API | Swagger (OpenAPI 3.0) |
| Container | Docker (multi-stage build) |
| Orquestração | Kubernetes (Minikube) |
| API Gateway | Kong 3.6 (plugin JWT) |
| CI/CD | GitHub Actions → ArgoCD |

---

## 📦 Pré-requisitos

- **Node.js** 20+ e npm
- **Docker** e **Docker Compose** (para execução via containers)
- **Minikube** + **kubectl** (para deploy Kubernetes)
- **Git**

---

## 🚀 Como Executar Localmente

### Opção 1: Com Docker Compose (Recomendado)

```bash
# 1. Clonar o repositório
git clone https://github.com/GuilhermePoletti/vendcar-servico-principal.git
cd vendcar-servico-principal

# 2. Subir os containers (banco + serviço)
docker compose up -d

# 3. Executar o seed (marcas + admin) — executar apenas na primeira vez
docker exec vendcar-servico-principal sh -c "npx prisma db seed"

# 4. Verificar
curl http://localhost:3000/     # Health check → {"status":"ok"}
```

> **Swagger UI**: http://localhost:3000/api

> **Credenciais Admin padrão**: `admin@vendcar.com` / `123456`

### Opção 2: Sem Docker (Desenvolvimento local)

```bash
# 1. Instalar dependências
npm install

# 2. Configurar banco de dados (necessário PostgreSQL rodando na porta 5432)
cp .env.example .env
# Edite o .env se necessário

# 3. Gerar Prisma Client e criar tabelas
npx prisma generate
npx prisma db push

# 4. Executar seed (marcas + admin)
npx prisma db seed

# 5. Iniciar em modo dev
npm run start:dev
```

### Parar os containers

```bash
docker compose down          # Para e remove containers
docker compose down -v       # Para e remove containers + dados do banco
```

---

## 🧪 Como Testar

```bash
# Instalar dependências (se ainda não instalou)
npm install
npx prisma generate

# Testes unitários
npm test

# Testes com cobertura
npm run test:cov

# Cobertura mínima configurada: 80% (branches, functions, lines, statements)
```

### Resultado Atual de Cobertura

| Métrica | Cobertura |
|---------|-----------|
| Testes | 164 |
| Statements | 99.61% |
| Branches | 85.25% |
| Functions | 100% |
| Lines | 99.56% |

---

## 📡 Endpoints da API

### Auth (Públicos — sem JWT)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/auth/registrar` | Registrar novo operador |
| `POST` | `/auth/login` | Login → retorna JWT token |

### Clientes (Protegidos — requer JWT)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/clientes` | Criar cliente |
| `GET` | `/clientes` | Listar todos |
| `GET` | `/clientes/cpf/:cpf` | Buscar por CPF |
| `PUT` | `/clientes/:id` | Atualizar |
| `DELETE` | `/clientes/:id` | Deletar |

### Veículos (Protegidos — requer JWT)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/veiculos` | Cadastrar veículo |
| `GET` | `/veiculos` | Listar disponíveis (preço ↑) |
| `PUT` | `/veiculos/:id` | Atualizar |
| `DELETE` | `/veiculos/:id` | Deletar |
| `PATCH` | `/veiculos/:id/reservar` | Reservar (SAGA Lock) |
| `PATCH` | `/veiculos/:id/vender` | Confirmar venda (SAGA) |
| `PATCH` | `/veiculos/:id/disponibilizar` | Cancelar reserva (SAGA) |

---

## 🧪 Exemplo de Teste Ponta-a-Ponta (curl)

```bash
# 1. Login com admin
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vendcar.com","senha":"123456"}' | \
  python -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

echo "JWT Token: $TOKEN"

# 2. Criar cliente
curl -s -X POST http://localhost:3000/clientes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nome":"João Silva","cpf":"52998224725","email":"joao@email.com"}'

# 3. Listar marcas (pré-cadastradas via seed)
curl -s http://localhost:3000/veiculos \
  -H "Authorization: Bearer $TOKEN"

# 4. Cadastrar veículo (use um id_marca válido do passo anterior)
curl -s -X POST http://localhost:3000/veiculos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"id_marca":"<ID_MARCA>","modelo":"Corolla","ano":2024,"cor":"Prata","preco":150000}'
```

---

## ☸️ Deploy Kubernetes (Minikube)

### Passo a passo

```bash
# 1. Iniciar Minikube
minikube start --driver=docker

# 2. Configurar Docker para usar o daemon do Minikube
# PowerShell (Windows):
minikube docker-env --shell powershell | Invoke-Expression
# Linux/Mac:
# eval $(minikube docker-env)

# 3. Build da imagem localmente no Minikube
docker build -t ghcr.io/guilhermepoletti/vendcar-servico-principal:latest .

# 4. Aplicar manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/db-principal.yaml

# 5. Aguardar banco ficar pronto
kubectl -n vendcar wait --for=condition=ready pod -l app=db-principal --timeout=120s

# 6. Deploy do serviço
kubectl apply -f k8s/servico-principal.yaml

# 7. Verificar pods
kubectl -n vendcar get pods

# 8. Acessar o serviço
kubectl -n vendcar port-forward svc/servico-principal 3000:3000
# Acesse: http://localhost:3000/api (Swagger)
```

---

## 🔄 CI/CD (GitHub Actions)

| Gatilho | Workflow | Ações |
|---------|----------|-------|
| PR → `main` | `pr-check.yml` | Lint → Test → Coverage ≥ 80% |
| Merge → `main` | `deploy.yml` | Test → Docker build → Push GHCR → Atualiza manifest K8s |

O **ArgoCD** detecta automaticamente a mudança no manifest e aplica o deploy no cluster Kubernetes.

---

## 🔗 Comunicação com o Serviço de Vendas

Este serviço expõe endpoints que são consumidos pelo **Serviço de Vendas** durante o fluxo SAGA:

| Operação SAGA | Endpoint |
|---------------|----------|
| Validar cliente | `GET /clientes/cpf/:cpf` |
| Reservar veículo | `PATCH /veiculos/:id/reservar` |
| Confirmar venda | `PATCH /veiculos/:id/vender` |
| Cancelar reserva | `PATCH /veiculos/:id/disponibilizar` |

---

