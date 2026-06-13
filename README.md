# BEAUTYGLAM - E-commerce de Maquiagem

BEAUTYGLAM é uma aplicação de e-commerce de maquiagem construída com React, TypeScript, Firebase e integração com Mercado Pago. O projeto simula uma loja virtual completa, com vitrine de produtos, autenticação, carrinho persistente, lista de desejos, perfil do usuário, endereços, checkout, cupons, pedidos e integração backend para criação de preferência de pagamento.

O foco do desenvolvimento foi criar uma experiência de compra moderna, responsiva e funcional, aplicando conceitos de arquitetura frontend, gerenciamento de estado, persistência local/remota, rotas protegidas, integração com APIs externas e separação clara entre interface, serviços e regras de negócio.

## Objetivo do Projeto

Este projeto foi desenvolvido para demonstrar, em um cenário realista de loja online, habilidades como:

- Construção de aplicações React com TypeScript.
- Organização de componentes, páginas, serviços, contextos e tipos.
- Gerenciamento de estado global com Context API, reducers e hooks.
- Autenticação com Firebase Auth.
- Persistência de dados com Firestore.
- Integração entre frontend e backend.
- Integração com gateway de pagamento em ambiente sandbox.
- Boas práticas de UX para fluxo de compra.
- Layout responsivo e visual orientado ao segmento de beleza.
- Validação de formulários e tratamento de estados de carregamento/erro.

## Visão Geral da Aplicação

A BEAUTYGLAM funciona como uma loja de maquiagem com fluxo completo:

1. O usuário acessa a Home e visualiza uma vitrine de produtos.
2. Pode buscar produtos, filtrar por categoria e abrir detalhes.
3. Pode adicionar itens ao carrinho ou à lista de desejos.
4. Pode compartilhar a lista de desejos por um link público.
5. Pode criar conta, entrar com e-mail/senha, Google ou recuperar senha por e-mail.
6. Ao fazer login, carrinho e lista de desejos são sincronizados com a nuvem.
7. O usuário pode editar dados pessoais, salvar endereços e consultar pedidos.
8. No checkout, o endereço é carregado automaticamente a partir do perfil.
9. O usuário pode aplicar cupons e gerar uma preferência de pagamento via Mercado Pago.
10. Após a confirmação, o carrinho é limpo e o pedido fica registrado no Firestore.

## Stack Utilizada

### Frontend

- React 19
- TypeScript
- Vite
- React Router DOM
- CSS Modules
- Framer Motion
- Lucide React
- Firebase SDK
- Mercado Pago SDK React

### Backend

- Node.js
- Express
- CORS
- Dotenv
- Mercado Pago SDK

### Banco e autenticação

- Firebase Authentication
- Cloud Firestore
- LocalStorage para cache e persistência offline

### APIs externas

- Makeup API para carregamento de produtos.
- ViaCEP para preenchimento automático de endereços.
- Mercado Pago para geração de preferência de pagamento.

## Funcionalidades Implementadas

### Home e vitrine de produtos

A Home é a entrada principal da loja. Ela apresenta uma hero section editorial com imagens, animações e chamada para a vitrine.

Funcionalidades:

- Banner visual com imagens editoriais.
- Rotação automática de imagens da hero section.
- Botões de navegação para rolar até a vitrine.
- Listagem de produtos carregados da Makeup API.
- Tradução/localização de títulos, categorias e descrições.
- Filtro por categoria.
- Busca global integrada ao Header.
- Normalização de texto para busca sem depender de acentos.
- Estado de carregamento com loader visual.
- Estado de erro caso a API falhe.
- Estado vazio quando nenhum produto é encontrado.

Lógica principal:

- Os produtos são buscados no `ProductContext`.
- A resposta da Makeup API é transformada para o formato interno `Product`.
- Os produtos são armazenados em cache no `localStorage`.
- O cache permite renderizar a vitrine mais rápido em acessos futuros.
- A busca compara título, descrição e categoria normalizados.
- Ao digitar no campo de busca, a aplicação redireciona para a Home e rola até os produtos.

