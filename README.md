# Presssence

A portfolio builder for developers. Claim a username, upload your résumé, and get a page at `presssence.me/<username>` that you edit in place, with no separate dashboard.

## What it does

- **Résumé import.** Upload a PDF and Gemini pulls out your skills, projects and work experience for you to review before saving.
- **Edit on the page.** When you're signed in, your own page becomes the editor. You can add links, skills and projects from the dock, rename or remove skills inline, edit projects in a dialog, and drag to reorder anything. Changes show straight away and roll back if the save fails.
- **Ask about me.** Each public portfolio has a chat that answers recruiters' questions from that person's own content, using embeddings and retrieval over their projects, experience and posts.
- **Themes.** Modern, Creative, Pro and Bold.
- **Blog.** Optional posts on the portfolio, with drag-to-reorder.
- **Accounts.** Email/password or Google sign-in, forgot password by email, a settings page to change your URL, and account deletion.
- **Share cards.** Open Graph metadata is generated per portfolio, so a link unfurls with the person's name and photo.

## Stack

Next.js 15 (App Router) · React 18 · TypeScript · Tailwind · Prisma + MongoDB · NextAuth · Zod · Gemini · Cloudinary · Resend

## Running it locally

You need Node 20+ and a MongoDB database. Prisma needs a replica set, so Atlas's free tier is the easiest option.

```bash
npm install
cp .env.example .env   # then fill it in, see below
npx prisma db push
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable | Needed for |
| --- | --- |
| `DATABASE_URL` | MongoDB connection string |
| `NEXTAUTH_SECRET` | Signing sessions. Generate one with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | The app's URL, e.g. `http://localhost:3000`. Also used in reset emails |
| `NEXT_PUBLIC_BASE_URL` | Public URL used in share links |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `GEMINI_API_KEY` | Résumé import and the portfolio chat |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Profile photos and project covers |
| `RESEND_API_KEY`, `EMAIL_FROM` | Password reset emails. Without them in development, the reset link is printed to the terminal instead |
| `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` | Optional, for the Spotify link card |

## Scripts

```bash
npm run dev      # dev server (Turbopack)
npm run build    # prisma generate + production build
npm run lint
```

The AI features come with small eval harnesses. LLM output varies between runs, so each case runs several times and reports a pass rate:

```bash
npx tsx --conditions=react-server --env-file=.env scripts/eval-resume.mts [runs]
npx tsx --conditions=react-server --env-file=.env scripts/eval-chat.mts <username> [runs]
```

## Project layout

```
src/app/(routes)/[portfolioUsername]   public portfolio + owner editing
src/app/(routes)/auth                  sign in, sign up, forgot/reset password
src/app/(routes)/onboarding            first-run setup and résumé import
src/app/api                            route handlers
src/lib/ai                             Gemini client, résumé extraction, chunking, retrieval
src/lib/validations.ts                 Zod schemas shared by forms and routes
prisma/schema.prisma                   data model
```

## A few decisions worth knowing

- **Saves read fresh server state first.** The skill, link and project editors fetch the saved list, apply the change and write it back, rather than sending this tab's copy. That way two open tabs can't overwrite each other's edits.
- **Password reset tokens** are stored only as SHA-256 hashes, last 60 minutes and are deleted when used, so each link works once. The request endpoint gives the same response whether or not the email exists, and it's rate limited per IP and per email.
- **Ownership is checked on the server** for every write. The client's `isOwner` flag only decides which controls to show.
