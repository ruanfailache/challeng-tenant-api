# Tenant API

API multi-tenant desenvolvida com NestJS para gerenciamento de empresas, usuários e convites.

## Arquitetura

Este projeto segue os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**, organizando o código em camadas bem definidas:

### Camadas da Aplicação

```
src/
├── domain/           # Camada de Domínio
├── application/      # Camada de Aplicação
├── infrastructure/   # Camada de Infraestrutura
└── main.ts          # Ponto de entrada
```

#### 1. **Domain Layer** (`src/domain/`)
Contém as regras de negócio puras, independentes de frameworks e tecnologias externas.

- **Models**: Entidades de domínio (`User`, `Company`, `Membership`, `Invite`)
- **Mappers**: Conversão entre entidades de domínio e modelos do Prisma
- **Aggregates**: Agregações de dados complexos (ex: `PaginatedCompanies`)

#### 2. **Application Layer** (`src/application/`)
Contém os casos de uso da aplicação, orquestrando o fluxo de dados entre as camadas.

- **Use Cases**:
  - **Company**: `CreateCompanyUseCase`, `ListUserCompaniesUseCase`, `SelectCompanyUseCase`
  - **User**: `CreateUserUseCase`, `LoginUserUseCase`
  - **Invite**: `SendInviteUseCase`

#### 3. **Infrastructure Layer** (`src/infrastructure/`)
Contém implementações de frameworks, bibliotecas e serviços externos.

- **Adapters**:
  - **In** (Entrada): Controllers REST, DTOs de request/response
  - **Out** (Saída): Repositórios, serviços AWS (S3, SES), database
- **Security**: Guards de autenticação, serviços de criptografia, geração de tokens JWT

### Fluxo de Dados

```
Controller → Use Case → Repository/Services → Database/External Services
    ↓           ↓              ↓
  DTOs      Domain Models   Prisma Models
```

### Tecnologias Principais

- **Framework**: NestJS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Autenticação**: JWT
- **Storage**: AWS S3 (logos das empresas)
- **Email**: AWS SES (envio de convites)
- **Validação**: class-validator, class-transformer
- **Documentação**: Swagger/OpenAPI

### Banco de Dados

O schema utiliza 4 entidades principais:

- **User**: Usuários do sistema
- **Company**: Empresas/tenants
- **Membership**: Relacionamento entre usuários e empresas (com roles: OWNER, ADMIN, MEMBER)
- **Invite**: Convites pendentes para usuários entrarem em empresas

## Rodando o projeto

Precisamos ter instalado na maquina docker e executar o comando no terminal:

```bash
$ docker compose up -d
```
