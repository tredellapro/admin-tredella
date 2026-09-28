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

## Signing in

There is no sign-up and no self-service password reset: an admin account is
created by another admin. Make one from the backend repo:

```bash
npm run admin:create -- you@tredella.com yourpassword "Your Name"
```

Run with no arguments and it creates `admin2@gmail.com` / `admin123`, which is
the local development account. Re-running for an existing admin resets their
password — that is the way back in for someone locked out.

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

## Screens

| Route | Screen |
| --- | --- |
| `/` | Analytics — the console opens here |
| `/login` | Sign in (the only public route) |
| `/users`, `/users/[id]` | User Management, User Profile |
| `/categories` | Categories and subcategories |
| `/brands` | Brands |
| `/orders`, `/orders/[id]` | Order History, Order Information |
| `/products`, `/products/[id]` | Product List, Product Information — including approval |
| `/stores`, `/stores/[id]` | Stores, Store Details (the seller profile) |
| `/verification`, `/verification/[id]` | Seller verification — trade licences and documents |
| `/plans` | Manage Plans — price, discount and the points |
| `/withdrawals`, `/withdrawals/[id]` | Withdraw Request, Withdraw Information |
| `/chats` | Support conversations with buyers and sellers |
| `/complaints`, `/complaints/[id]` | Manage Complaints, Complaint Support |
| `/settings` | Profile and password |

Every screen in the sidebar is built.

Every screen is responsive. Below `lg` the sidebar becomes a drawer; below `md`
each table row is re-laid out as a card, because a seven-column table cannot be
read on a phone whichever way you squeeze it.

## The one rule worth knowing

`src/lib/productApproval.ts` decides whether a listing can be sold. Three
separate parties have a say and the module keeps them apart:

- **the admin** approves or rejects it,
- **the seller** switches it on or off in their own dashboard,
- **stock** has to be greater than zero.

Approving a listing therefore does *not* put it on sale if the seller has it
switched off, and rejecting one does not flip the seller's switch behind their
back. The module is dependency-free so it can be compiled and exercised on its
own; the cases it covers are in its tests.

## What the backend still owes

These screens run on the sample rows in `src/data` because the API cannot
answer their questions yet. In rough order of how much is blocked without them:

1. **`Product.approval`** — Prisma's `Product` has no status column at all, so
   today a seller's listing is live the instant they save it. Without this
   field the whole review workflow is decoration, and the buyer storefront has
   no way to exclude unreviewed listings.
2. **Marketplace-wide queries** — every existing resolver for products, orders
   and sellers is scoped to one buyer or the signed-in seller. Admin needs
   unscoped, paginated, filterable versions.
3. **`User.status`** and **store status** — the designs show Active/Inactive
   for both; neither exists. Deactivation is also what the seller app's account
   deletion needs, since that only deactivates.
4. **A `Brand` model** — `Product.brand` is free text, so the same brand can be
   spelled three ways across three stores. The Brands screen only means
   something once brands are rows.
5. **Descriptions on `Category` / `Subcategory`** — the Categories table shows
   one per subcategory; there is no column.
6. **Rate limiting on `login`** — there is none, which matters more for a
   super-admin console than for the storefront.

## More rules worth knowing

`src/lib/withdrawals.ts` is the other half of the seller app's payout rules.
Before an admin can release money it checks the seller's cleared balance,
whether any orders were never dispatched, whether the store is suspended, and
whether there is a bank account to send to at all. Approved and Rejected are
both terminal — money that has left cannot be pulled back from a dropdown.
The admin and the seller see **different words for the same state** (Approved
vs Completed); both maps live in that file and must be kept in step.

`src/lib/plans.ts` covers price, discount and the feature list. There are
exactly two plans and no way to create a third, because that is a product
decision. A discount above 90% is refused: a free plan is its own decision,
not something to reach by fat-fingering a zero.

## Newer gaps

