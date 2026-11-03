# Apex Desk

Apex Desk is a mentor-led trading education platform. The mentor publishes structured trade setups and lessons; students review setups, submit chart work, and receive mentor feedback.

## Stack

- Next.js App Router, React, and TypeScript
- PostgreSQL with Prisma
- NextAuth.js with Google and GitHub OAuth
- Supabase Storage for feed images and chart submissions
- Tailwind CSS and Radix UI

## Requirements

- Node.js compatible with the project dependencies
- pnpm
- A PostgreSQL database (Supabase is the intended hosted option)
- OAuth credentials for enabled sign-in providers
- Supabase Storage credentials to use image uploads
- A Paystack test secret for Mobile Money checkout and the Paystack webhook URL configured to `/api/webhooks/payment`

## Local setup

1. Install dependencies:

   ```sh
   pnpm install
   ```

2. Copy `.env.example` to `.env` and fill in the required values. Never commit `.env` or real credentials.

3. Set `DATABASE_URL` to the application connection string and `DIRECT_URL` to the direct PostgreSQL connection string used by Prisma migrations. For Supabase, use the pooler for the application URL if required by the deployment runtime, and the direct connection for `DIRECT_URL`.

4. The initial PostgreSQL migration creates the complete schema and is intended for an empty database. Apply it only to a new, disposable Supabase project or another empty PostgreSQL database:

   ```sh
   pnpm exec prisma migrate deploy
   ```

   The database currently configured in `.env` already contains tables. Do not apply the initial migration to it. Existing databases need their schema and migration history reviewed and baselined separately before deploying migrations. For a new local development database, `pnpm exec prisma migrate dev` can create and apply development migrations.

5. Start the development server:

   ```sh
   pnpm dev
   ```

The app is available at `http://localhost:3000`.

## Database workflow

The Prisma schema is in `prisma/schema.prisma`; committed SQL migrations live under `prisma/migrations`. After changing the schema, create a migration against a development database with:

```sh
pnpm exec prisma migrate dev --name describe_change
```

Review the generated SQL before committing it. Do not run reset commands against a database containing data you need to keep. Generate the Prisma client with:

```sh
pnpm exec prisma generate
```

## Environment variables

See `.env.example` for the current variable list. Database and OAuth settings are required by the app configuration. Supabase Storage variables are needed for uploads. Keep service-role credentials server-side only.

## Membership payments

The weekly pass costs GH₵100 for seven days. Each payment is a one-time purchase; it does not automatically renew. Paystack hosts the Mobile Money checkout. The application verifies the transaction with Paystack before granting access, and the signed webhook endpoint is `/api/webhooks/payment`.

Set `PAYSTACK_SECRET_KEY` to a test key for sandbox work and configure the Paystack webhook to the deployed endpoint. Do not enable live payments until valid, failed, duplicate, and delayed payment events have been exercised and the merchant account's settlement configuration has been confirmed. The desk subscription gate remains open until Phase 6.

The payment ledger records amounts as pesewas (so GH₵100 is stored as 10,000) and is available to mentors in HQ. Refund/reversal reconciliation and operator remediation still need to be completed before production payment launch.
