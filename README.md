# Catholic Product Hunt

A production-ready Next.js app inspired by Product Hunt, built with a Catholic design language and a Firebase backend.

## Features

- Authentication: signup, login, logout (cookie session)
- Profile management
- Product launch flow with image/video upload
- Ranked feed (upvotes + comments)
- Product, topic, maker, collection, search, and upcoming pages
- Events system: Lent Hack overview, join as team/individual, teammate board
- Notifications, follows, reports
- Admin dashboard with platform/event metrics (admin role only)
- Graceful backend error states across pages and APIs
- Health endpoint for runtime checks

## Stack

- Next.js App Router + TypeScript
- Firebase Firestore
- Firebase Storage
- Tailwind CSS

## Setup

1. Install:

```bash
npm install
```

2. Configure env:

```bash
cp .env.example .env
```

Required vars:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_STORAGE_BUCKET`

3. Enable APIs and database:

- Enable **Cloud Firestore API** for your project
- Create Firestore database (Native mode)
- Ensure your service account has Firestore + Storage permissions

4. Seed demo data:

```bash
npm run db:seed
```

5. Run:

```bash
npm run dev
```

6. (Optional) Deploy Firebase rules/indexes:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## Firestore/Storage config files

- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`
- `firebase.json`

## Health check

- `GET /api/health`

## Demo credentials

- `maker@cph.dev` / `password123` (admin)
- `hunter@cph.dev` / `password123`

## Main APIs

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `PATCH /api/profile`
- `GET /api/feed`
- `POST /api/products`
- `POST /api/upload`
- `POST /api/launches/:id/upvote`
- `POST /api/launches/:id/comments`
- `GET /api/search?q=...`
- `POST /api/follow`
- `POST /api/reports`
- `GET /api/notifications`
- `POST /api/events/register`
- `GET|POST /api/events/teammates`

## Troubleshooting

**"Cannot find module './xxxx.js'"**, `/_app` undefined, or random 500s in dev

This is usually a corrupted `.next` build cache, often triggered by unsupported Node versions (for example Node `24.x`) with Next.js `15`.

Use Node `22.x` LTS, then reset once:

```bash
nvm install 22
nvm use 22
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

**"SegmentViewNode" / "React Client Manifest" or "Cannot find module vendor-chunks/@opentelemetry" in dev**

These often come from a stale Next.js cache or Turbopack/devtools. Fix:

1. Stop the dev server (Ctrl+C).
2. Clear the build cache: `rm -rf .next`
3. Start again: `npm run dev`

If the error persists, close other tabs pointing at the app and restart the dev server once. Production builds are unaffected (`npm run build`).
# CPH
