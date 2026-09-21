# admin-tredella

The operations console for the Tredella marketplace — the third front end
beside `buyer-tredella` and `seller-tredella`, all talking to the same
`backend-tredella` GraphQL API.

## Running it

```bash
npm install
npm run dev
```

The API defaults to `http://localhost:4000/graphql`. Point it elsewhere with
`NEXT_PUBLIC_GRAPHQL_URL` in `.env.local`.

`npm start` serves on port 5009, so the seller app (5008) and this can run side
by side.

## Conventions

Deliberately the same as the seller app, so moving between them costs nothing:

- **Next.js App Router** with TypeScript, `src/` layout.
- **Bare path aliases** — `components/…`, `lib/…`, `data/…`, `graphql/…`,
  `types/…`, `config/…`, `utils/…`. Not `@/`. See `tsconfig.json`.
- **Tailwind 3** with the shared brand tokens in `src/app/globals.css`
  (`primary`, `secondary`, `gray`, `background`) and the numeric font sizes
  (`text-13`, `text-14`, …) from `tailwind.config.ts`.
- **Apollo Client** with the JWT attached per request from a cookie
  (`src/lib/token.ts`). No NextAuth.
- The same ESLint rules as the other apps.

The admin token lives under its own cookie name, so an admin session and a
seller session can coexist in one browser without either picking up the other's.
