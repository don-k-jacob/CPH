# DB Scalability Checklist

Use this before promoting DB changes to production.

## Schema/versioning

- [ ] New schema uses a namespace (example: `cph_v2_*`)
- [ ] Migration script exists and is idempotent
- [ ] `cph_schema_meta/active` updated with new version + migration timestamp
- [ ] Rollback plan documented

## Query scalability

- [ ] No unbounded list reads on hot paths
- [ ] APIs support `limit` + cursor pagination where lists can grow
- [ ] N+1 reads replaced with batch fetches (`in` queries/chunking)
- [ ] Composite indexes exist for all compound query filters/orderings

## Data safety

- [ ] Backfill/migration tested in staging with realistic volume
- [ ] Read fallback strategy defined and time-boxed
- [ ] Legacy and versioned record counts verified before cutover
- [ ] Alerts/logging capture migration failures

## Security and ops

- [ ] `firestore.rules` updated for new namespace
- [ ] `firestore.indexes.json` includes new namespace indexes
- [ ] Runbook includes commands:
  - `npm run db:schema:status`
  - `npm run db:migrate:v1`
  - `npm run db:reset:versioned` (non-prod only)
  - `npm run db:reset:legacy` (after cutover verification)
