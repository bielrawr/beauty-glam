# Deploy no Netlify

Este projeto ja esta configurado para rodar como SPA no Netlify.

## Configuracao no Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `22`

O arquivo `netlify.toml` ja define essas opcoes para deploy via Git.

## Deploy manual

Se for subir manualmente:

1. Rode `npm run build`.
2. Envie a pasta `dist` no Netlify.

O arquivo `public/_redirects` e copiado para `dist` no build e garante que rotas como `/login`, `/profile`, `/checkout` e `/auth/action` funcionem ao atualizar a pagina.

## Firebase Authentication

Depois que o Netlify gerar a URL do site, abra o Firebase Console:

1. Va em `Authentication > Settings > Authorized domains`.
2. Adicione o dominio do Netlify sem protocolo e sem barra final.
   Exemplo: `seu-site.netlify.app`.
3. Se usar dominio proprio, adicione tambem esse dominio.
4. Va em `Authentication > Sign-in method` e confirme que o provedor `Google` esta habilitado.

Sem esse dominio autorizado, o login com Google pode falhar no popup ou mostrar erro de dominio nao autorizado.

## URLs locais

Para testar localmente o Google login, use `localhost`, nao `127.0.0.1`.

Exemplo:

```text
http://localhost:5173/login
```

Se estiver usando outra porta local, mantenha `localhost` e troque apenas a porta.