Arquivos principais:

- `src/pages/Home.tsx`
- `src/contexts/ProductContext.tsx`
- `src/data/productDescriptions.ts`
- `src/services/productsApi.ts`
- `src/utils/productTranslations.ts`
- `src/components/ProductCard.tsx`

### Catálogo de produtos

Os produtos vêm da Makeup API e são padronizados em um modelo interno usado por todo o app.

Modelo interno:

```ts
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: {
    rate: number;
    count: number;
  };
}
```

Transformações aplicadas:

- `name` da API vira `title`.
- `price` é convertido para número.
- Produtos sem preço recebem fallback.
- `category` usa categoria da API ou `product_type`.
- Imagem usa `api_featured_image` ou `image_link`.
- Rating é convertido para número.
- Categorias comuns são traduzidas para português.
- Descrições em inglês da API são substituídas por textos locais em português.
- As descrições ficam disponíveis em uma camada separada da API, facilitando manutenção editorial.

### Camada local de descrições

As descrições exibidas na vitrine e na página de detalhes não dependem diretamente do texto retornado pela Makeup API.

O projeto possui uma camada local em:

- `src/data/productDescriptions.ts`

Essa camada contém:

- Descrições por categoria.
- Descrições por linha de produto, usando palavras-chave do título.
- Fallback geral para produtos sem correspondência específica.

Fluxo da descrição:

```text
Produto vindo da Makeup API
  -> productsApi.ts normaliza o formato base
  -> productTranslations.ts traduz título/categoria
  -> productDescriptions.ts escolhe a descrição PT-BR local
  -> ProductCard / ProductDetails exibem o conteúdo localizado
```

Vantagens:

- Evita exibir descrições em inglês.
- Permite revisar textos de produto sem alterar integração com API.
- Mantém o conteúdo disponível mesmo que a descrição da API seja genérica, ausente ou inconsistente.
- Facilita evoluir para descrições 100% editoriais por produto no futuro.

### Card de produto

Cada produto é exibido em um card reutilizável.

Funcionalidades:

- Imagem do produto.
- Categoria.
- Título.
- Preço.
- Badge visual de novidade para determinados produtos.
- Avaliação, quando disponível.
- Botão rápido para adicionar ao carrinho.
- Botão para adicionar/remover da lista de desejos.
- Link para página de detalhes.

Lógica:

- O card usa `useCart` para inserir produtos no carrinho.
- Usa `useWishlist` para alternar favoritos.
- Eventos de clique nos botões impedem a navegação do card quando a ação é adicionar/remover.

Arquivo principal:

- `src/components/ProductCard.tsx`

### Página de detalhes do produto

A página de detalhes exibe informações completas de um produto selecionado.

Funcionalidades:

- Busca do produto por `id` da rota.
- Loader durante carregamento.
- Estado de erro se o produto não for encontrado.
- Imagem em destaque.
- Categoria.
- Título.
- Preço formatado em BRL.
- Simulação de parcelamento em 10x.
- Descrição.
- Avaliação visual com estrelas.
- Botão para adicionar ao carrinho.
- Botão para adicionar/remover da lista de desejos.
- Benefícios comerciais como frete grátis, produto original e devolução.

Lógica:

- A rota `/product/:id` recebe o ID pelo React Router.
- O serviço `getProductById` busca o item na Makeup API.
- O produto é traduzido/localizado antes de ser exibido.
- A lista de desejos é consultada para definir o estado visual do botão.

Arquivo principal:

- `src/pages/ProductDetails.tsx`

### Carrinho de compras

O carrinho foi implementado com Context API e `useReducer`, mantendo a regra de negócio concentrada em um reducer.

Funcionalidades:

- Adicionar produto.
- Remover produto.
- Alterar quantidade.
- Remover automaticamente quando a quantidade chega a zero.
- Esvaziar carrinho.
- Calcular total de itens.
- Calcular preço total.
- Persistir no `localStorage`.
- Sincronizar com Firestore para usuários logados.
- Fazer merge entre carrinho local e carrinho remoto após login.

Lógica de merge:

