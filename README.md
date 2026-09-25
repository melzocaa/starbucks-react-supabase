# Starbucks React + Supabase

Este projeto é uma conversão do frontend Starbucks original para React, mantendo a estética original: Poppins, verde Starbucks, banner do café, cards 2 colunas, rodapé, WhatsApp, modal de produto e carrinho.

A diferença principal é que categorias e produtos agora são buscados diretamente pelo `@supabase/supabase-js`.

## Configuração

Crie `.env.local`:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_PUBLISHABLE_KEY
```

Depois:

```bash
npm install
npm run dev
```

Para Capacitor:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npm run build
npx cap add android
npx cap sync
npx cap open android
```

Não envie `.env.local` ao GitHub.