7. **No profile mutation** — there is no `updateProfile`/`updateMe`, so the
   Settings profile tab cannot save a name or an avatar, and there is no
   upload endpoint for the picture. `changePassword` does exist and the
   Account tab uses it for real.
8. **No discount column on `Plan`** — an admin can set one here and has
   nowhere to save it.
9. **No payouts service at all** — no table, no resolver. Withdrawals are
   entirely stand-in.
10. **No Complaint model** — no subject, priority or open/solved anywhere.
11. **Support threads are owned, not shared.** `listConversations` scopes an
    admin to `{ adminId: userId }`, and `startConversation` assigns `adminId`
    with `findFirst({ role: 'ADMIN' })` — whichever admin row comes back
    first. With more than one admin account, threads land on one person and
    are invisible to everyone else. Support needs a shared queue before the
    Chats screen can use the live API.

## Team access

`src/lib/access.ts` — same shape as `seller-tredella/src/lib/roles.ts`, so
moving between the repos costs nothing. A **role is a preset over a
per-section permission map**, not something code branches on. Never write
`role === 'ADMIN'`; read the map, so a Custom member behaves like any other.

- `Access` is `NONE | VIEW | MANAGE`, held per section for all 13 sections.
- Presets: `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `VIEWER`, plus `CUSTOM`.
- **The super admin alone releases money and grants access.** `ADMIN` gets
  `VIEW` on withdrawals and plans, never `MANAGE` — an admin with `MANAGE`
  could pay the marketplace's money into a bank account.
- The last super admin cannot be demoted or removed, by anyone including
  themselves. A console with nobody who can grant access is locked out of
  itself.
- `SECTIONS[].href` matches `NavItem.href` in `components/console/navigation.ts`
  on purpose — that is how the sidebar filters itself. A new nav item needs a
  section here or it is visible to everyone.

Granted under **Settings → Team Access**, which only appears for someone who
can manage the team.

### This is not security yet

`AccessProvider` defaults to `SUPER_ADMIN` when the signed-in email is not in
`src/data/team.ts`, because the API has no staff-role column — every ADMIN
token really is a super admin today, and failing closed would lock someone out
over data that does not exist.

`RouteGuard` stops a restricted member typing a URL they cannot see, but that
is still only the console's own guard: **nothing here stops a request made
outside the browser.** The resolvers have to check a staff role too.

12. **No staff roles on the backend** — `User.role` is BUYER | SELLER | ADMIN.
    Team access needs a role (or a permission map) per admin account, and
    every admin-only resolver needs to enforce it.

## Job templates

Grades answer "how senior is this person". `JOB_TEMPLATES` in
`src/lib/access.ts` answer "what is this person here to do", which is what
actually gets asked — **Store viewer**, **Product reviewer**, **Seller
verifier**, **Support agent**, **Finance**. One click in Team Access sets the
whole map; the member becomes Custom, because that is what they are. No
template can grant team access or release money.

## Seller verification

`src/lib/verification.ts` is the review step the seller app has been waiting
on since registration was built — `verificationStatus` has sat on PENDING
because nothing ever moved it.

- A **VAT certificate is only required when the seller gave a TRN**. UAE
  registration is mandatory above AED 375,000 turnover, so demanding one from
  everybody would block half the queue on a document that does not exist.
- A seller **cannot be verified on an expired trade licence**, and missing
  documents are reported ahead of the expiry — they are different jobs.
- **Removing a document is how the seller gets their upload box back**; their
  dashboard only offers upload where a slot is empty. Doing it to a verified
  store drops it back to In review, because leaving it Verified would mean a
  store trading on a document an admin has just called wrong.
- Neither Verified nor Rejected is terminal: a licence lapses, an appeal
  succeeds. That is different from a payout, where the money has gone.

13. **No admin verification mutation** — `removeSellerDocument` exists but is
    scoped to the signed-in seller, so an admin cannot call it, and nothing
    writes `verificationStatus` or `verificationNote` from this side.