- O carrinho remoto é carregado do Firestore.
- O carrinho local é carregado do `localStorage`.
- Os itens são combinados por `productId`.
- Quando o mesmo item existe nos dois lugares, a maior quantidade é preservada.
- O resultado final é salvo novamente no Firestore.

Ações do reducer:

```ts
type CartAction =
  | { type: 'HYDRATE'; payload: Cart }
  | { type: 'ADD'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE'; payload: number }
  | { type: 'SET_QTY'; payload: { productId: number; quantity: number } }
  | { type: 'CLEAR' };
```

Persistência:

- Visitante: carrinho fica no `localStorage`.
- Usuário logado: carrinho fica no `localStorage` e no Firestore.
- Salvamento remoto usa debounce para evitar excesso de escritas.

Arquivos principais:

- `src/contexts/CartContext.tsx`
- `src/services/cartStorage.ts`
- `src/services/cartRemote.ts`
- `src/pages/Cart.tsx`

### Lista de desejos

A lista de desejos permite favoritar produtos e recuperá-los depois.

Funcionalidades:

- Adicionar produto à lista.
- Remover produto da lista.
- Alternar favorito.
- Limpar lista.
- Gerar link compartilhável da lista.
- Copiar link público para a área de transferência.
- Exibir lista compartilhada em rota pública, sem exigir login.
- Contador no Header.
- Página dedicada para listar favoritos.
- Adicionar item favorito diretamente ao carrinho.
- Persistência local por visitante.
- Persistência remota por usuário logado.
- Merge entre favoritos locais, favoritos por usuário e favoritos remotos.

Lógica:

- A lista usa `useReducer`, assim como o carrinho.
- Cada item favorito é armazenado como `WishlistItem`.
- Ao fazer login, o app combina:
  - favoritos atuais em memória,
  - favoritos salvos localmente para o usuário,
  - favoritos salvos no Firestore.
- Após sincronizar, remove a wishlist genérica local para evitar duplicidade entre visitantes e usuários logados.
- Ao logout, salva a lista do usuário antes de limpar o estado em memória.
- Para compartilhamento, os itens favoritos são serializados em JSON, codificados em base64 URL-safe e anexados à URL pública `/wishlist/shared`.
- A rota pública decodifica os dados, valida o formato dos itens e renderiza a lista compartilhada.
- Quem recebe o link pode abrir os produtos e adicionar itens ao carrinho.

Arquivos principais:

- `src/contexts/WishlistContext.tsx`
- `src/services/wishlistStorage.ts`
- `src/services/wishlistRemote.ts`
- `src/pages/Wishlist.tsx`
- `src/pages/SharedWishlist.tsx`
- `src/utils/wishlistShare.ts`
- `src/components/Header.tsx`
- `src/components/ProductCard.tsx`

### Autenticação

A autenticação é feita com Firebase Auth.

Funcionalidades:

- Cadastro com e-mail e senha.
- Envio de confirmação de e-mail para novos usuários.
- Login com e-mail e senha.
- Login com Google.
- Recuperação de senha por e-mail.
- Logout com modal de confirmação.
- Cache local do perfil para carregamento mais rápido.
- Criação automática de perfil no Firestore.
- Atualização de e-mail e senha.
- Exclusão de conta.
- Rotas protegidas para áreas privadas.

Fluxo de cadastro:

1. Usuário informa nome, e-mail, senha e confirmação.
2. A senha é validada em tempo real.
3. O Firebase cria a conta.
4. O Firestore recebe um perfil inicial.
5. O Firebase envia o e-mail de verificação para o usuário.
6. O perfil é salvo em cache local.
7. O usuário é redirecionado para `/verify-email`.
8. As rotas privadas só são liberadas após `emailVerified`.

Requisitos de senha:

- Mínimo de 8 caracteres.
- Uma letra maiúscula.
- Uma letra minúscula.
- Um número.
- Um símbolo.

Fluxo de login com Google:

1. Abre popup do Google.
2. Verifica se o perfil já existe no Firestore.
3. Se não existir, cria perfil com dados básicos do Google.
4. Se existir, carrega o perfil salvo.
5. Atualiza cache local.

