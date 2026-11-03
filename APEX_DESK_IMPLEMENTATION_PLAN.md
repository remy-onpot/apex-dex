# Apex Desk Implementation Plan

This plan takes Apex Desk from its current prototype state to the gated, mentor-led trading platform described in the product vision. Work proceeds phase by phase so the database and access rules are reliable before the payment gate is enabled.

## Working principles

- Keep the product focused on one-to-many mentor broadcasts, student execution, and mentor feedback.
- Enforce visibility and permissions on the server, including in API routes.
- Keep payment processing auditable, safe to retry, and independent of browser redirects.
- Do not close the student access gates until payment and subscription behavior have been exercised end to end.
- Complete and review each phase's acceptance criteria before starting the next phase.

## Phase 1: Database and repository baseline

Establish a reproducible PostgreSQL baseline before feature work continues.

### Work

- Inspect the existing Prisma schema, migrations, and database state. The checked-in initial migration is a legacy MySQL migration, while the datasource is PostgreSQL.
- Preserve any migration or data needed by an existing environment before replacing migration history. Create the new baseline against a fresh, disposable Supabase PostgreSQL database; do not reset a database containing user data.
- Replace the legacy migration history with a PostgreSQL baseline that matches the current schema. Generate and review it using Prisma, then confirm a clean database can be created from the committed migration history.
- Replace the Taxonomy starter README with Apex Desk setup, architecture, and operating instructions.
- Restore `.env.example` with variable names and safe placeholders only. Document which values are needed for local development and which are needed for production.
- Review the current uncommitted work and preserve it in a deliberate commit or stash before implementation changes. Do not discard changes as part of cleanup.

### Acceptance criteria

- A fresh PostgreSQL database can be initialized from the committed Prisma migrations.
- The generated Prisma client matches the schema and application queries.
- The README describes how to install, configure, migrate, and run Apex Desk.
- A developer can identify all required environment variables without exposing secrets.
- Existing work is preserved and the working tree has a clear, intentional baseline.

## Phase 2: Product philosophy alignment

Remove starter features that conflict with the quiet, one-to-many broadcast model.

### Work

- Remove the student community routes and their links from desk navigation.
- Remove student-facing post comments and related components/API behavior if they exist only to support peer discussion.
- Remove the `Comment` model and dependent relations from Prisma only after confirming no remaining product feature uses comments. Create a migration for the schema change.
- Review reactions, community navigation, and other peer interaction features; remove them if they create public student-to-student chatter outside the intended review workflow.
- Keep mentor-to-student broadcasts, student chart submissions, and mentor feedback intact.

### Acceptance criteria

- Students cannot reach community or public discussion routes through navigation or direct URLs.
- No student-to-student comment functionality remains in the desk experience or API.
- Database migrations apply cleanly after removing unused models and relations.
- Students can still submit charts and receive mentor feedback.

## Phase 3: Server-side query and privacy enforcement

Shape server data to match the visibility rules before polishing the UI.

### Work

- Filter the student Academy query to published lessons only (`published: true`). Apply the same rule to any lesson API or other student-facing lesson query.
- Restrict student Crucible results to graded/reviewed submissions. Pending submissions should be visible only to their owner and the mentor in HQ.
- The current schema uses `ReviewStatus.PENDING` and `ReviewStatus.REVIEWED`, while the product wording says `GRADED`. Decide on one canonical status name and update the schema, migration, API, and UI consistently. This plan uses “graded” as the product concept; it does not assume the current enum already contains `GRADED`.
- Ensure a student can view their own pending submission and its status, while other students cannot see it.
- Scope mentor review queries to pending submissions and keep mentor-only queries role-checked on the server.
- Review all student-facing feeds and APIs for unpublished or unauthorized records.

### Acceptance criteria

- Draft lessons never appear in student pages or APIs.
- Pending chart submissions are visible only to the submitting student and authorized mentors.
- Graded chart reviews appear in the student Crucible according to the intended public-to-members policy.
- Direct API requests cannot bypass the same visibility rules.

## Phase 4: Mentor HQ completion

Give the mentor a complete workflow to publish, maintain, and review content.

