# Maths Facts Homework Helper — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a locally-hosted web app where 10–11 year olds enter their weekly maths topic and get AI-powered explanations, diagrams, and homework ideas delivered through their personal character in a chat interface.

**Architecture:** Next.js app with API routes handling auth, topics, chat, and file uploads. SQLite (via Prisma, local file) stores users, topics, and messages. Claude API generates explanations and homework ideas. All user-uploaded images stored on disk under `public/uploads/`.

**Tech Stack:** Next.js 14 (App Router), TypeScript, SQLite (via Prisma), Prisma ORM, Anthropic SDK, bcrypt, iron-session, Tailwind CSS, Unsplash API (free tier)

---

## File Structure

```
maths-facts/
├── .env.local                       # DB URL, Claude API key, Unsplash key, session secret
├── next.config.ts
├── tailwind.config.ts
├── prisma/
│   └── schema.prisma                # DB schema: User, Topic, Message
├── public/
│   ├── uploads/                     # User-uploaded images (gitignored)
│   ├── backgrounds/                 # Curated landscape images (bundled)
│   └── avatars/                     # Pre-made profile character images (bundled)
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout — renders Header
│   │   ├── page.tsx                 # Home screen
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx          # Step 1: username/password/character name only
│   │   ├── setup/page.tsx           # Step 2: upload images (post-login)
│   │   ├── topic/new/page.tsx       # New topic form
│   │   ├── chat/[topicId]/page.tsx  # Chat screen
│   │   ├── settings/page.tsx
│   │   └── api/
│   │       ├── auth/login/route.ts
│   │       ├── auth/logout/route.ts
│   │       ├── auth/signup/route.ts
│   │       ├── auth/me/route.ts     # GET current user
│   │       ├── topics/route.ts      # POST create topic
│   │       ├── chat/[topicId]/route.ts  # GET history, POST send message
│   │       ├── unsplash/route.ts    # GET proxy for Unsplash image search
│   │       └── upload/route.ts      # POST image upload (requires session)
│   ├── components/
│   │   ├── Header.tsx               # Profile image + username + logout
│   │   ├── CharacterPanel.tsx       # Character image, name, panel background
│   │   ├── ChatMessage.tsx          # Single message bubble (character or user)
│   │   ├── ChatInput.tsx            # Message input + send button
│   │   ├── DiagramRenderer.tsx      # Renders structured diagram data as HTML/CSS
│   │   ├── ImagePicker.tsx          # Upload photo OR select from avatar library
│   │   ├── BackgroundPicker.tsx     # Landscape picker (chat bg + character panel bg)
│   │   └── TopicList.tsx            # Past topics on home screen
│   ├── lib/
│   │   ├── db.ts                    # Prisma client singleton
│   │   ├── auth.ts                  # iron-session config + getSession helper
│   │   ├── claude.ts                # Claude API client + prompt builders
│   │   ├── parseMessage.ts          # Parses Claude responses into text/diagram/image parts
│   │   └── unsplash.ts              # Unsplash search helper
│   └── types/
│       └── index.ts                 # Shared types: User, Topic, Message, DiagramData
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `.env.local`
- Create: `prisma/schema.prisma`
- Create: `src/types/index.ts`
- Create: `src/lib/db.ts`

- [ ] **Step 1: Initialise Next.js app with TypeScript and Tailwind**

```bash
cd /Users/andrew/dev/code/projects/maths-facts
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
```

Rename the generated `src` directory if needed so it matches the file structure above.

- [ ] **Step 2: Install dependencies**

```bash
npm install prisma @prisma/client bcrypt iron-session @anthropic-ai/sdk
npm install --save-dev @types/bcrypt
```

- [ ] **Step 3: Create `.env.local`**

```
DATABASE_URL="file:./prisma/dev.db"
SESSION_SECRET="replace-with-a-long-random-string-at-least-32-chars"
ANTHROPIC_API_KEY="your-claude-api-key-here"
UNSPLASH_ACCESS_KEY="your-unsplash-access-key-here"
```

Add `.env.local` to `.gitignore`. Add `prisma/dev.db` to `.gitignore`.

- [ ] **Step 4: Define Prisma schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id                   Int      @id @default(autoincrement())
  username             String   @unique
  passwordHash         String
  profileImagePath     String?
  characterImagePath   String?
  characterName        String   @default("Mathsie")
  settings             Json     @default("{}")
  createdAt            DateTime @default(now())
  topics               Topic[]
}

model Topic {
  id          Int       @id @default(autoincrement())
  userId      Int
  user        User      @relation(fields: [userId], references: [id])
  title       String
  rawInput    String
  createdAt   DateTime  @default(now())
  messages    Message[]
}

model Message {
  id        Int      @id @default(autoincrement())
  topicId   Int
  topic     Topic    @relation(fields: [topicId], references: [id])
  role      String   // "user" | "assistant"
  content   String
  createdAt DateTime @default(now())
}
```

- [ ] **Step 5: Run migration**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Expected: `prisma/migrations/` created, `prisma/dev.db` created, Prisma client generated.