Fluxo de recuperação de senha:

1. Usuário informa o e-mail no formulário de login.
2. Clica em `Esqueci minha senha`.
3. O `AuthContext` chama `sendPasswordResetEmail` do Firebase Auth.
4. O Firebase envia o link de redefinição para o e-mail informado.
5. O link abre a rota `/auth/action` no modo `resetPassword`.
6. A tela de redefinição aparece em português.
7. Após salvar a nova senha, o usuário é redirecionado automaticamente para `/login`.

Fluxo de confirmação de e-mail:

1. Após o cadastro, o `AuthContext` chama `sendEmailVerification`.
2. O usuário chega à tela `/verify-email`.
3. A tela informa, em português, que o link foi enviado e permite reenviar o e-mail.
4. O link do e-mail abre a rota customizada `/auth/action` no modo `verifyEmail`.
5. A rota lê `mode`, `oobCode`, `continueUrl` e `lang` enviados pelo Firebase.
6. A confirmação é aplicada com `applyActionCode`.
7. A tela exibe sucesso em português.
8. A sessão atual é encerrada por segurança.
9. O usuário é redirecionado automaticamente para `/login`.
10. As rotas privadas só são liberadas após `emailVerified`.

Arquivos principais:

- `src/contexts/AuthContext.tsx`
- `src/pages/Login.tsx`
- `src/pages/Register.tsx`
- `src/pages/VerifyEmail.tsx`
- `src/pages/EmailAction.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/services/userService.ts`

### Rotas protegidas

As rotas privadas usam o componente `ProtectedRoute`.

Rotas protegidas:

- `/profile`
- `/wishlist`
- `/checkout`
- `/order-success`

Comportamento:

- Enquanto o Firebase valida a sessão, a rota não renderiza conteúdo.
- Se não houver usuário autenticado, redireciona para `/login`.
- Se o usuário existe, mas ainda não confirmou o e-mail, redireciona para `/verify-email`.
- Se houver usuário autenticado, renderiza a página solicitada.

Arquivo principal:

- `src/components/ProtectedRoute.tsx`

### Perfil do usuário

A página de perfil reúne dados pessoais, pedidos, endereços e segurança da conta.

Abas implementadas:

- Perfil
- Pedidos
- Endereços
- Segurança

Funcionalidades de perfil:

- Editar nome.
- Editar CPF.
- Editar data de nascimento.
- Validar CPF por tamanho de documento limpo.
- Salvar alterações no Firestore.
- Atualizar cache local do perfil.

Funcionalidades de pedidos:

- Buscar pedidos do usuário logado.
- Ordenar pedidos pelos mais recentes.
- Exibir status do pedido.
- Exibir itens do pedido.
- Exibir valor total.

Status suportados:

- `pending`
- `paid`
- `shipped`
- `delivered`
- `cancelled`

Funcionalidades de segurança:

- Atualizar e-mail da conta.
- Atualizar senha.
- Confirmar senha antes de salvar.
- Excluir conta permanentemente.

Arquivos principais:

- `src/pages/Profile.tsx`
- `src/services/userService.ts`
- `src/services/orderService.ts`
- `src/contexts/AuthContext.tsx`

### Endereços e ViaCEP

O usuário pode salvar múltiplos endereços no perfil.

Funcionalidades:

- Adicionar endereço.
- Editar endereço.
- Remover endereço.
- Definir tipo do endereço, como Casa ou Trabalho.
- Buscar endereço automaticamente pelo CEP.
- Preencher rua, cidade e estado com a API ViaCEP.
- Aplicar máscara de CEP.

Modelo de endereço:

```ts
export interface Address {
  id: number;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  zip: string;
  type: string;
}
```

Lógica:

- O CEP é limpo com regex para manter apenas números.
- A busca só é disparada quando existem 8 dígitos.
- A resposta do ViaCEP preenche campos conhecidos.
- O endereço é salvo no array `addresses` do perfil no Firestore.

Arquivos principais:

