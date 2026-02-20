# 🤖 AI Agent Context & Rules

This project uses a highly strict and modern technology stack. If you are an AI assistant (like Roo Code, Cursor, Jules, or Antigravity), **DO NOT** deviate from these rules.

## 📚 General Architecture & Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, Tailwind CSS v4, Framer Motion
- **Database / Auth:** Supabase (SSR implementation)
- **i18n:** `next-intl` (Fully dynamic routing for AR/EN)
- **Package Manager:** `npm`

## ⚠️ CRITICAL RULES

### 1. iCloud Sync Safety (node_modules)

- **SITUATION:** This project is synced via iCloud (or a similar cloud provider).
- **RULE:** The `node_modules` directory relies on a symlink to `node_modules.nosync` to prevent millions of files from uploading to iCloud.
- **ACTION:** If you ever run `npm install`, `pnpm install`, or update dependencies, you **MUST** immediately run the following command to restore the symlink:

  ```bash
  rm -rf node_modules.nosync && mv node_modules node_modules.nosync && ln -s node_modules.nosync node_modules
  ```

### 2. File Import Safety (Supabase)

- **SITUATION:** Due to sync conflicts, some files might duplicate as `client 2.ts` or `server 2.ts`.
- **RULE:** Never import from those duplicated files. Always use the canonical clients:
  - `@/lib/supabase/server` for Server Components/Actions.
  - `@/lib/supabase/client` for Client Components.
  - `@/lib/supabase/middleware` inside Next.js Middleware.

### 3. Tailwind CSS v4

- **RULE:** This project uses Tailwind CSS v4. Do NOT use `tailwind.config.js` or `tailwind.config.ts`. All configurations are done directly inside `.css` files via CSS variables or standard v4 `@theme` block architectures.

### 4. Language Protocols

- According to User preferences:
  - You MUST communicate in the chat interface in **ARABIC (العربية)**.
  - All code, comments, terminal commands, and documentation must be generated in **ENGLISH**.

If you understand these rules, proceed with your generation.
