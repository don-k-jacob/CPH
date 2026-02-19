# Database Guide

This project now uses a versioned Firestore schema namespace for safer scaling and future migrations.

## Current schema

- Version: `v1`
- Namespace prefix: `cph_v1_`
- Metadata doc: `cph_schema_meta/active`
- Legacy read fallback: enabled by default (`FIRESTORE_LEGACY_READ_FALLBACK !== "0"`)

## Why this is more scalable

- Collection names are versioned, so schema evolution does not require in-place destructive changes.
- Participant and list endpoints now support page-based reads (`cursor`, `limit`) instead of unbounded fetches.
- Hot paths reduce N+1 lookups by batching user/product/topic fetches.
- Migration scripts provide repeatable, auditable data movement from legacy collections.

## Setup flow (new environment)

1. Seed versioned schema:
   - `npm run db:seed`
2. Deploy Firestore indexes and rules:
   - `firebase deploy --only firestore:rules,firestore:indexes`
3. Verify schema status:
   - `npm run db:schema:status`

## Migration flow (existing environment)

1. Check current state:
   - `npm run db:schema:status`
2. Copy legacy collections into `cph_v1_*`:
   - `npm run db:migrate:v1`
3. Verify counts and metadata:
   - `npm run db:schema:status`
4. Redeploy indexes/rules:
   - `firebase deploy --only firestore:rules,firestore:indexes`

## Optional reset (versioned schema only)

Use only for non-production resets:

- `npm run db:reset:versioned`

This deletes all documents inside `cph_v1_*` collections.

## Optional legacy cleanup (after successful migration only)

- `npm run db:reset:legacy`

Run this only after validating `cph_v1_*` counts and application reads in production/staging.

## Operational notes

- Keep `FIRESTORE_LEGACY_READ_FALLBACK` enabled during migration.
- After migration is complete and verified, you can disable fallback by setting:
  - `FIRESTORE_LEGACY_READ_FALLBACK=0`
- Any new schema version should use a new namespace (`cph_v2_*`) and a dedicated migration script.