- `src/pages/Profile.tsx`
- `src/pages/Checkout.tsx`
- `src/utils/validators.ts`
- `src/services/userService.ts`

### Checkout

O checkout reúne revisão dos itens, endereço, cupom e pagamento.

Funcionalidades:

- Listagem dos itens do carrinho.
- Exibição de subtotal.
- Frete grátis.
- Aplicação de cupom.
- Cálculo de desconto.
- Cálculo de total final.
- Carregamento automático do primeiro endereço salvo no perfil.
- Edição rápida do endereço de entrega.
- Busca de endereço por CEP.
- Criação de pedido no Firestore.
- Criação de preferência de pagamento no backend.
- Renderização do Wallet Brick do Mercado Pago.

Fluxo do checkout:

1. Usuário acessa `/checkout`.
2. A rota exige autenticação.
3. O app carrega dados do carrinho e perfil.
4. Se houver endereço salvo, ele é preenchido automaticamente.
5. Usuário pode editar endereço ou aplicar cupom.
6. Ao finalizar, o app valida campos obrigatórios do endereço.
7. Cria um pedido com status `pending`.
8. Envia os itens para o backend.
9. O backend cria uma preferência no Mercado Pago.
10. O frontend renderiza o botão de pagamento.

Cupons implementados:

| Cupom | Tipo | Valor |
| --- | --- | --- |
| `BEAUTY10` | Percentual | 10% |
| `WELCOME20` | Percentual | 20% |
| `GLOW15` | Percentual | 15% |
| `SAVE50` | Valor fixo | R$ 50,00 |
| `FIRSTOFF` | Valor fixo | R$ 30,00 |

Regras dos cupons:

- O código é convertido para uppercase.
- Espaços extras são removidos.
- Cupom vazio limpa o desconto.
- Cupom inválido mostra mensagem de erro.
- Desconto fixo nunca ultrapassa o total do carrinho.

Arquivos principais:

- `src/pages/Checkout.tsx`
- `src/services/orderService.ts`
- `backend/index.js`

### Pedidos

Os pedidos são armazenados no Firestore.

Modelo do pedido:

```ts
export interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: unknown;
  address: Address;
}
```

Funcionalidades:

- Criar pedido.
- Associar pedido ao UID do usuário.
- Salvar itens do carrinho.
- Salvar total final.
- Salvar endereço de entrega.
- Salvar status inicial.
- Buscar pedidos do usuário.
- Ordenar por data de criação.

Arquivos principais:

- `src/services/orderService.ts`
- `src/pages/Profile.tsx`
- `src/pages/Checkout.tsx`
- `src/pages/OrderSuccess.tsx`

### Integração Mercado Pago

A integração com Mercado Pago foi separada em frontend e backend.

Frontend:

- Inicializa o SDK React do Mercado Pago.
- Solicita ao backend a criação da preferência.
- Recebe o `preferenceId`.
- Renderiza o componente `Wallet`.

Backend:

- Expõe a rota `POST /create-preference`.
- Recebe os itens do carrinho.
- Cria uma preferência com o SDK do Mercado Pago.
- Retorna o ID da preferência para o frontend.

Arquivo backend:

- `backend/index.js`

Rota:

```http
POST /create-preference
```

Exemplo de payload:

```json
{
  "items": [
    {
      "title": "Produto",
      "unit_price": 49.9,
      "quantity": 1,
      "currency_id": "BRL"
    }
  ]
}
```

Resposta esperada:

```json
{
  "id": "preference_id"
}
```

### Página de sucesso

Após a confirmação de pedido, a página de sucesso exibe uma mensagem final e limpa o carrinho.

Funcionalidades:

- Mensagem de pedido recebido.
- Botão para continuar comprando.
- Link para consultar pedidos no perfil.
- Limpeza do carrinho ao montar a página.

Arquivo principal:

- `src/pages/OrderSuccess.tsx`

### Header

O Header centraliza navegação e ações globais.

Funcionalidades:

