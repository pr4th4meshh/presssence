# Presssence — Project Context

## What This Is

**Presssence** is a full-stack portfolio builder that gives users a public-facing portfolio page at `/{portfolioUsername}`. Users sign up, go through onboarding, and get a live, editable portfolio with projects, skills, social links, and a profile photo.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| Database | MongoDB via Prisma ORM |
| Auth | NextAuth.js v4 (Google OAuth + local email/password) |
| Storage | Firebase (profile photos, project cover images) |
| UI Primitives | Radix UI, Lucide icons, react-icons |
| Forms | React Hook Form + Zod |
| Notifications | Sonner (toasts) |
| Drag & Drop | @hello-pangea/dnd |

---

## Project Structure

```
src/
  app/
    api/                    # API route handlers
      auth/
        [...nextauth]/      # NextAuth config
        local/login/        # Local email/password login
        local/signup/       # Local email/password signup
      portfolio/            # Portfolio CRUD
      projects/[id]/        # Project CRUD
      user/                 # User profile updates
      checkUsername/        # Username availability check
      socialMediaInfo/      # Fetches metadata from social APIs
    (routes)/
      auth/login/           # Login page
      auth/signup/          # Signup page
      onboarding/           # Multi-step onboarding flow
      [portfolioUsername]/  # Public + editable portfolio page
  components/               # Shared UI components
  lib/                      # Prisma client, auth options, helpers
  hooks/                    # Custom React hooks
  utils/                    # Utility functions
  actions/                  # Server actions
prisma/
  schema.prisma             # MongoDB schema
```

---

## Data Models (Prisma / MongoDB)

- **User** — email, password (hashed), OAuth accounts, linked portfolio
- **Portfolio** — username (unique, used in URL), fullName, profession, headline, theme, features (skills array), projects, socialLinks
- **Project** — title, description, link, timeline, coverImage, position (for ordering)
- **SocialLinks** — twitter, linkedin, github, instagram, youtube, medium, website, behance, figma, awwwards, dribbble, spotify; includes `order[]` for custom display order
- **Account / Session / VerificationToken** — NextAuth managed

---

## Key Flows

### Auth
- Google OAuth via NextAuth (`/api/auth/[...nextauth]`)
- Local login: POST `/api/auth/local/login` — validates email/password, returns JWT
- Local signup: POST `/api/auth/local/signup` — hashes password with bcrypt

### Onboarding (multi-step)
Steps: Basic Info → Professional Details → Theme Selection → Social Media → Projects  
Route: `/onboarding`

### Portfolio Page (`/[portfolioUsername]`)
- Server-rendered by default; `ClientPage.tsx` handles editable state
- Sections: Hero (photo, name, headline), Skills, Projects, Socials, Footer
- Users can edit their own portfolio inline (edit buttons appear when authenticated as the owner)
- Social media cards show live metadata fetched from platform APIs (Spotify, GitHub)

### Social Media Info
- `GET /api/socialMediaInfo` — fetches metadata from external social platform APIs for card display

---

## Environment Variables

```env
DATABASE_URL=            # MongoDB connection string
NEXTAUTH_SECRET=         # Random secret for NextAuth
NEXTAUTH_URL=            # App base URL (e.g. http://localhost:3000)
GOOGLE_CLIENT_ID=        # Google OAuth app client ID
GOOGLE_CLIENT_SECRET=    # Google OAuth app client secret
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
SPOTIFY_CLIENT_ID=       # For Spotify metadata fetching
SPOTIFY_CLIENT_SECRET=
```

---

## Dev Commands

```bash
npm run dev      # Start dev server with Turbopack (hot reload)
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint
npx prisma studio        # Open Prisma database GUI
npx prisma db push       # Push schema changes to MongoDB
npx prisma generate      # Regenerate Prisma client after schema changes
```

---

## Conventions & Patterns

- **API routes** live in `src/app/api/` and follow Next.js App Router conventions (`route.ts` with named exports `GET`, `POST`, `PATCH`, `DELETE`)
- **Page components** use the `(routes)` route group; co-located `_components/` folders hold page-specific components
- **Prisma client** is a singleton in `src/lib/` — never instantiate it elsewhere
- **Auth session** is accessed via `getServerSession(authOptions)` on the server or `useSession()` on the client
- **Image uploads** go to Firebase Storage; the resulting URL is saved to MongoDB
- **Toast notifications** use `sonner` — import `toast` from `"sonner"`
- **Form validation** uses Zod schemas paired with React Hook Form's `zodResolver`
- **Drag and drop** for project reordering uses `@hello-pangea/dnd`
- **Theme** field on Portfolio is a string (default `"modern"`); theme-specific rendering is handled in the portfolio page components

---

## Things to Know

- The portfolio username is the URL slug — it must be unique across all users, checked via `/api/checkUsername`
- `isExisting` on Portfolio tracks whether onboarding has been completed
- Social links support a custom display `order[]` array — respect this when rendering `PortfolioSocials`
- Project `position` field controls display order; update it when reordering via drag and drop
- Firebase is used only for file storage (photos/images), not for auth — auth is NextAuth only
- `@clerk/nextjs` and `@kinde-oss/kinde-auth-nextjs` are installed as dependencies but NextAuth is the active auth system
