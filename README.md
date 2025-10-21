# Sistema de Gestão de Estoque e Vendas - Frontend

Frontend em React + Vite + TailwindCSS para sistema de gestão de mini mercados.

## 🚀 Como Rodar

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento (porta 8080)
npm run dev
```

Acesse: `http://localhost:8080`

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes shadcn/ui
│   ├── Navbar.tsx      # Barra de navegação
│   └── ProtectedRoute.tsx # Proteção de rotas autenticadas
├── contexts/           # Contextos React
│   └── AuthContext.tsx # Gerenciamento de autenticação
├── mocks/              # Dados mockados para testes
│   ├── mockData.ts     # Dados estáticos (produtos, vendas, etc)
│   └── mockApi.ts      # Simulação de API (TEMPORÁRIO)
├── pages/              # Páginas da aplicação
│   ├── Register.tsx    # Cadastro de novo usuário
│   ├── Activate.tsx    # Ativação de conta via código
│   ├── Login.tsx       # Login
│   ├── Dashboard.tsx   # Painel principal
│   ├── Products.tsx    # Gestão de estoque
│   ├── Sales.tsx       # Registro de vendas
│   ├── Profile.tsx     # Perfil do usuário
│   └── Reports.tsx     # Relatórios
├── services/           # Serviços e integrações
│   └── api.ts          # Configuração Axios (PRONTO PARA INTEGRAÇÃO)
├── types/              # Tipos TypeScript
│   └── index.ts        # Interfaces e tipos
└── App.tsx             # Rotas e configuração principal
```

## 🔄 Status Atual: MODO MOCK

**O frontend está rodando com dados mockados para testes independentes.**

### Para Integrar com o Backend Real:

1. **Configure a URL do backend** em `.env`:
```bash
VITE_API_URL=http://localhost:5000
```

2. **Troque os imports mockados pelos reais** em cada página:

**Antes (mock):**
```typescript
// TODO: INTEGRAÇÃO - Trocar para @/services/api quando conectar ao backend real
import { mockAuthAPI as authAPI } from '@/mocks/mockApi';
```

**Depois (real):**
```typescript
import { authAPI } from '@/services/api';
```

3. **Arquivos que precisam dessa mudança:**
   - `src/pages/Register.tsx` - linha ~8
   - `src/pages/Activate.tsx` - linha ~8
   - `src/pages/Login.tsx` - linha ~8
   - `src/pages/Profile.tsx` - linha ~11
   - `src/pages/Dashboard.tsx` - linha ~9
   - `src/pages/Products.tsx` - linha ~21
   - `src/pages/Sales.tsx` - linha ~18
   - `src/pages/Reports.tsx` - linha ~9

4. **Rotas do Backend Flask esperadas:**
   - `POST /api/users/register` - Cadastro
   - `POST /api/users/activate` - Ativação
   - `POST /api/users/login` - Login (retorna JWT)
   - `GET /api/users/:id` - Buscar usuário
   - `PUT /api/users/:id` - Atualizar usuário
   - `POST /api/users/:id/inactivate` - Inativar conta
   - `GET /produtos` - Listar produtos
   - `POST /produtos` - Criar produto
   - `PUT /produtos/:id` - Atualizar produto
   - `DELETE /produtos/:id` - Deletar produto
   - `GET /vendas` - Listar vendas
   - `POST /vendas` - Registrar venda

## 🔐 Autenticação

O sistema usa JWT armazenado no `localStorage`.

**Credenciais para teste (modo mock - aceita qualquer valor):**
- Email: qualquer@email.com
- Senha: qualquersenha
- Código de ativação: 1234 (ou qualquer 4 dígitos)

## 📦 Tecnologias

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Estilização
- **shadcn/ui** - Componentes
- **React Router** - Roteamento
- **Axios** - Requisições HTTP
- **Sonner** - Notificações toast
- **Lucide React** - Ícones

## 🎨 Páginas Disponíveis

- `/` - Landing page
- `/auth/register` - Cadastro
- `/auth/activate` - Ativação
- `/auth/login` - Login
- `/dashboard` - Painel principal (protegida)
- `/products` - Gestão de estoque (protegida)
- `/sales` - Registro de vendas (protegida)
- `/profile` - Perfil do usuário (protegida)
- `/reports` - Relatórios (protegida)

## ⚙️ Integração com Docker

Quando integrar com o backend Flask, ajuste seu `docker-compose.yml`:

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://backend:5000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://...
```

## 📝 Notas Importantes

- ✅ O arquivo `src/services/api.ts` já está configurado com interceptors JWT
- ✅ Todas as rotas protegidas redirecionam para login se não autenticado
- ✅ O sistema de autenticação está completo (login, logout, proteção de rotas)
- ✅ Todos os comentários `TODO: INTEGRAÇÃO` indicam pontos de integração
- 🔄 Atualmente em **modo mock** - dados não são persistidos