- Logo com link para Home.
- Scroll suave para o topo quando o usuário já está na Home.
- Campo de busca na Home.
- Redirecionamento para Home ao buscar em outra rota.
- Botão para limpar busca.
- Atalho para perfil/login.
- Saudação personalizada com nome do perfil, nome do Firebase ou e-mail.
- Modal de confirmação de logout.
- Atalho para lista de desejos com contador animado.
- Atalho para carrinho com contador animado.

Arquivo principal:

- `src/components/Header.tsx`

### Footer

O Footer apresenta links de navegação e reforça a identidade da loja.

Arquivo principal:

- `src/components/Footer.tsx`

### Transições e animações

O projeto usa Framer Motion para melhorar a percepção de fluidez.

Animações implementadas:

- Transição entre páginas.
- Entrada de cards de produto.
- Contadores animados no Header.
- Loader animado.
- Hero com imagens em transição.

Arquivo principal:

- `src/components/PageTransition.tsx`

## Arquitetura do Projeto

```text
.
├── backend/
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   │   └── imagens da hero section
│   ├── components/
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── PageTransition.tsx
│   │   ├── ProductCard.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   ├── ProductContext.tsx
│   │   └── WishlistContext.tsx
│   ├── data/
│   │   └── productDescriptions.ts
│   ├── firebase/
│   │   └── firebase.ts
│   ├── pages/
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── OrderSuccess.tsx
│   │   ├── ProductDetails.tsx
│   │   ├── Profile.tsx
│   │   ├── Register.tsx
│   │   ├── SharedWishlist.tsx
│   │   ├── VerifyEmail.tsx
│   │   └── Wishlist.tsx
│   ├── services/
│   │   ├── cartRemote.ts
│   │   ├── cartStorage.ts
│   │   ├── orderService.ts
│   │   ├── productsApi.ts
│   │   ├── userService.ts
│   │   ├── wishlistRemote.ts
│   │   └── wishlistStorage.ts
│   ├── styles/
│   │   └── globals.css
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── productTranslations.ts
│   │   ├── wishlistShare.ts
│   │   └── validators.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── eslint.config.js
├── package.json
├── tsconfig.json
└── vite.config.js
```

## Organização por Camadas

### `pages`

Contém telas completas da aplicação. Cada página coordena componentes, contextos e serviços necessários para seu fluxo.

Exemplos:

- `Home.tsx` coordena vitrine, busca e filtros.
- `Checkout.tsx` coordena carrinho, endereço, cupom e pagamento.
- `Profile.tsx` coordena dados pessoais, pedidos, endereços e segurança.

### `components`

Contém peças reutilizáveis e elementos estruturais.

Exemplos:

- `Header`
- `Footer`
- `ProductCard`
- `ProtectedRoute`
- `PageTransition`

### `contexts`

Centraliza estados globais e regras compartilhadas.

Contextos:

- `AuthContext`: usuário, perfil, login, cadastro, logout e segurança.
- `ProductContext`: catálogo, cache, busca e atualização de produtos.
- `CartContext`: carrinho, persistência e sincronização.
- `WishlistContext`: favoritos, persistência e sincronização.

### `data`

Contém conteúdo local da aplicação que não deve depender diretamente de APIs externas.

Exemplo:

- `productDescriptions.ts`: descrições em português para produtos, linhas e categorias.

### `services`

Contém integrações externas, Firestore e persistência local.

Exemplos:

- `productsApi.ts`: Makeup API.
- `orderService.ts`: pedidos no Firestore.
- `userService.ts`: perfil no Firestore.
- `cartRemote.ts`: carrinho remoto.
- `cartStorage.ts`: carrinho local.

### `types`

Define os modelos TypeScript compartilhados entre páginas, contextos e serviços.

### `utils`

Contém funções utilitárias, validações, máscaras e tradução de dados.

## Fluxos de Dados

### Fluxo de produtos

```text
Makeup API
  -> productsApi.ts
  -> normalização para Product
  -> descrições PT-BR em productDescriptions.ts
  -> ProductContext
  -> cache localStorage
  -> Home / ProductCard / ProductDetails
```

### Fluxo de autenticação

