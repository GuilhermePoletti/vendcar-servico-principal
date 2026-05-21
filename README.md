# 🚗 VendCar — Serviço Principal (Catálogo & Autenticação)
> **Microsserviço de Gestão Comercial do Ecossistema VendCar · FIAP**
> 
> [![CI Status](https://img.shields.io/badge/CI-Passing-success?style=for-the-badge&logo=github-actions)](https://github.com/GuilhermePoletti/vendcar-servico-principal/actions)
> [![Test Coverage](https://img.shields.io/badge/Coverage-99.61%25-success?style=for-the-badge&logo=jest)](#)
> [![Architecture](https://img.shields.io/badge/Architecture-Hexagonal-blue?style=for-the-badge)](#)
> [![Framework](https://img.shields.io/badge/Framework-NestJS%2011-red?style=for-the-badge&logo=nestjs)](https://nestjs.com/)

O **Serviço Principal** atua como o núcleo operacional comercial do sistema **VendCar**. Ele centraliza os cadastros fundamentais de negócios (Operadores, Clientes e Veículos), gerencia o fluxo de controle de acesso (Autenticação JWT) e expõe as transições de estado dos veículos que compõem as etapas de compensação e confirmação transacional do fluxo SAGA.

---

## 🧭 Visão Geral do Sistema VendCar

Uma plataforma moderna e robusta para gerenciamento de catálogo e vendas de veículos, implementada sob o paradigma de **Microsserviços**, com **Arquitetura Hexagonal pura**, **Design Orientado a Domínio (DDD)**, orquestração transacional transfronteiriça (**SAGA Pattern**), segurança de borda (**Kong API Gateway com JWT**), suite completa de testes unitários/integração baseados em **TDD (com cobertura > 98%)** e infraestrutura automatizada pronta para nuvem (**Kubernetes/Minikube & ArgoCD**).

O sistema foi dividido em dois domínios isolados, operando de forma autônoma e comunicando-se exclusivamente por meio de protocolos síncronos HTTP:

1. **Serviço Principal** (este repositório): Gerencia o core comercial, incluindo a autenticação de operadores (JWT), o cadastro e controle de marcas, o perfil e validação cadastral de clientes (CPF único) e o catálogo geral de veículos.
2. **Serviço de Vendas** ([repositório](https://github.com/GuilhermePoletti/vendcar-servico-vendas)): Atua como o cérebro orquestrador das transações comerciais, gerenciando o fluxo de aquisições de veículos, a recepção e o processamento seguro de webhooks de pagamento de terceiros e a reconciliação garantida de estados transacionais (SAGA) por meio de fila de eventos local e workers assíncronos periódicos.

---

## 🏗️ Arquitetura de Microsserviços e Fluxo de Dados

O sistema utiliza o **Kong API Gateway** como ponto único de entrada para proteger e rotear todo o tráfego externo. Veja o fluxo arquitetural abaixo:

```mermaid
graph TD
    %% Estilização do Diagrama
    classDef client fill:#f9f,stroke:#333,stroke-width:2px;
    classDef gateway fill:#bbf,stroke:#333,stroke-width:2px;
    classDef microservice fill:#bfb,stroke:#333,stroke-width:2px;
    classDef database fill:#fbb,stroke:#333,stroke-width:2px;

    Client[💻 Cliente / Operador]:::client
    WebhookSource[🔌 Provedor de Pagamentos Webhook]:::client

    subgraph "Borda e Segurança"
        Gateway[🦍 Kong API Gateway <br> Porta :8000]:::gateway
        KongDB[(Postgres Kong DB)]:::database
        Gateway --> KongDB
    end

    subgraph "Microsserviço de Catálogo"
        Principal["🚗 Serviço Principal <br> NestJS | Porta :3000"]:::microservice
        DbPrincipal[(PostgreSql: db_principal <br> Porta :5432)]:::database
        Principal --> DbPrincipal
    end

    subgraph "Microsserviço Transacional"
        Vendas["💰 Serviço de Vendas <br> NestJS | Porta :3001"]:::microservice
        DbVendas[(PostgreSql: db_vendas <br> Porta :5433)]:::database
        Vendas --> DbVendas
        Cron[⏰ Cron Worker <br> Reconciliação a cada 10s]:::gateway
        Cron --> Vendas
    end

    %% Roteamento do Gateway
    Client -->|POST /principal/auth/login <br> GET /principal/veiculos| Gateway
    Gateway -->|Roteia para port 3000| Principal
    
    Client -->|POST /vendas/vendas| Gateway
    Gateway -->|Roteia para port 3001| Vendas

    WebhookSource -->|POST /vendas/webhook/pagamento| Gateway

    %% Comunicação entre Serviços (SAGA)
    Vendas -->|1. GET /clientes/cpf/:cpf <br> 2. PATCH /veiculos/:id/reservar| Principal
    Vendas -.->|3. Cron reconcilia: <br> PATCH /veiculos/:id/vender <br> ou disponibilizar| Principal
```

---

## 💾 Modelo de Dados e Banco de Dados (ERD)

Cada microsserviço possui seu próprio banco de dados PostgreSQL independente e isolado, garantindo o princípio fundamental de acoplamento zero de persistência.

```mermaid
erDiagram
    subgraph db_principal
        USUARIO {
            uuid id PK
            string nome
            string email UK
            string senha_hash
            string role "ADMIN | OPERADOR"
            datetime criado_em
        }
        MARCA {
            uuid id PK
            string nome UK
            datetime criado_em
        }
        CLIENTE {
            uuid id PK
            string nome
            string cpf UK
            string email
            datetime criado_em
        }
        VEICULO {
            uuid id PK
            uuid id_marca FK
            string modelo
            integer ano
            string cor
            float preco
            string status "DISPONIVEL | RESERVADO | VENDIDO"
            datetime criado_em
        }
    end

    subgraph db_vendas
        VENDA {
            uuid id PK
            string cpf_cliente
            string id_veiculo_catalogo
            float preco_venda
            string status_pagamento "AGUARDANDO | PAGO | CANCELADO"
            string codigo_pagamento UK
            datetime data_venda
        }
        FILA_EVENTO {
            uuid id PK
            string tipo_evento "CONFIRMAR_VENDA | CANCELAR_VENDA"
            string status "PENDENTE | PROCESSADO | ERRO"
            string id_veiculo_catalogo
            string dados_payload
            integer tentativas
            string erro_mensagem
            datetime criado_em
            datetime atualizado_em
        }
    end

    MARCA ||--o{ VEICULO : "possui"
```

---

## 🔄 Orquestração Transacional: O Padrão SAGA Síncrono-Assíncrono

Para garantir consistência eventual sem usar corretores de mensageria complexos, o VendCar adota um **Padrão SAGA Orquestrado** com fases síncronas de validação e bloqueio, seguidas por reconciliação assíncrona tolerante a falhas baseada em fila transacional outbox e cron worker.

```mermaid
sequenceDiagram
    autonumber
    actor Operador
    actor Webhook as Provedor de Pagamento
    participant Gateway as Kong Gateway
    participant Vendas as Serviço de Vendas
    participant Principal as Serviço Principal
    participant Worker as Cron Worker (Vendas)

    Operador->>Gateway: POST /vendas/vendas {cpf, idVeiculo}
    Gateway->>Vendas: Repassa requisição de venda
    
    activate Vendas
    Vendas->>Principal: GET /clientes/cpf/{cpf} (Síncrono)
    Note over Vendas,Principal: Verifica integridade cadastral do cliente
    Principal-->>Vendas: 200 OK (Cliente existe)

    Vendas->>Principal: PATCH /veiculos/{id}/reservar (SAGA Lock)
    Note over Principal: Altera status: DISPONIVEL -> RESERVADO
    Principal-->>Vendas: 200 OK (Veículo reservado com sucesso)

    Vendas->>Vendas: Salva Venda localmente (status: AGUARDANDO)
    Vendas-->>Gateway: 201 Created { idVenda, codigoPagamento }
    Gateway-->>Operador: Retorna detalhes da venda iniciada
    deactivate Vendas

    Note over Operador,Webhook: O operador efetua o pagamento no gateway externo...

    Webhook->>Gateway: POST /vendas/webhook/pagamento {codigoPagamento, status: 'EFETUADO'}
    Gateway->>Vendas: Repassa Webhook

    activate Vendas
    Note over Vendas: Abre transação de banco local
    Vendas->>Vendas: Altera status da Venda para PAGO
    Vendas->>Vendas: Insere evento CONFIRMAR_VENDA na FilaEventos local (status: PENDENTE)
    Note over Vendas: Confirma transação local (garantia ACID)
    Vendas-->>Gateway: 200 OK
    Gateway-->>Webhook: Resposta processada
    deactivate Vendas

    loop A cada 10 segundos
        Worker->>Vendas: Executa varredura de pendências
        activate Vendas
        Vendas->>Vendas: Busca eventos com status PENDENTE
        Vendas->>Principal: PATCH /veiculos/{id}/vender (SAGA Confirm)
        Note over Principal: Transiciona status do Veículo: RESERVADO -> VENDIDO
        Principal-->>Vendas: 200 OK (Confirmado no catálogo)
        Vendas->>Vendas: Atualiza FilaEventos status = PROCESSADO
        deactivate Vendas
    end
```

---

## ⚙️ Regras Arquiteturais Cruciais (Clean Architecture)

- **Hexagonal Pura**: As dependências sempre apontam para dentro (`infrastructure -> application -> domain`).
- **Isolamento de Domínio**: O domínio (`src/domain`) contém apenas classes TypeScript puras, sem decorators do NestJS, Prisma ou qualquer outra dependência.
- **TDD Rigoroso**: Todos os arquivos de lógica comercial possuem cobertura de testes automatizados superior a 80%, alcançando marcas próximas a 100%.

---

## 🏗️ Design e Arquitetura Hexagonal deste Serviço

Este microsserviço foi projetado seguindo rigorosamente a **Arquitetura Hexagonal** (Ports & Adapters), garantindo que as regras de domínio permaneçam isoladas de qualquer detalhe tecnológico ou de infraestrutura (como NestJS ou Prisma).

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

### Estrutura Arquitetural de Pastas
- `src/domain/`: Contém as regras de negócio essenciais, entidades ricas (`Cliente`, `Veiculo`, `Marca`, `Usuario`), enums de status e exceções de domínio. É **TypeScript puro**, sem qualquer decorator externo.
- `src/application/`: Implementa os 14 casos de uso e define as interfaces de saída (`Ports`) que encapsulam os canais de persistência.
- `src/infrastructure/`: Contém os adaptadores concretos, como controladores NestJS (`adapters/in/`), repositórios que implementam o Prisma ORM (`adapters/out/`), configurações globais de guarda de autenticação JWT (`auth/`) e módulos NestJS (`modules/`).

---

## 📡 Detalhes das APIs e Payloads de Exemplo

Todas as APIs expostas por este microsserviço estão catalogadas via **Swagger UI** (acessível localmente em `http://localhost:3000/api`).

### 1. Autenticação (Público)
*   **Registrar Operador**: `POST /auth/registrar`
    *   **Request Body**:
        ```json
        {
          "nome": "Operador E2E",
          "email": "operador@vendcar.com",
          "senha": "senha123password"
        }
        ```
    *   **Response (201 Created)**:
        ```json
        {
          "id": "bcf53ca7-9f66-4de5-a7b2-03d1591f4229",
          "nome": "Operador E2E",
          "email": "operador@vendcar.com",
          "role": "OPERADOR"
        }
        ```

*   **Login de Operador (Obter JWT)**: `POST /auth/login`
    *   **Request Body**:
        ```json
        {
          "email": "admin@vendcar.com",
          "senha": "123456"
        }
        ```
    *   **Response (200 OK)**:
        ```json
        {
          "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
        ```

---

### 2. Clientes (Protegido por JWT Bearer)
*   **Cadastrar Cliente**: `POST /clientes`
    *   **Request Body**:
        ```json
        {
          "nome": "João Silva",
          "cpf": "52998224725",
          "email": "joao.silva@email.com"
        }
        ```
    *   **Response (201 Created)**:
        ```json
        {
          "id": "e44d57c2-3cf7-4e1b-9e45-12cfd3dfde8f",
          "nome": "João Silva",
          "cpf": "52998224725",
          "email": "joao.silva@email.com"
        }
        ```

*   **Buscar por CPF (Usado na validação da SAGA)**: `GET /clientes/cpf/:cpf`
    *   **Response (200 OK)**:
        ```json
        {
          "id": "e44d57c2-3cf7-4e1b-9e45-12cfd3dfde8f",
          "nome": "João Silva",
          "cpf": "52998224725",
          "email": "joao.silva@email.com"
        }
        ```

---

### 3. Veículos (Protegido por JWT / Endpoints SAGA Públicos)
*   **Cadastrar Veículo**: `POST /veiculos`
    *   **Request Body**:
        ```json
        {
          "idMarca": "1e8fc421-9332-4674-86d9-cb747d856f41",
          "modelo": "Civic Type R",
          "ano": 2024,
          "cor": "Vermelho",
          "preco": 135000
        }
        ```
    *   **Response (201 Created)**:
        ```json
        {
          "id": "d1947aff-5160-4649-b4c9-66968a0a4843",
          "idMarca": "1e8fc421-9332-4674-86d9-cb747d856f41",
          "modelo": "Civic Type R",
          "ano": 2024,
          "cor": "Vermelho",
          "preco": 135000,
          "status": "DISPONIVEL"
        }
        ```

*   **Reservar Veículo (SAGA Lock)**: `PATCH /veiculos/:id/reservar`
    *   **Response (200 OK)**: Altera status de `DISPONIVEL` para `RESERVADO`.

*   **Confirmar Venda (SAGA Confirm)**: `PATCH /veiculos/:id/vender`
    *   **Response (200 OK)**: Altera status de `RESERVADO` para `VENDIDO`.

*   **Disponibilizar Reserva (SAGA Compensar)**: `PATCH /veiculos/:id/disponibilizar`
    *   **Response (200 OK)**: Altera status de `RESERVADO` de volta para `DISPONIVEL`.

---

## 🚀 Como Executar o Projeto Localmente via Docker Compose

### Pré-requisitos
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados.

### 1. Inicializar o Ambiente
Para rodar toda a infraestrutura com um único comando (incluindo bancos de dados, microsserviços e o Kong API Gateway):
```bash
docker compose up -d --build
```
Isso levantará os seguintes containers de forma ordenada e auto-configurada:
- `vendcar-db-principal` (PostgreSQL - porta `5432`)
- `vendcar-db-vendas` (PostgreSQL - porta `5433`)
- `vendcar-servico-principal` (Serviço NestJS - porta `3000`)
- `vendcar-servico-vendas` (Serviço NestJS - porta `3001`)
- `vendcar-kong-db` (Postgres do Gateway)
- `vendcar-kong` (Gateway de API - proxy na porta `8000`, admin na porta `8001`)

### 2. Alimentar os Dados Iniciais (Database Seeding)
Após garantir que os containers estão no ar, execute o seed para povoar as marcas catalogadas e o usuário administrador no banco do Serviço Principal:
```bash
docker exec vendcar-servico-principal sh -c "npx prisma db seed"
```

### 3. Configurar Roteamento no Kong API Gateway
Crie as rotas para expor os microsserviços na porta externa unificada `8000` executando a configuração do gateway de borda:
```bash
# Registrar Serviço Principal
curl -s -X POST http://localhost:8001/services \
  -d name=servico-principal \
  -d url=http://servico-principal:3000

# Criar rota /principal
curl -s -X POST http://localhost:8001/services/servico-principal/routes \
  -d "paths[]=/principal" \
  -d "strip_path=true"

# Registrar Serviço de Vendas
curl -s -X POST http://localhost:8001/services \
  -d name=servico-vendas \
  -d url=http://servico-vendas:3001

# Criar rota /vendas
curl -s -X POST http://localhost:8001/services/servico-vendas/routes \
  -d "paths[]=/vendas" \
  -d "strip_path=true"
```

---

## 📡 Verificação da Documentação Swagger
Uma vez executando localmente, as documentações das APIs via Swagger UI estarão plenamente acessíveis por meio dos seguintes links:

- **Acesso Direto**:
  - Catálogo (Serviço Principal): [http://localhost:3000/api](http://localhost:3000/api)
  - Vendas (Serviço de Vendas): [http://localhost:3001/api](http://localhost:3001/api)
- **Acesso Roteado via Kong API Gateway**:
  - Swagger Principal via Kong: [http://localhost:8000/principal/api](http://localhost:8000/principal/api)
  - Swagger Vendas via Kong: [http://localhost:8000/vendas/api](http://localhost:8000/vendas/api)

---

## 🧪 Rodando o Fluxo E2E Integrado Automatizado
Para testar todo o fluxo transacional (Cadastro, Login Admin, Criação de Cliente, Cadastro de Veículo, Reserva SAGA, Webhook de Pagamento, Reconciliação do Cron e Validação de Vendas) de forma rápida e segura, criamos um script integrador local:

```bash
# Executa o teste ponta a ponta que valida todo o escopo funcional
node test-e2e.js
```
O console mostrará cada passo do SAGA sendo processado com sucesso.

---

## ☸️ Implantação Kubernetes Local (via Minikube)

Para testar o deploy orquestrado em nível produtivo utilizando manifests Kubernetes e integração contínua declarativa, siga este roteiro de comandos detalhado:

### 1. Iniciar o Cluster Minikube
```bash
minikube start --driver=docker
```

### 2. Sincronizar o Docker Daemon Local com o Cluster
Para permitir que o Minikube use imagens construídas localmente sem a necessidade de enviá-las para um registro remoto (hub):

- **No Windows (PowerShell)**:
  ```powershell
  minikube docker-env --shell powershell | Invoke-Expression
  ```
- **No Linux/macOS**:
  ```bash
  eval $(minikube docker-env)
  ```

### 3. Compilar as Imagens Docker no Ambiente Minikube
Acesse cada pasta de serviço e compile a imagem no Docker do Minikube com a tag configurada nos manifests:
```bash
# Compilar Serviço Principal
docker build -t ghcr.io/guilhermepoletti/vendcar-servico-principal:latest-local-2 ./servico-principal

# Compilar Serviço de Vendas
docker build -t ghcr.io/guilhermepoletti/vendcar-servico-vendas:latest-local-2 ./servico-vendas
```

### 4. Aplicar os Recursos Kubernetes
Os manifests de implantação organizados e validados estão na pasta `/k8s`. Siga a ordem exata de aplicação para evitar falhas de dependência:

```bash
# 1. Criar o Namespace isolado
kubectl apply -f k8s/namespace.yaml

# 2. Criar os Secrets requeridos pelos deployments (Senha do Banco e JWT Secret)
kubectl -n vendcar create secret generic vendcar-secrets \
  --from-literal=db-password=vendcar123 \
  --from-literal=jwt-secret=vendcar-jwt-secret-prod

# 3. Aplicar os Bancos de Dados isolados
kubectl apply -f k8s/db-principal.yaml
kubectl apply -f k8s/db-vendas.yaml

# 4. Aguardar a prontidão total dos bancos antes de iniciar os serviços NestJS
kubectl -n vendcar wait --for=condition=ready pod -l app=db-principal --timeout=120s
kubectl -n vendcar wait --for=condition=ready pod -l app=db-vendas --timeout=120s

# 5. Implantar os Microsserviços
kubectl apply -f k8s/servico-principal.yaml
kubectl apply -f k8s/servico-vendas.yaml
```

### 5. Executar o Seed no Kubernetes
Após os pods estarem saudáveis, execute o seed de dados iniciais:
```bash
kubectl -n vendcar exec deploy/servico-principal -- npx prisma db seed
```

### 6. Verificar a Integridade dos Pods
Consulte se todas as réplicas estão saudáveis, ativas e prontas para receber tráfego:
```bash
kubectl -n vendcar get pods
```

### 7. Acessar as APIs dentro do Kubernetes
> **⚠️ Importante**: Antes de abrir os port-forwards, certifique-se de que o Docker Compose **não está rodando** (`docker compose down`), pois ambos competem pelas mesmas portas locais (3000/3001).

Abra canais de redirecionamento de portas locais para acessar os serviços rodando dentro dos pods do Minikube:

```bash
# Encaminhar Serviço Principal (Swagger: http://localhost:3000/api)
kubectl -n vendcar port-forward svc/servico-principal 3000:3000

# Encaminhar Serviço de Vendas (Swagger: http://localhost:3001/api)
kubectl -n vendcar port-forward svc/servico-vendas 3001:3001
```

---

## 🐙 Sincronização Declarativa via GitOps (ArgoCD)

Para fins de GitOps estruturado, os manifests contam com o arquivo integrador `k8s/argocd-application.yaml`. Para implantar toda a infraestrutura de forma declarativa e sincronizada automaticamente por meio do ArgoCD:

```bash
# Aplica a Application do ArgoCD que monitora este repositório
kubectl apply -f k8s/argocd-application.yaml
```
O ArgoCD assumirá a responsabilidade de manter o estado do cluster sincronizado em tempo real com o código-fonte deste repositório!

---

## 🧪 Excelência em Testes Automatizados (Jest & TDD)

O Serviço Principal possui uma suite completa de testes contendo **164 testes unitários e de integração**. O pipeline de integração contínua (CI) exige que o limite global de cobertura de código atinja a marca de no mínimo 80%.

Para executar os testes locais e gerar o relatório detalhado de cobertura de código:
```bash
# 1. Instalar as dependências de desenvolvimento
npm install

# 2. Gerar o cliente Prisma local
npx prisma generate

# 3. Rodar a cobertura completa
npm run test:cov
```

### Resultados da Cobertura de Código (Métricas Reais)
*   **Testes Executados**: 164 / 164 aprovados com sucesso
*   **Cobertura de Statements**: **99.61%**
*   **Cobertura de Branches**: **85.25%**
*   **Cobertura de Functions**: **100%**
*   **Cobertura de Lines**: **99.56%**

### Resumo Executivo de Cobertura Consolidada (Ambos os Serviços)

| Serviço | Qtd Testes | Cobertura Statements | Cobertura Branches | Cobertura Functions | Cobertura Lines | Status |
|---------|------------|-----------------------|--------------------|---------------------|-----------------|--------|
| **Serviço Principal** | 164 | **99.61%** | 85.25% | **100%** | **99.56%** | Passou ✅ |
| **Serviço de Vendas** | 85 | **100.00%** | 87.30% | **100%** | **100.00%** | Passou ✅ |
| **Consolidado** | **249** | **99.80%** | **86.27%** | **100%** | **99.78%** | **Aprovado** ✅ |

---

## 🚀 Como Rodar o Serviço Isoladamente

> [!TIP]
> Se você deseja executar todo o ecossistema integrado (ambos os serviços, bancos de dados separados e gateway Kong), siga o guia da seção **Docker Compose** acima.

### Executar localmente em Desenvolvimento
Se você preferir executar apenas este microsserviço em sua máquina (necessita de um PostgreSQL rodando):

```bash
# 1. Copiar as configurações de ambiente
cp .env.example .env

# 2. Atualizar o link de conexão DATABASE_URL no .env
# Exemplo: DATABASE_URL=postgresql://vendcar:vendcar123@localhost:5432/db_principal

# 3. Instalar pacotes
npm install

# 4. Sincronizar o schema com o banco local
npx prisma db push

# 5. Executar o seed de marcas e usuário padrão admin
npx prisma db seed

# 6. Iniciar em modo Watch
npm run start:dev
```

A documentação interativa Swagger do catálogo estará pronta para uso em: [http://localhost:3000/api](http://localhost:3000/api).

---

> 💡 **Nota**: Sinta-se à vontade para utilizar o script automatizado `node test-e2e.js` ou explorar os Swaggers interativos de cada serviço para avaliar a consistência transacional do fluxo SAGA!
