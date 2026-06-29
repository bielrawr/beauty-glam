# BeautyGlam

BeautyGlam é uma aplicação de e-commerce de maquiagem desenvolvida com React, TypeScript e Vite. O projeto nasceu de um desafio front-end do Projeto Desenvolve e evoluiu para uma loja virtual com autenticação, carrinho, favoritos, perfil de usuário, endereços, busca de CEP e checkout demonstrativo.

O pagamento é apenas uma simulação. A aplicação não solicita, salva ou envia dados de cartão para gateway de pagamento.

## Funcionalidades

- Home com vitrine de produtos.
- Consumo de produtos por API externa.
- Busca de produtos em tempo real.
- Filtro por categoria.
- Página de detalhes do produto.
- Cards reutilizáveis com imagem, título, categoria e preço.
- Carrinho com Context API e reducer.
- Adicionar, remover, limpar e alterar quantidade de produtos.
- Cálculo automático de total e subtotal.
- Persistência do carrinho em localStorage.
- Sincronização de carrinho para usuários logados.
- Lista de favoritos com persistência.
- Compartilhamento público da lista de favoritos.
- Login, cadastro, recuperação de senha e login com Google via Firebase.
- Rotas protegidas para perfil, favoritos, checkout e sucesso do pedido.
- Perfil do usuário com dados pessoais, pedidos, endereços e segurança.
- Busca automática de endereço por CEP usando ViaCEP.
- Checkout com cupom, endereço de entrega e simulação de pagamento.
- Registro de pedido no Firestore após a simulação.
- Skeleton loading e estados de erro amigáveis.
- Layout responsivo para desktop, tablet e celular.

## Requisitos Do Desafio

O desafio original propunha uma loja virtual com:

- Projeto criado com React e Vite.
- Consumo de API externa para produtos.
- Header funcional com navegação e carrinho.
- Grid responsivo de produtos.
- Card de produto componentizado.
- Preços formatados em real brasileiro.
- Rotas com React Router.
- Página de detalhes em `/product/:id`.
- Filtro por categorias.
- Carrinho com estado global.
- Incremento de quantidade para produtos repetidos.
- Remoção e limpeza do carrinho.
- Total calculado em tempo real.
- Loading e tratamento de erro.
- Persistência com localStorage.
- Organização em componentes, páginas, serviços, contextos, estilos e utilitários.
- README profissional.

## Tecnologias

- React
- TypeScript
- Vite
- React Router DOM
- Context API
- CSS Modules
- Framer Motion
- Lucide React
- Firebase Authentication
- Cloud Firestore
- LocalStorage
- ViaCEP

## Estrutura

```text
src/
  components/
  contexts/
  data/
  firebase/
  pages/
  services/
  styles/
  types/
  utils/
```

## Checkout Simulado

O checkout foi mantido como fluxo demonstrativo para proteger dados sensíveis. Ao clicar em `SIMULAR PAGAMENTO`, a aplicação:

1. Valida login, dados pessoais e endereço.
2. Simula o tempo de processamento.
3. Registra o pedido no Firestore com status `paid`.
4. Exibe uma mensagem de sucesso.
5. Redireciona para a página de confirmação.
6. Limpa o carrinho na página de sucesso.

Nenhum dado de cartão é solicitado, armazenado ou enviado para terceiros.

## Como Rodar

```bash
npm install
npm run dev
```

O projeto abre em:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

## Deploy

O projeto está preparado para deploy como aplicação Vite. Para o login com Google funcionar online, adicione o domínio do deploy no Firebase:

```text
Firebase Console > Authentication > Settings > Authorized domains
```

## Autor

Desenvolvido por Gabriel Rocha para fins de estudo, portfólio e prática de desenvolvimento front-end.