```text
Firebase Auth
  -> AuthContext
  -> verificação de e-mail
  -> perfil no Firestore
  -> cache localStorage
  -> Header / ProtectedRoute / VerifyEmail / Profile
```

### Fluxo do carrinho

```text
ProductCard ou ProductDetails
  -> useCart()
  -> CartContext reducer
  -> localStorage
  -> Firestore, se usuário estiver logado
  -> Cart / Checkout / Header
```

### Fluxo da lista de desejos

```text
ProductCard ou ProductDetails
  -> useWishlist()
  -> WishlistContext reducer
  -> localStorage
  -> Firestore, se usuário estiver logado
  -> Header / Wishlist
```

### Fluxo de compartilhamento da lista de desejos

```text
Wishlist
  -> encodeWishlistShare()
  -> URL pública /wishlist/shared?data=...
  -> decodeWishlistShare()
  -> SharedWishlist
  -> ProductDetails ou Cart
```

### Fluxo de checkout

```text
Checkout
  -> valida endereço
  -> aplica cupom
  -> cria pedido no Firestore
  -> chama backend Express
  -> backend cria preferência Mercado Pago
  -> frontend renderiza Wallet Brick
```

## Rotas da Aplicação

| Rota | Tipo | Descrição |
| --- | --- | --- |
| `/` | Pública | Home com vitrine de produtos |
| `/login` | Pública | Login com e-mail/senha e Google |
| `/register` | Pública | Cadastro de nova conta |
| `/verify-email` | Pública autenticada | Confirmação de e-mail do usuário |
| `/auth/action` | Pública | Tratamento customizado de links do Firebase Auth |
| `/product/:id` | Pública | Detalhes do produto |
| `/cart` | Pública | Carrinho de compras |
| `/profile` | Protegida | Perfil, pedidos, endereços e segurança |
| `/wishlist` | Protegida | Lista de desejos |
| `/wishlist/shared` | Pública | Visualização de lista de desejos compartilhada |
| `/checkout` | Protegida | Finalização de compra |
| `/order-success` | Protegida | Confirmação do pedido |

## Modelos TypeScript

### Product

Representa um produto da loja.

### Cart e CartItem

Representam o carrinho e seus itens.

### Wishlist e WishlistItem

Representam a lista de desejos.

### UserProfile

Representa o perfil complementar do usuário salvo no Firestore.

### Address

Representa endereço salvo pelo usuário.

### Order

Representa pedido registrado no Firestore.

Arquivo:

- `src/types/index.ts`

## Persistência

### LocalStorage

Usado para:

- Cache de produtos.
- Carrinho de visitante.
- Lista de desejos de visitante.
- Cache do perfil do usuário.

Vantagens:

- Melhora a experiência em recarregamentos.
- Permite manter carrinho e favoritos sem login.
- Reduz estado vazio durante carregamentos.

### Firestore

Usado para:

- Perfis de usuário.
- Endereços.
- Carrinho remoto.
- Lista de desejos remota.
- Pedidos.

Coleções usadas:

- `profiles`
- `carts`
- `orders`

## Design e UX

O visual da aplicação foi pensado para uma loja de beleza com estética editorial.

Características:

- Interface responsiva.
- Uso de CSS Modules para escopo de estilo por componente.
- Cores e tipografia centralizadas em estilos globais.
- Cards de produto com foco em imagem, preço e ação rápida.
- Microinterações com Framer Motion.
- Feedback visual para loading, erro, cupom inválido e cupom aplicado.
- Header com ações sempre acessíveis.
- Checkout em seções para reduzir fricção.

## Validações e Máscaras

Utilitários implementados:

- Validação básica de e-mail.
- Formatação de moeda BRL.
- Validação de campos obrigatórios de endereço.
- Geração de ID de cliente.
- Máscara de CPF.
- Máscara de CEP.
- Validação simples de CPF por quantidade de dígitos.

Arquivo:

- `src/utils/validators.ts`

## Como Rodar o Projeto

### Pré-requisitos

- Node.js
- npm
- Conta/projeto Firebase configurado
- Credenciais do Mercado Pago para ambiente sandbox ou produção

