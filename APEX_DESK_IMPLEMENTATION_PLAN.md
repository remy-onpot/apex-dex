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

**Progress:** Community and comment functionality has been removed from the application code and schema. The database migration was applied after confirming the database matched the prior schema and the user confirmed the comment/reaction tables had no records.

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

**Progress:** Student Academy and Crucible queries now enforce published and review visibility rules. Review status is consistently named `GRADED`, and the enum rename migration has been applied.

### Work

- Filter the student Academy query to published lessons only (`published: true`). Apply the same rule to any lesson API or other student-facing lesson query.
- Restrict student Crucible results to graded/reviewed submissions. Pending submissions should be visible only to their owner and the mentor in HQ.
- Use `ReviewStatus.PENDING` and `ReviewStatus.GRADED` consistently in the schema, migration, API, and UI.
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

**Progress:** Mentor-only edit/delete APIs and HQ content managers are implemented for setups, lessons, and announcements. The pending grading queue returns the graded submission and includes mutation feedback. Deletes also remove attached Supabase Storage images.

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

## Phase 4.5: Subscription entitlement groundwork

Define and display subscription access states before payment processing is connected. Keep the hard desk gate off so new students are not locked out before a successful payment can grant access.

**Progress:** `lib/subscription.ts` now centralizes active-access and status checks. Checkout and the membership display read current database state. Desk enforcement remains deferred to Phase 6.

### Work

- Centralize the strict active rule: premium flag is true and the subscription end timestamp is later than the current time.
- Classify active, expired, never-subscribed, and inconsistent/inactive subscription records consistently.
- Make checkout read the database record by the authenticated user's ID; handle signed-out users separately and route mentors to HQ.
- Show existing active access and its end date, and explain that an additional one-week pass is a deliberate one-time checkout.
- Leave the desk layout ungated until payment initiation and verified webhook renewals are ready.

### Acceptance criteria

- The shared helper treats an end time equal to or earlier than now as inactive.
- Both `isPremium` and a future end date are required for active access.
- Checkout displays distinct active, expired, never-subscribed, and inconsistent states from fresh database data.
- Mentors are not sent through student checkout.
- Students remain able to use the desk until Phase 6 intentionally enables enforcement.

## Phase 5: Autonomous payment infrastructure

Build and verify a Ghana Mobile Money payment lifecycle while keeping the final access gates open. The offer is GH₵100 for one seven-day pass. Each pass is a one-time payment; automatic recurring charges are not part of this implementation.

**Progress:** Paystack Mobile Money checkout, server-side transaction verification, signed webhooks, a deduplicated payment ledger, seven-day subscription extension, payment-return status polling, and an HQ ledger view are implemented. Checkout is presented as an Apex Desk membership page. The desk gate remains open. Live processing requires `PAYSTACK_SECRET_KEY`; no sandbox payment has been exercised in this workspace.

### Work

- Use Paystack for Ghana Mobile Money. The student starts checkout from the membership page, Paystack hosts payment, and the return page polls the server for a verified result. The return redirect never grants access.
- Set the weekly pass to GH₵100 (10,000 pesewas), granting seven days after confirmed payment. Each renewal is a deliberate one-time checkout, not an automatic charge.
- Implement checkout initiation and a provider webhook at `/api/webhooks/payment` using the provider’s current signature verification and payment verification guidance.
- Verify amount, currency, reference, and successful provider status server-side. Never grant access from a client-side success redirect alone.
- Make webhook processing idempotent. Persist a unique provider reference and use a database transaction or equivalent atomic operation so duplicate deliveries cannot create duplicate payment records or extend access multiple times.
- On a verified successful payment, record an auditable `Payment` entry and extend `subscriptionEndDate` by seven days. If the user already has unexpired access, extend from the existing end date; otherwise extend from the current time.
- Keep failed and pending transactions from granting access; expose recorded payment attempts to the mentor in the HQ ledger. Refund/reversal reconciliation and operator remediation remain follow-up work before production release.
- Add a way for the mentor/operator to inspect payment records and resolve exceptions.

### Acceptance criteria

- A verified GH₵100 payment creates one payment record and grants exactly one seven-day period.
- Replaying the same webhook does not duplicate the payment or extend access again.
- An invalid signature, mismatched amount/currency, or unverified payment never grants access.
- Consecutive valid payments extend access correctly, including when access is still active.
- Payment records support reconciliation and dispute investigation.

## Phase 6: Final access lockdown

Close the gates only after the earlier phases are complete and payment behavior is verified.

**Progress:** HQ page access now checks the user's current database role rather than trusting the session role. Desk pages and student-facing chart submission/read-receipt APIs log advisory warnings for inactive subscriptions; the redirect and API 403 triggers remain disconnected for sandbox testing. The actual desk shutdown is not yet enabled.

### Work

- Keep authentication middleware responsible for routing unauthenticated users away from protected `/desk` and `/hq` routes. Avoid relying on middleware alone for database-backed subscription checks.
- In the server-side desk layout, load the user's current subscription state and allow student access only when `isPremium` is true and `subscriptionEndDate` is in the future. Redirect expired or unpaid students to checkout; route mentors to HQ or exempt them from the student subscription check.
- Recheck subscription access on sensitive server data paths where App Router client navigation could reuse a previously rendered layout after expiry.
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
5. Complete Phase 4.5 subscription state and checkout messaging while leaving the desk gate open.
6. Complete Phase 5 in the gateway sandbox while access gates remain open.
7. Complete Phase 6 only after payment and expiry behavior meet their acceptance criteria.

## Resolved decision

Chart review status uses `PENDING` and `GRADED`. The PostgreSQL enum rename migration has been generated and applied.

Payment gateway is Paystack Mobile Money. Membership is GH₵100 for a one-time seven-day pass. Do not claim scarcity, guaranteed outcomes, or automatic renewal; checkout urgency must be grounded in the live trade's timing and the real access terms.