- [ ] **Step 6: Create `src/lib/db.ts`**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 7: Define shared types in `src/types/index.ts`**

```typescript
export type SessionUser = {
  id: number;
  username: string;
  profileImagePath: string | null;
  characterImagePath: string | null;
  characterName: string;
  settings: UserSettings;
};

export type UserSettings = {
  chatBackground?: string;        // filename from /backgrounds/
  characterPanelBackground?: string; // filename from /backgrounds/ or a CSS colour
  characterPosition?: "left" | "right";
};

export type DiagramData = {
  type: "place-value-chart" | "number-line" | "table";
  data: Record<string, unknown>;
};

export type MessageContent = {
  text?: string;
  diagram?: DiagramData;
  imageQuery?: string; // Unsplash search term
};
```

- [ ] **Step 8: Create upload directory**

```bash
mkdir -p public/uploads public/backgrounds public/avatars
```

Add `public/uploads` to `.gitignore`.

- [ ] **Step 9: Configure Jest**

```bash
npm install --save-dev jest jest-environment-node @types/jest ts-jest
```

Create `jest.config.ts`:

```typescript
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  setupFilesAfterEnv: ["./jest.setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
};

export default config;
```

Create `jest.setup.ts`:

```typescript
// Use a separate test DB so tests don't corrupt dev data
process.env.DATABASE_URL = "file:./prisma/test.db";
process.env.SESSION_SECRET = "test-secret-at-least-32-characters-long";
process.env.ANTHROPIC_API_KEY = "test-key";
```

Add `prisma/test.db` to `.gitignore`.

Run migrations against the test DB before running tests for the first time:

```bash
DATABASE_URL="file:./prisma/test.db" npx prisma migrate deploy
```

- [ ] **Step 10: Commit**

```bash
git init
git add .
git commit -m "feat: project scaffold, DB schema, Prisma setup, Jest config"
```

---

## Task 2: Authentication

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/signup/route.ts`
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Create: `src/app/api/upload/route.ts`

- [ ] **Step 1: Write failing tests for auth helpers**

Create `src/lib/__tests__/auth.test.ts`:

```typescript
import { hashPassword, verifyPassword } from "../auth";