### Instalar dependências do frontend

```bash
npm install
```

### Rodar o frontend

```bash
npm run dev
```

O frontend ficará disponível em:

```text
http://localhost:5173
```

### Instalar dependências do backend

```bash
cd backend
npm install
```

### Rodar o backend

```bash
node index.js
```

O backend ficará disponível em:

```text
http://localhost:3001
```

### Build de produção

```bash
npm run build
```

### Preview do build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Configuração do Firebase

O Firebase é inicializado em:

```text
src/firebase/firebase.ts
```

Serviços usados:

- `getAuth`
- `getFirestore`

## Configuração do Mercado Pago

Frontend:

- Inicialização em `src/pages/Checkout.tsx`.
- Uso do componente `Wallet`.

Backend:

- Configuração em `backend/index.js`.
- Uso de `MercadoPagoConfig`.
- Criação de preferência com `Preference`.

Variável de ambiente recomendada:

```env
ACCESS_TOKEN=seu_access_token_do_mercado_pago
```

## Decisões Técnicas

### Context API em vez de biblioteca externa de estado

O projeto usa Context API porque os estados globais são bem definidos:

- autenticação,
- produtos,
- carrinho,
- lista de desejos.

Isso evita adicionar uma dependência extra e mantém a lógica concentrada em providers específicos.

### Reducer para carrinho e wishlist

Carrinho e lista de desejos usam `useReducer` porque possuem ações claras e previsíveis.

Benefícios:

- Estado mais previsível.
- Facilidade para adicionar novas ações.
- Melhor separação entre UI e regra de negócio.
- Menos risco de mutação acidental.

### Cache local

O cache local foi usado para melhorar a experiência:

- Produtos aparecem mais rapidamente após o primeiro carregamento.
- Carrinho e favoritos sobrevivem a reloads.
- Perfil pode aparecer no Header antes da resposta do Firestore.

### Serviços isolados

Chamadas para Firebase, APIs e localStorage ficam fora dos componentes.

Benefícios:

- Componentes mais focados na interface.
- Regras de integração mais fáceis de testar e manter.
- Menor duplicação de lógica.

### CSS Modules

CSS Modules foram usados para evitar colisão de classes e manter cada página/componente com seu próprio escopo visual.

## Melhorias Futuras

Pontos planejados ou recomendados para evoluir o projeto:

- Validar webhooks do Mercado Pago antes de marcar pedido como pago.
- Criar pedido somente após confirmação real de pagamento ou separar pedido temporário de pedido confirmado.
- Aplicar desconto também na preferência enviada ao Mercado Pago.
- Mover chaves sensíveis para variáveis de ambiente.
- Restringir CORS do backend para domínios autorizados.
- Adicionar testes automatizados com Vitest e Testing Library.
- Adicionar testes end-to-end com Playwright.
- Adicionar paginação ou carregamento incremental de produtos.
- Adicionar code splitting por rota para reduzir o bundle inicial.
- Adicionar painel administrativo para gerenciar pedidos e status.
- Melhorar validação real de CPF com dígitos verificadores.
- Adicionar controle de estoque.
- Adicionar cálculo real de frete.

## Destaques para Portfólio

Este projeto demonstra:

- Capacidade de construir uma SPA completa com React e TypeScript.
- Integração com autenticação real.
- Confirmação de novo usuário por e-mail.
- Recuperação de senha integrada ao Firebase Auth.
- Persistência híbrida entre localStorage e Firestore.
- Sincronização de estado entre visitante e usuário autenticado.
- Compartilhamento público de favoritos por URL codificada.
- Uso de reducers para regras de negócio.
- Integração com gateway de pagamento via backend próprio.
- Organização de código em camadas.
- Uso de rotas públicas e protegidas.
- Consumo de APIs externas.
- Tratamento de loading, erro, estado vazio e feedback de usuário.
- Experiência responsiva para loja virtual.

## Autor

Desenvolvido por Gabriel Rocha.

Projeto criado para fins de estudo, demonstração técnica e portfólio.
