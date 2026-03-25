# Deployment Instructions

How to deploy Maths Facts to Vercel (hosting) + Turso (database).

## Prerequisites

- Node.js 18+ installed
- A GitHub account
- A Vercel account (free) — vercel.com
- A Turso account (free) — turso.tech

---

## Part 1 — Turso (database)

**1. Install the Turso CLI**
```bash
brew install tursodatabase/tap/turso
```

**2. Log in**
```bash
turso auth login
```

**3. Create a database**
```bash
turso db create maths-facts
```

**4. Get your credentials**
```bash
turso db show maths-facts
# Copy the URL — looks like: libsql://maths-facts-<your-org>.turso.io

turso db tokens create maths-facts
# Copy the auth token
```

**5. Update your local `.env.local`** — replace the local SQLite values:
```
DATABASE_URL=libsql://maths-facts-<your-org>.turso.io
DATABASE_AUTH_TOKEN=<token from above>
```

**6. Push your schema to Turso**
```bash
npx prisma db push
```
You should see `Your database is now in sync with your Prisma schema.`

---

## Part 2 — GitHub

**7. Create a new repo on github.com**, then push:
```bash
git remote add origin https://github.com/<your-username>/maths-facts.git
git push -u origin master
```

---

## Part 3 — Vercel

**8. Import the project**
- Go to vercel.com → **Add New Project**
- Select your `maths-facts` repo
- Framework will be auto-detected as **Next.js** — leave all build settings as defaults

**9. Add environment variables**

Before clicking Deploy, add these under **Environment Variables**:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `libsql://maths-facts-<your-org>.turso.io` |
| `DATABASE_AUTH_TOKEN` | *(your Turso token)* |
| `SESSION_SECRET` | *(run the command below to generate one)* |
| `ANTHROPIC_API_KEY` | *(from your `.env.local`)* |
| `UNSPLASH_ACCESS_KEY` | *(from your `.env.local`)* |
| `INVITE_CODE` | `show-my-teacher` *(or any phrase you choose)* |

Generate a strong `SESSION_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**10. Deploy**

Click **Deploy**. Vercel will build and deploy — takes about 60 seconds. You'll get a URL like `https://maths-facts.vercel.app`.

---

## Part 4 — Share with your teacher

Send your teacher:
1. The Vercel URL
2. The `INVITE_CODE` value (needed to create an account on the signup page)

---

## Subsequent deploys

Every `git push` to `master` automatically triggers a new deployment on Vercel — no manual steps needed.

---

## Local development

To keep local dev using a local SQLite file (instead of Turso), use two separate env files:

- `.env.local` — points to Turso (used when you want to test against the live DB)
- `.env.development.local` — points to local SQLite (used for everyday development)

`.env.development.local`:
```
DATABASE_URL=file:./prisma/dev.db
```

Next.js loads `.env.development.local` first in development mode, so it takes precedence over `.env.local` when running `npm run dev`.

To reset your local database after schema changes:
```bash
npx prisma db push
```