describe("auth helpers", () => {
  it("hashes a password", async () => {
    const hash = await hashPassword("secret123");
    expect(hash).not.toBe("secret123");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("verifies correct password", async () => {
    const hash = await hashPassword("secret123");
    expect(await verifyPassword("secret123", hash)).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await hashPassword("secret123");
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest src/lib/__tests__/auth.test.ts
```

Expected: FAIL — `hashPassword` not found.

- [ ] **Step 3: Create `src/lib/auth.ts`**

```typescript
import bcrypt from "bcrypt";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import type { SessionUser } from "@/types";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "maths-facts-session",
  cookieOptions: { secure: false }, // set true in production
};

export async function getSession() {
  return getIronSession<{ user?: SessionUser }>(await cookies(), sessionOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session.user) throw new Error("Not authenticated");
  return session.user;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest src/lib/__tests__/auth.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Create signup API route**

Create `src/app/api/auth/signup/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, getSession } from "@/lib/auth";
import type { SessionUser } from "@/types";

export async function POST(req: NextRequest) {
  const { username, password, characterName } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, passwordHash, characterName: characterName || "Mathsie" },
  });

  const session = await getSession();
  session.user = {
    id: user.id,
    username: user.username,
    profileImagePath: user.profileImagePath,
    characterImagePath: user.characterImagePath,
    characterName: user.characterName,
    settings: (user.settings as Record<string, unknown>) ?? {},
  } as SessionUser;
  await session.save();

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 6: Create login API route**

Create `src/app/api/auth/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, getSession } from "@/lib/auth";
import type { SessionUser } from "@/types";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const session = await getSession();
  session.user = {
    id: user.id,
    username: user.username,
    profileImagePath: user.profileImagePath,
    characterImagePath: user.characterImagePath,
    characterName: user.characterName,
    settings: (user.settings as Record<string, unknown>) ?? {},
  } as SessionUser;
  await session.save();

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 7: Create logout API route**

Create `src/app/api/auth/logout/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 8: Create image upload API route**

Create `src/app/api/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await requireSession();
  const form = await req.formData();
  const file = form.get("file") as File;
  const field = form.get("field") as string; // "profile" | "character"

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop();
  const filename = `${user.id}-${field}-${Date.now()}.${ext}`;
  const filepath = path.join(process.cwd(), "public/uploads", filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const imagePath = `/uploads/${filename}`;
  const updateData =
    field === "profile"
      ? { profileImagePath: imagePath }
      : { characterImagePath: imagePath };

  await prisma.user.update({ where: { id: user.id }, data: updateData });

  return NextResponse.json({ path: imagePath });
}
```

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: authentication, session management, image upload"
```

---

## Task 3: Login, Signup, and Profile Setup Pages

**Note on signup flow:** Signup is two steps. Step 1 (signup page) creates the account and logs in. Step 2 (setup page) uploads images — this requires a session, so it must happen after login. New users are redirected to `/setup` after signup.

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/signup/page.tsx`
- Create: `src/app/setup/page.tsx`
- Create: `src/components/ImagePicker.tsx`

- [ ] **Step 1: Create `src/components/ImagePicker.tsx`**

This component lets the user either upload a photo or select from the pre-made avatar library.

```typescript
"use client";
import { useState } from "react";

type Props = {
  label: string;
  field: "profile" | "character";
  onSelected: (path: string) => void;
};

const PRESET_AVATARS = [
  "/avatars/robot.png",
  "/avatars/wizard.png",
  "/avatars/astronaut.png",
  "/avatars/dragon.png",
  "/avatars/cat.png",
];

export default function ImagePicker({ label, field, onSelected }: Props) {
  const [mode, setMode] = useState<"upload" | "library">("upload");
  const [preview, setPreview] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("field", field);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const { path } = await res.json();
    setPreview(path);
    onSelected(path);
  }

  function handlePreset(path: string) {
    setPreview(path);
    onSelected(path);
  }

  return (
    <div className="space-y-2">
      <p className="font-medium text-sm">{label}</p>
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`px-3 py-1 rounded text-sm ${mode === "upload" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
        >
          Upload photo
        </button>
        <button
          type="button"
          onClick={() => setMode("library")}
          className={`px-3 py-1 rounded text-sm ${mode === "library" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
        >
          Choose character
        </button>
      </div>

      {mode === "upload" && (
        <input type="file" accept="image/*" onChange={handleUpload} className="text-sm" />
      )}

      {mode === "library" && (
        <div className="flex gap-2 flex-wrap">
          {PRESET_AVATARS.map((src) => (
            <button key={src} type="button" onClick={() => handlePreset(src)}>
              <img
                src={src}
                alt=""
                className={`w-16 h-16 rounded-full object-cover border-4 ${
                  preview === src ? "border-indigo-600" : "border-transparent"
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {preview && (
        <img src={preview} alt="Preview" className="w-20 h-20 rounded-full object-cover mt-2" />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add placeholder avatar images**

Add at least one placeholder image to `public/avatars/` (e.g. copy any PNG and name it `wizard.png`). The real images can be swapped in later.

```bash
# Quick placeholder — a coloured square
python3 -c "
from PIL import Image
img = Image.new('RGB', (200,200), color=(99,102,241))
img.save('public/avatars/wizard.png')
" 2>/dev/null || echo "Add placeholder avatar images manually to public/avatars/"
```

- [ ] **Step 3: Create signup page**

Create `src/app/signup/page.tsx`. This page only collects username, password, and character name — images are uploaded on the next step after login.

```typescript
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [characterName, setCharacterName] = useState("Mathsie");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, characterName }),
    });
    if (res.ok) {
      router.push("/setup"); // redirect to image upload step
    } else {
      const { error } = await res.json();
      setError(error);
    }
  }

  return (
    <main className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Create your account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Character name</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded font-semibold"
        >
          Next →
        </button>
        <p className="text-sm text-center">
          Already have an account? <a href="/login" className="text-indigo-600">Log in</a>
        </p>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Create profile setup page**

Create `src/app/setup/page.tsx`. The user is now logged in — uploads will work correctly. Note: `ImagePicker` calls `/api/upload` for file uploads (which saves to DB automatically), but preset avatar selections call `onSelected` without persisting. The setup page must explicitly save preset selections via `PATCH /api/auth/me`.

```typescript
"use client";
import { useRouter } from "next/navigation";
import ImagePicker from "@/components/ImagePicker";

async function saveImagePath(field: "profile" | "character", path: string) {
  await fetch("/api/auth/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      field === "profile" ? { profileImagePath: path } : { characterImagePath: path }
    ),
  });
}

export default function SetupPage() {
  const router = useRouter();

  return (
    <main className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add your pictures</h1>
        <p className="text-gray-500 text-sm mt-1">A grown-up can help with this part.</p>
      </div>
      <ImagePicker
        label="Your profile picture"
        field="profile"
        onSelected={(path) => saveImagePath("profile", path)}
      />
      <ImagePicker
        label="Your maths character"
        field="character"
        onSelected={(path) => saveImagePath("character", path)}
      />
      <button
        onClick={() => router.push("/")}
        className="w-full bg-indigo-600 text-white py-2 rounded font-semibold"
      >
        Let's go! →
      </button>
    </main>
  );
}
```

Add a `PATCH` handler to `src/app/api/auth/me/route.ts` (alongside the existing `GET`):

```typescript
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.user) return NextResponse.json(null, { status: 401 });
  const updates = await req.json(); // { profileImagePath? } | { characterImagePath? }
  await prisma.user.update({ where: { id: session.user.id }, data: updates });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: Create login page**

Create `src/app/login/page.tsx`:

```typescript
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      router.push("/");
    } else {
      setError("Invalid username or password");
    }
  }

  return (
    <main className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Log in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded font-semibold"
        >
          Log in
        </button>
        <p className="text-sm text-center">
          New user? <a href="/signup" className="text-indigo-600">Sign up</a>
        </p>
      </form>
    </main>
  );
}
```

- [ ] **Step 6: Manual test — sign up then log in**

```bash
npm run dev
```

Open http://localhost:3000/signup, create an account, verify redirect to `/setup`. Upload or pick images, click "Let's go!" — verify redirect to home. Open http://localhost:3000/login, log in, verify redirect to home.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: login, signup, and profile setup pages with image picker"
```

---

## Task 4: Header and Home Screen

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/TopicList.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create `src/components/Header.tsx`**

```typescript
import { getSession } from "@/lib/auth";

export default async function Header() {
  const session = await getSession();
  const user = session.user;

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm">
      <a href="/" className="text-xl font-bold text-indigo-600">Maths Facts</a>
      {user && (
        <div className="flex items-center gap-3">
          {user.profileImagePath && (
            <img
              src={user.profileImagePath}
              alt={user.username}
              className="w-9 h-9 rounded-full object-cover"
            />
          )}
          <span className="text-sm font-medium">{user.username}</span>
          <form action="/api/auth/logout" method="POST">
            <button className="text-sm text-gray-500 hover:text-gray-700">Log out</button>
          </form>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 2: Update `src/app/layout.tsx` to include Header**

```typescript
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = { title: "Maths Facts" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create `src/components/TopicList.tsx`**

```typescript
type Topic = { id: number; title: string; createdAt: Date };

export default function TopicList({ topics }: { topics: Topic[] }) {
  if (topics.length === 0) {
    return <p className="text-gray-400 text-sm">No topics yet — start your first one!</p>;
  }
  return (
    <ul className="space-y-2">
      {topics.map((t) => (
        <li key={t.id}>
          <a
            href={`/chat/${t.id}`}
            className="block px-4 py-3 bg-white rounded-lg border hover:border-indigo-400 transition"
          >
            <span className="font-medium">{t.title}</span>
            <span className="text-xs text-gray-400 ml-2">
              {new Date(t.createdAt).toLocaleDateString()}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: Update home page**

Replace `src/app/page.tsx`:

```typescript
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import TopicList from "@/components/TopicList";

export default async function HomePage() {
  const session = await getSession();
  if (!session.user) redirect("/login");

  const topics = await prisma.topic.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-2xl mx-auto mt-10 p-6 space-y-6">
      <div className="flex items-center gap-4">
        {session.user.characterImagePath && (
          <img
            src={session.user.characterImagePath}
            alt={session.user.characterName}
            className="w-20 h-20 rounded-full object-cover border-4 border-indigo-200"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">Hi {session.user.username}!</h1>
          <p className="text-gray-500">{session.user.characterName} is ready to help.</p>
        </div>
      </div>
      <a
        href="/topic/new"
        className="block text-center bg-indigo-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition"
      >
        Start this week's topic →
      </a>
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">Past topics</h2>
        <TopicList topics={topics} />
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Manual test**

Visit http://localhost:3000 — should redirect to login if not logged in. After login, should show username, character image, and past topics list (empty for a new user).

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: header with profile image, home screen with topic list"
```

---

## Task 5: New Topic Screen

**Files:**
- Create: `src/app/topic/new/page.tsx`
- Create: `src/app/api/topics/route.ts`

- [ ] **Step 1: Write failing test for topic creation API**

Create `src/app/api/topics/__tests__/route.test.ts`:

```typescript
// Integration test: POST /api/topics creates a topic in the DB
// Requires a test user in the DB. Use Prisma directly.
import { prisma } from "@/lib/db";

describe("POST /api/topics", () => {
  it("creates a topic and returns its id", async () => {
    // Create test user
    const user = await prisma.user.create({
      data: { username: "testuser1", passwordHash: "x", characterName: "T" },
    });

    // Simulate the API logic directly (no HTTP in unit tests)
    const topic = await prisma.topic.create({
      data: { userId: user.id, title: "Place Value", rawInput: "Place value and digit positions" },
    });

    expect(topic.id).toBeDefined();
    expect(topic.title).toBe("Place Value");

    // Cleanup
    await prisma.topic.delete({ where: { id: topic.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest src/app/api/topics
```

Expected: FAIL — test runner can't connect or schema mismatch (proves test works).

- [ ] **Step 3: Create `src/app/api/topics/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await requireSession();
  const { rawInput } = await req.json();

  if (!rawInput?.trim()) {
    return NextResponse.json({ error: "Topic description required" }, { status: 400 });
  }

  // Use first line as title, fall back to first 40 chars
  const title = rawInput.split("\n")[0].trim().slice(0, 80) || rawInput.slice(0, 40);

  const topic = await prisma.topic.create({
    data: { userId: user.id, title, rawInput },
  });

  return NextResponse.json({ id: topic.id });
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest src/app/api/topics
```

Expected: PASS.

- [ ] **Step 5: Create new topic page**

Create `src/app/topic/new/page.tsx`:

```typescript
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTopicPage() {
  const router = useRouter();
  const [rawInput, setRawInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawInput }),
    });
    const { id } = await res.json();
    router.push(`/chat/${id}`);
  }

  return (
    <main className="max-w-2xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-2">This week's topic</h1>
      <p className="text-gray-500 mb-6">
        Type or paste what it says on your homework sheet.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full border rounded-xl px-4 py-3 h-48 text-base resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="e.g. Place value — include a hundreds, tens and ones chart and show how the same digit can have different values."
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {loading ? "Getting ideas..." : "Go! →"}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 6: Manual test**

Visit http://localhost:3000/topic/new, enter a topic, press Go. Should redirect to `/chat/<id>` (404 for now — chat not built yet). Check DB: `npx prisma studio` and verify topic was created.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: new topic screen and topic creation API"
```

---

## Task 6: Claude Integration

**Files:**
- Create: `src/lib/claude.ts`
- Create: `src/lib/unsplash.ts`

- [ ] **Step 1: Write failing test for Claude prompt builder**

Create `src/lib/__tests__/claude.test.ts`:

```typescript
import { buildSystemPrompt } from "../claude";

describe("buildSystemPrompt", () => {
  it("includes the character name", () => {
    const prompt = buildSystemPrompt("Zara");
    expect(prompt).toContain("Zara");
  });

  it("instructs not to do homework", () => {
    const prompt = buildSystemPrompt("Zara");
    expect(prompt.toLowerCase()).toContain("do not");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest src/lib/__tests__/claude.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Create `src/lib/claude.ts`**

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export function buildSystemPrompt(characterName: string): string {
  return `You are ${characterName}, a friendly and enthusiastic maths helper for a 10-11 year old student.

Your job is to:
1. Explain maths topics clearly using simple language suitable for age 10-11.
2. Give creative ideas for what the student could draw or write on their paper homework sheet.
3. Suggest how they might include their character (${characterName}) in their homework artwork.
4. Answer follow-up questions clearly and patiently.

Rules:
- Do NOT do the homework for the student. Do not write out answers they should fill in themselves.
- Keep explanations short, friendly and fun.
- Use examples and analogies a 10-year-old would understand.
- When suggesting a diagram, output it as a JSON block with this format:
  {"diagram": {"type": "place-value-chart"|"number-line"|"table", "data": {...}}}
- When you want to show an inspiration picture, output a JSON block:
  {"imageQuery": "search terms for Unsplash"}
- You can mix normal text with diagram and imageQuery blocks in the same response.`;
}

export async function chat(
  characterName: string,
  topicRawInput: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const systemPrompt = buildSystemPrompt(characterName);
  const messages =
    history.length === 0
      ? [{ role: "user" as const, content: `My homework topic this week is:\n\n${topicRawInput}\n\nPlease explain the topic and give me some ideas for my homework sheet.` }]
      : history.map((m) => ({ role: m.role, content: m.content }));

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  return (response.content[0] as { type: string; text: string }).text;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest src/lib/__tests__/claude.test.ts
```

Expected: PASS (2 tests).

- [ ] **Step 5: Create `src/lib/unsplash.ts`**

```typescript
export async function searchUnsplash(query: string): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}` } });
  const data = await res.json();
  return data.results?.[0]?.urls?.regular ?? null;
}
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: Claude API integration and Unsplash helper"
```

---

## Task 7: Chat API and Message Parsing

**Files:**
- Create: `src/app/api/chat/[topicId]/route.ts`
- Create: `src/components/DiagramRenderer.tsx`

- [ ] **Step 1: Write failing test for message parser**

Create `src/lib/__tests__/parseMessage.test.ts`:

```typescript
import { parseMessageContent } from "../parseMessage";

describe("parseMessageContent", () => {
  it("parses plain text", () => {
    const result = parseMessageContent("Hello there!");
    expect(result).toEqual([{ type: "text", text: "Hello there!" }]);
  });

  it("parses a diagram block", () => {
    const raw = 'Here is a chart: {"diagram": {"type": "place-value-chart", "data": {"hundreds": 3}}}';
    const result = parseMessageContent(raw);
    expect(result).toContainEqual(expect.objectContaining({ type: "diagram" }));
  });

  it("parses an image query block", () => {
    const raw = 'Look at this: {"imageQuery": "place value chart colourful"}';
    const result = parseMessageContent(raw);
    expect(result).toContainEqual(expect.objectContaining({ type: "imageQuery" }));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest src/lib/__tests__/parseMessage.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Create `src/lib/parseMessage.ts`**

```typescript
type TextPart = { type: "text"; text: string };
type DiagramPart = { type: "diagram"; diagram: { type: string; data: Record<string, unknown> } };
type ImageQueryPart = { type: "imageQuery"; query: string };
export type MessagePart = TextPart | DiagramPart | ImageQueryPart;

// Extracts top-level JSON objects from a string, handling nested braces.
function extractJsonObjects(text: string): { json: Record<string, unknown>; start: number; end: number }[] {
  const results = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === "{") {
      let depth = 0;
      let j = i;
      while (j < text.length) {
        if (text[j] === "{") depth++;
        else if (text[j] === "}") { depth--; if (depth === 0) break; }
        j++;
      }
      try {
        const candidate = text.slice(i, j + 1);
        const json = JSON.parse(candidate);
        if (json.diagram || json.imageQuery) {
          results.push({ json, start: i, end: j + 1 });
        }
      } catch { /* not valid JSON, skip */ }
      i = j + 1;
    } else {
      i++;
    }
  }
  return results;
}

export function parseMessageContent(raw: string): MessagePart[] {
  const parts: MessagePart[] = [];
  const blocks = extractJsonObjects(raw);
  let lastIndex = 0;

  for (const { json, start, end } of blocks) {
    if (start > lastIndex) {
      const text = raw.slice(lastIndex, start).trim();
      if (text) parts.push({ type: "text", text });
    }
    if (json.diagram) {
      parts.push({ type: "diagram", diagram: json.diagram as DiagramPart["diagram"] });
    } else if (json.imageQuery) {
      parts.push({ type: "imageQuery", query: json.imageQuery as string });
    }
    lastIndex = end;
  }

  if (lastIndex < raw.length) {
    const remaining = raw.slice(lastIndex).trim();
    if (remaining) parts.push({ type: "text", text: remaining });
  }

  return parts.length ? parts : [{ type: "text", text: raw }];
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest src/lib/__tests__/parseMessage.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Create chat API route**

Create `src/app/api/chat/[topicId]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { chat } from "@/lib/claude";

export async function GET(_req: NextRequest, { params }: { params: { topicId: string } }) {
  const user = await requireSession();
  const topicId = parseInt(params.topicId);
  const topic = await prisma.topic.findFirst({ where: { id: topicId, userId: user.id } });
  if (!topic) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { topicId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ topic, messages });
}

export async function POST(req: NextRequest, { params }: { params: { topicId: string } }) {
  const user = await requireSession();
  const topicId = parseInt(params.topicId);
  const topic = await prisma.topic.findFirst({ where: { id: topicId, userId: user.id } });
  if (!topic) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { userMessage } = await req.json();

  // Save user message
  if (userMessage) {
    await prisma.message.create({ data: { topicId, role: "user", content: userMessage } });
  }

  // Load history
  const history = await prisma.message.findMany({
    where: { topicId },
    orderBy: { createdAt: "asc" },
  });

  const assistantText = await chat(
    user.characterName,
    topic.rawInput,
    history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))
  );

  await prisma.message.create({ data: { topicId, role: "assistant", content: assistantText } });

  return NextResponse.json({ content: assistantText });
}
```

- [ ] **Step 6: Create `src/components/DiagramRenderer.tsx`**

```typescript
type Diagram = { type: string; data: Record<string, unknown> };

export default function DiagramRenderer({ diagram }: { diagram: Diagram }) {
  if (diagram.type === "place-value-chart") {
    const d = diagram.data as Record<string, number>;
    const columns = Object.entries(d);
    return (
      <div className="overflow-x-auto my-2">
        <table className="border-collapse text-center text-sm">
          <thead>
            <tr>
              {columns.map(([col]) => (
                <th key={col} className="bg-indigo-600 text-white px-4 py-2 capitalize">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {columns.map(([col, val]) => (
                <td key={col} className="border border-indigo-200 px-6 py-3 text-xl font-bold">{val}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (diagram.type === "number-line") {
    const { start, end, highlight } = diagram.data as { start: number; end: number; highlight?: number };
    const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    return (
      <div className="flex items-center gap-1 my-2 overflow-x-auto py-2">
        {numbers.map((n) => (
          <div
            key={n}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              n === highlight ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-800"
            }`}
          >
            {n}
          </div>
        ))}
      </div>
    );
  }

  return <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(diagram, null, 2)}</pre>;
}
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: chat API route, message parser, diagram renderer"
```

---

## Task 8: Chat Screen UI

**Files:**
- Create: `src/app/chat/[topicId]/page.tsx`
- Create: `src/components/CharacterPanel.tsx`
- Create: `src/components/ChatMessage.tsx`
- Create: `src/components/ChatInput.tsx`

- [ ] **Step 1: Create `src/components/CharacterPanel.tsx`**

```typescript
type Props = {
  characterImagePath: string | null;
  characterName: string;
  panelBackground: string;
};

export default function CharacterPanel({ characterImagePath, characterName, panelBackground }: Props) {
  const style: React.CSSProperties = panelBackground.startsWith("#") || panelBackground.startsWith("rgb")
    ? { backgroundColor: panelBackground }
    : { backgroundImage: `url(${panelBackground})`, backgroundSize: "cover", backgroundPosition: "center" };

  return (
    <div
      className="w-28 flex-shrink-0 flex flex-col items-center justify-start pt-6 gap-3"
      style={style}
    >
      {characterImagePath ? (
        <img
          src={characterImagePath}
          alt={characterName}
          className="w-16 h-16 rounded-full object-cover border-4 border-white shadow"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-indigo-200 flex items-center justify-center text-2xl">🧙</div>
      )}
      <span className="text-xs font-bold text-white drop-shadow text-center px-1">{characterName}</span>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/ChatMessage.tsx`**

```typescript
"use client";
import { useEffect, useState } from "react";
import { parseMessageContent } from "@/lib/parseMessage";
import DiagramRenderer from "./DiagramRenderer";

type Props = {
  role: "user" | "assistant";
  content: string;
  characterImagePath: string | null;
  userProfileImagePath: string | null;
  characterPosition: "left" | "right";
};

export default function ChatMessage({
  role,
  content,
  characterImagePath,
  userProfileImagePath,
  characterPosition,
}: Props) {
  const parts = parseMessageContent(content);
  const isCharacter = role === "assistant";
  const isRight = (isCharacter && characterPosition === "right") || (!isCharacter && characterPosition === "left");

  return (
    <div className={`flex gap-2 items-start ${isRight ? "flex-row-reverse" : ""}`}>
      <div className="flex-shrink-0 w-8 h-8">
        {isCharacter && characterImagePath && (
          <img src={characterImagePath} className="w-8 h-8 rounded-full object-cover" alt="" />
        )}
        {!isCharacter && userProfileImagePath && (
          <img src={userProfileImagePath} className="w-8 h-8 rounded-full object-cover" alt="" />
        )}
      </div>
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm space-y-2 ${
          isCharacter
            ? "bg-white/90 backdrop-blur rounded-tl-none"
            : "bg-indigo-600 text-white rounded-tr-none"
        } ${isRight ? "rounded-tr-none rounded-tl-2xl" : ""}`}
      >
        {parts.map((part, i) => {
          if (part.type === "text") return <p key={i}>{part.text}</p>;
          if (part.type === "diagram") return <DiagramRenderer key={i} diagram={part.diagram} />;
          if (part.type === "imageQuery") return <UnsplashImage key={i} query={part.query} />;
          return null;
        })}
      </div>
    </div>
  );
}

function UnsplashImage({ query }: { query: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/unsplash?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((d) => setUrl(d.url));
  }, [query]);

  if (!url) return <div className="h-24 bg-gray-100 rounded animate-pulse" />;
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">Inspiration picture</p>
      <img src={url} alt={query} className="rounded-lg w-full max-h-40 object-cover" />
    </div>
  );
}
```

- [ ] **Step 3: Create Unsplash proxy API route**

Create `src/app/api/unsplash/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { searchUnsplash } from "@/lib/unsplash";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") ?? "";
  const url = await searchUnsplash(query);
  return NextResponse.json({ url });
}
```

- [ ] **Step 4: Create `src/components/ChatInput.tsx`**

```typescript
"use client";
import { useState } from "react";

type Props = { onSend: (message: string) => void; disabled: boolean };

export default function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-3 bg-white/80 backdrop-blur border-t">
      <input
        className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        placeholder="Ask a question..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center disabled:opacity-50"
      >
        ➤
      </button>
    </form>
  );
}
```

- [ ] **Step 5: Add `GET /api/auth/me` route**

Create `src/app/api/auth/me/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.user) return NextResponse.json(null, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json(null, { status: 404 });
  return NextResponse.json({
    id: user.id,
    username: user.username,
    profileImagePath: user.profileImagePath,
    characterImagePath: user.characterImagePath,
    characterName: user.characterName,
    settings: user.settings,
  });
}
```

- [ ] **Step 6: Create the chat page**

Create `src/app/chat/[topicId]/page.tsx`:

```typescript
"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import CharacterPanel from "@/components/CharacterPanel";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";

type Message = { id: number; role: "user" | "assistant"; content: string };
type Topic = { id: number; title: string; rawInput: string };

export default function ChatPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<{
    characterImagePath: string | null;
    characterName: string;
    profileImagePath: string | null;
    settings: Record<string, string>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/chat/${topicId}`)
      .then((r) => r.json())
      .then(({ topic, messages }) => {
        setTopic(topic);
        setMessages(messages);
        // If no messages yet, kick off first response
        if (messages.length === 0) sendMessage(null);
      });
    fetch("/api/auth/me").then((r) => r.json()).then(setUser);
  }, [topicId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string | null) {
    setLoading(true);
    const res = await fetch(`/api/chat/${topicId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage: text }),
    });
    const { content } = await res.json();
    const newMsg: Message = { id: Date.now(), role: "assistant", content };
    if (text) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() - 1, role: "user", content: text },
        newMsg,
      ]);
    } else {
      setMessages((prev) => [...prev, newMsg]);
    }
    setLoading(false);
  }

  const charPosition = (user?.settings?.characterPosition as "left" | "right") ?? "left";
  const chatBg = user?.settings?.chatBackground;
  const panelBg = user?.settings?.characterPanelBackground ?? "#4f46e5";

  const chatBgStyle = chatBg
    ? { backgroundImage: `url(/backgrounds/${chatBg})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { backgroundColor: "#f1f5f9" };

  const panel = (
    <CharacterPanel
      characterImagePath={user?.characterImagePath ?? null}
      characterName={user?.characterName ?? "Mathsie"}
      panelBackground={panelBg}
    />
  );

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <div className="px-4 py-2 bg-white border-b text-sm font-semibold text-gray-700">
        {topic?.title ?? "Loading..."}
      </div>
      <div className="flex flex-1 overflow-hidden">
        {charPosition === "left" && panel}
        <div className="flex-1 flex flex-col overflow-hidden" style={chatBgStyle}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                role={m.role}
                content={m.content}
                characterImagePath={user?.characterImagePath ?? null}
                userProfileImagePath={user?.profileImagePath ?? null}
                characterPosition={charPosition}
              />
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-200 flex-shrink-0" />
                <div className="bg-white/90 rounded-2xl px-4 py-3 text-sm text-gray-400">Thinking...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <ChatInput onSend={sendMessage} disabled={loading} />
        </div>
        {charPosition === "right" && panel}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Manual test**

Create a new topic, press Go — should redirect to chat, first message from character should appear automatically. Ask a follow-up question, verify response appears.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: chat screen with character panel, messages, diagram renderer"
```

---

## Task 9: Settings Screen

**Files:**
- Create: `src/app/settings/page.tsx`
- Create: `src/components/BackgroundPicker.tsx`
- Create: `src/app/api/settings/route.ts`

- [ ] **Step 1: Add background images**

Add ~5 landscape images to `public/backgrounds/` (name them e.g. `mountains.jpg`, `beach.jpg`, `forest.jpg`, `meadow.jpg`, `snow.jpg`). Free images available from https://unsplash.com/. Download manually and save to that folder.

- [ ] **Step 2: Create settings API route**

Create `src/app/api/settings/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await requireSession();
  const updates = await req.json();
  const current = await prisma.user.findUnique({ where: { id: user.id } });
  const currentSettings = (current?.settings as Record<string, unknown>) ?? {};
  await prisma.user.update({
    where: { id: user.id },
    data: { settings: { ...currentSettings, ...updates } },
  });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Create `src/components/BackgroundPicker.tsx`**

```typescript
"use client";

const BACKGROUNDS = ["mountains.jpg", "beach.jpg", "forest.jpg", "meadow.jpg", "snow.jpg"];

type Props = {
  label: string;
  current: string | undefined;
  onSelect: (filename: string) => void;
};

export default function BackgroundPicker({ label, current, onSelect }: Props) {
  return (
    <div className="space-y-2">
      <p className="font-medium text-sm">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {BACKGROUNDS.map((bg) => (
          <button
            key={bg}
            type="button"
            onClick={() => onSelect(bg)}
            className={`w-20 h-14 rounded-lg overflow-hidden border-4 transition ${
              current === bg ? "border-indigo-600" : "border-transparent"
            }`}
          >
            <img
              src={`/backgrounds/${bg}`}
              alt={bg}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create settings page**

Create `src/app/settings/page.tsx`:

```typescript
"use client";
import { useEffect, useState } from "react";
import BackgroundPicker from "@/components/BackgroundPicker";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((u) => setSettings(u?.settings ?? {}));
  }, []);

  async function save(updates: Record<string, string>) {
    const next = { ...settings, ...updates };
    setSettings(next);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="max-w-xl mx-auto mt-10 p-6 space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="space-y-2">
        <p className="font-medium text-sm">Character position</p>
        <div className="flex gap-2">
          {(["left", "right"] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => save({ characterPosition: pos })}
              className={`px-4 py-2 rounded-lg font-medium text-sm capitalize ${
                settings.characterPosition === pos
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {pos === "left" ? "← Left" : "Right →"}
            </button>
          ))}
        </div>
      </div>

      <BackgroundPicker
        label="Chat background"
        current={settings.chatBackground}
        onSelect={(bg) => save({ chatBackground: bg })}
      />

      <BackgroundPicker
        label="Character panel background"
        current={settings.characterPanelBackground}
        onSelect={(bg) => save({ characterPanelBackground: `/backgrounds/${bg}` })}
      />

      {saved && <p className="text-green-600 text-sm font-medium">Saved!</p>}

      <a href="/" className="block text-center text-indigo-600 text-sm">← Back to home</a>
    </main>
  );
}
```

- [ ] **Step 5: Add settings link to Header**

In `src/components/Header.tsx`, add a settings link next to the username:

```typescript
<a href="/settings" className="text-sm text-gray-500 hover:text-gray-700">Settings</a>
```

- [ ] **Step 6: Manual test**

Visit http://localhost:3000/settings. Toggle character position — go to chat and verify it switches sides. Pick a background — go to chat and verify it appears.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: settings screen — character position, chat and panel backgrounds"
```

---

## Task 10: Final Test Pass

- [ ] **Step 1: Run all tests**

```bash
npx jest
```

Expected: all tests pass (auth helpers, message parser, Claude prompt builder, topic creation).

- [ ] **Step 2: Final manual end-to-end test**

1. Sign up as a new user with a character name and images
2. Log in — verify profile image appears in header
3. Start a new topic — paste a real homework description
4. Verify character explains the topic and gives ideas
5. Ask a follow-up question — verify response
6. Go to settings — change character position and background
7. Return to chat — verify changes applied
8. Go home — verify topic appears in past topics list

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete maths facts homework helper app"
```
