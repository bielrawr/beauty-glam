# ⚡ VIBE STORE - E-commerce de Alta Performance

Bem-vindo à **VIBE STORE**, uma aplicação de e-commerce moderna desenvolvida como parte de um desafio técnico. O projeto utiliza as tecnologias mais recentes do ecossistema React para entregar uma experiência de usuário (UX) fluida, tipada e totalmente responsiva.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 19** com **TypeScript** (Garantindo robustez e segurança de tipos).
- **Vite**: Build tool ultra-rápida.
- **React Router Dom**: Gerenciamento de rotas (Páginas protegidas e públicas).
- **CSS Modules**: Estilização isolada por componente, evitando conflitos de classes.
- **Lucide React**: Biblioteca de ícones modernos e leves.
- **Firebase SDK**: Integração com Autenticação e Firestore.

### Backend
- **Node.js + Express**: Servidor dedicado para integração com gateway de pagamento.
- **Mercado Pago SDK**: Preparado para processamento de pagamentos reais/sandbox.

---

## 📦 Funcionalidades Implementadas

### 🛒 Carrinho Autônomo & Inteligente
- **Persistência Local**: Itens salvos no `localStorage` são mantidos mesmo após fechar o navegador.
- **Sincronização Nuvem**: Usuários logados têm seu carrinho sincronizado automaticamente com o **Firestore**.
- **Merge de Dados**: Ao fazer login, o sistema mescla itens adicionados como visitante com os itens salvos na conta.
- **Feedback Visual**: Animação "pop" no contador de itens ao adicionar produtos.

### 👤 Gestão de Usuário & Perfil
- **Autenticação Completa**: Login por E-mail/Senha e **Google Sign-In**.
- **Perfil Robusto**: Cadastro de Nome, CPF (com validação real de dígitos), Data de Nascimento e múltiplos números de celular.
- **Endereços Inteligentes**: Busca automática de endereço via **API ViaCEP** ao digitar o CEP.
- **Segurança**: Alteração de e-mail e senha integrada ao Firebase Auth e opção de **Exclusão Permanente de Conta**.
- **Histórico de Pedidos**: Visualização detalhada de compras realizadas, com status e data.

### 🛍️ Experiência de Compra (UX)
- **Localização Total**: Títulos, categorias e descrições dos produtos da Fake Store API traduzidos manualmente para **Português (PT-BR)**.
- **Preloader Animado**: Identidade visual da marca exibida durante o carregamento inicial.
- **Design Mobile-First**: Interface totalmente adaptada para celulares, com menus e grades que se ajustam inteligentemente.
- **Filtro por Categorias**: Navegação simplificada com categorias traduzidas e responsivas.
- **Detalhes do Produto**: Página dedicada com imagem ampliada e descrição completa.

---

## 🛠️ Como Rodar o Projeto

### Pré-requisitos
- Node.js (v18 ou superior)
- NPM ou Yarn

### 1. Configuração do Frontend
```bash
# Entre na pasta raiz do projeto
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```
O frontend estará disponível em `http://localhost:5173`.

### 2. Configuração do Backend (Gateway de Pagamento)
```bash
# Acesse a pasta backend
cd backend

# Instale as dependências
npm install

# Inicie o servidor do Express
node index.js
```
O backend rodará em `http://localhost:3001`.

---

## 🏗️ Arquitetura de Pastas

```text
src/
├── components/   # Componentes reutilizáveis (Card, Header, etc)
├── contexts/     # Provedores de estado global (Auth, Cart, Product)
├── firebase/     # Configuração inicial do Firebase
├── hooks/        # Hooks customizados
├── pages/        # Páginas principais da aplicação
├── services/     # Chamadas de API e integração com Firestore
├── styles/       # Estilos globais e variáveis
├── types/        # Definições de interfaces TypeScript
└── utils/        # Validadores e tradutores de dados
```

---

## 🔑 Configuração do Firebase
Para que a autenticação e o banco de dados funcionem, certifique-se de configurar as chaves no arquivo `src/firebase/firebase.ts`. O projeto está configurado para usar o Firestore em modo nativo para persistência de carrinhos e pedidos.

---

Desenvolvido por Gabriel Rocha
# desafio-pd
