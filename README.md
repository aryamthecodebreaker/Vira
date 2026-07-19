# Vira — AI Real Estate Assistant

Vira is a conversational AI assistant for finding property in India. Chat naturally about what you're looking for — Vira qualifies your budget, city, and needs like a friendly broker would, then answers with matching property cards.

> Prototype, built February 2026.

## What it does

- **Conversational property search** — Vira asks about budget (in ₹ Lakhs/Crores), preferred city, property type, BHK, purpose (investment vs self-use), timeline, and amenities in a natural flow — not a form.
- **Property cards, not walls of text** — recommendations travel inside the model response as a `[PROPERTIES_START]…[PROPERTIES_END]` JSON block that the chat UI parses into rich cards.
- **Streaming responses** — replies stream in live with a typing indicator.
- **Remembers you** — qualifying answers persist per user, so return visits open with personalized context instead of starting over.
- **Owner portal** (`/owner`) — property owners can submit their own listings.
- **Partner portal** (`/partner`) — brokers and partners can submit inventory.
- **Admin dashboard** (`/admin`) — review submissions and manage properties.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS + lucide-react |
| AI | Google Gemini (`gemini-2.0-flash`, falling back to `gemini-1.5-flash`) with a custom Indian real-estate system prompt (RERA-aware, ₹ L/Cr pricing) |
| Auth | NextAuth v4 with Google sign-in; password-protected admin |
| Database | Supabase (Postgres) — users, conversations, messages, user preferences, properties, property views, owner & partner submissions (`supabase-schema.sql`) |

## Getting started

```bash
npm install
```

1. Create a [Supabase](https://supabase.com) project and run `supabase-schema.sql` in its SQL editor.
2. Copy `.env.example` to `.env.local` and fill in the values below.
3. `npm run dev` and open http://localhost:3000.

### Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable (anon) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin operations — keep secret, never expose to the client |
| `GEMINI_API_KEY` | Google Gemini ([aistudio.google.dev](https://aistudio.google.dev)) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in (Google Cloud Console) |
| `NEXTAUTH_SECRET` | NextAuth session secret (`openssl rand -base64 32`) |
| `ADMIN_PASSWORD` | Password for the `/admin` dashboard — always set this in any real deployment |

---

Part of [my builder's journey](https://aryam-journey.vercel.app) · © 2026 Aryam