### Work

- Add edit and delete flows for trade setups, lessons, and announcements.
- Implement and validate `PATCH` and `DELETE` handlers for each content type, or use a shared handler where appropriate. Confirm the caller is a mentor and the target record is of the expected type.
- Validate request bodies and uploaded image ownership on updates as well as creates.
- Build the HQ grading queue for pending chart submissions.
- Let the mentor inspect a submission, write feedback, and mark it graded/reviewed. Ensure the status transition is persisted and the graded item becomes visible in Crucible.
- Add clear empty, loading, and error states to mentor workflows.

### Acceptance criteria

- A mentor can create, edit, and delete each supported content type.
- Students cannot mutate mentor content through direct API calls.
- A mentor can grade a pending chart and the submitter can see the feedback.
- Graded charts become visible under the Phase 3 rules; pending charts remain private.

## Phase 5: Autonomous payment infrastructure

Build and verify the payment lifecycle while keeping the final access gates open.

### Work

- Select one gateway (Hubtel or Paystack) based on Ghana MoMo support, settlement requirements, fees, and available account credentials. Document the choice and expected payment flow.
- Implement checkout initiation and a provider webhook at `/api/webhooks/payment` using the provider’s current signature verification and payment verification guidance.
- Verify amount, currency, reference, and successful provider status server-side. Never grant access from a client-side success redirect alone.
- Make webhook processing idempotent. Persist a unique provider reference and use a database transaction or equivalent atomic operation so duplicate deliveries cannot create duplicate payment records or extend access multiple times.
- On a verified successful payment, record an auditable `Payment` entry and extend `subscriptionEndDate` by seven days. If the user already has unexpired access, extend from the existing end date; otherwise extend from the current time.
- Define behavior for failed, pending, refunded, reversed, and out-of-order events. Ensure retries are safe and failures are observable to the operator.
- Add a way for the mentor/operator to inspect payment records and resolve exceptions.

### Acceptance criteria

- A verified payment creates one payment record and grants exactly one seven-day period.
- Replaying the same webhook does not duplicate the payment or extend access again.
- An invalid signature, mismatched amount/currency, or unverified payment never grants access.
- Consecutive valid payments extend access correctly, including when access is still active.
- Payment records support reconciliation and dispute investigation.

## Phase 6: Final access lockdown

Close the gates only after the earlier phases are complete and payment behavior is verified.

### Work

- Keep authentication middleware responsible for routing unauthenticated users away from protected `/desk` and `/hq` routes. Avoid relying on middleware alone for database-backed subscription checks.
- In the server-side desk layout, load the user’s current subscription state and allow access only when `isPremium` is true and `subscriptionEndDate` is in the future. Redirect expired or unpaid users to checkout.
- Ensure the checkout and payment-return routes remain reachable to signed-in users without active access.
- Enforce mentor role checks in the HQ layout and every HQ mutation/API handler. Do not trust a client-supplied role.
- Consider token role staleness: use an authoritative server-side role check for sensitive mentor actions if the session token can outlive a role change.
- Exercise the flow with provider sandbox events or signed test fixtures, including duplicate, invalid, failed, and expired cases.

### Acceptance criteria

- Unauthenticated users cannot access desk or HQ pages.
- Authenticated unpaid and expired users cannot access paid desk content and can reach checkout.
- Active subscribers can access the desk until their subscription expires.
- Non-mentor users cannot view HQ or invoke mentor-only mutations.
- Provider callbacks cannot bypass server-side payment verification or access rules.

## Suggested execution order

1. Complete Phase 1 and verify a clean PostgreSQL setup.
2. Complete Phase 2 and its schema migration.
3. Complete Phase 3 visibility rules and agree on the review status name.
4. Complete Phase 4 mentor operations.
5. Complete Phase 5 in the gateway sandbox while access gates remain open.
6. Complete Phase 6 only after payment and expiry behavior meet their acceptance criteria.

## Current known decision

The current Prisma schema defines review statuses as `PENDING` and `REVIEWED`; the product plan uses “graded.” Resolve this naming mismatch in Phase 3 before implementing or migrating the grading workflow.
