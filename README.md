# DevJobTracker

A production-ready job search tracking application built with **Nuxt 3**, **Vue 3**, and **Supabase**. Helps developers organize their job search pipeline through a visual Kanban board with real-time sync, analytics, and deadline management.

**Live Demo**: [dev-job-tracker.vercel.app](https://dev-job-tracker.vercel.app)

---

## Features

### Kanban Board
- 5-column pipeline: **Wishlist → Applied → Interview → Offer → Rejected**
- Drag-and-drop cards between columns with instant optimistic UI updates
- Rollback on database error with toast notification
- Real-time keyboard shortcut: press `N` to open the add-job form
- Loading skeleton cards while fetching from database

### Job Management
- Create, edit, delete job applications with form validation
- Fields: company, position, URL, salary range, status, notes, deadline
- Auto-saving notes with 600 ms debounce and "Saved" visual indicator
- Quick status-change buttons on the detail page
- Relative timestamps ("5m ago", "2h ago", "3d ago") for created/updated dates

### Deadline Tracking
- Optional deadline per job (ISO date)
- Color-coded urgency badges directly on cards:
  - **Red** — overdue (N days ago)
  - **Amber "Today"** — same-day deadline
  - **Amber** — ≤ 3 days remaining
  - **Gray** — future deadline
- Overdue cards highlighted with red background in the Kanban column

### Analytics Dashboard (`/stats`)
- Summary cards: total jobs, applied %, interview rate, offer rate
- Status breakdown bar chart with per-status counts and percentages
- Conversion funnel: Wishlist → Applied → Interview → Offer with % at each stage
- Rejected job count and overall rejection rate
- Deadline alert section: overdue count + upcoming (next 7 days) sorted list

### Search & Filter
- Global real-time search across company name and position
- Case-insensitive partial matching
- Filtered count displayed in header

### Authentication
- **GitHub OAuth 2.0** via Supabase Auth
- Protected routes via Nuxt middleware (redirects to `/login`)
- GitHub avatar displayed in header
- Row-Level Security (RLS) — every user sees only their own data

### Real-time Sync
- Supabase `postgres_changes` subscription for `INSERT`, `UPDATE`, `DELETE`
- Changes from other tabs or devices appear instantly without refresh
- User-scoped filter via RLS to prevent cross-user data leakage
- Cleanup on component unmount to prevent memory leaks

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Nuxt 3 (SSR + file-based routing) |
| UI Library | Vue 3 (Composition API) |
| Language | TypeScript (strict mode) |
| State Management | Pinia |
| Styling | Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime) |
| Authentication | GitHub OAuth 2.0 via Supabase Auth |
| Drag & Drop | vuedraggable 4 |
| Notifications | vue-sonner |
| Deployment | Vercel |

---

## Architecture

```
app/
├── components/
│   ├── KanbanBoard.vue      # 5-column board with drag-and-drop
│   ├── JobCard.vue          # Card with deadline badge and actions
│   ├── JobCardSkeleton.vue  # Animated loading placeholder
│   ├── JobForm.vue          # Create / edit modal (Teleport)
│   └── StatusBadge.vue      # Color-coded status label
├── composables/
│   ├── useJobFilters.ts     # Search query + computed filtered list
│   └── useRelativeTime.ts   # Human-readable relative timestamps
├── middleware/
│   └── auth.ts              # Route guard — redirect if unauthenticated
├── pages/
│   ├── index.vue            # Kanban board (home)
│   ├── login.vue            # GitHub OAuth sign-in
│   ├── stats.vue            # Analytics dashboard
│   ├── auth/confirm.vue     # OAuth callback handler
│   └── jobs/[id].vue        # Job detail + notes auto-save
├── stores/
│   └── jobs.ts              # Pinia store — CRUD + realtime subscription
└── types/
    └── job.ts               # Job interface, JobStatus, constants
```

---

## Key Engineering Decisions

**Optimistic Updates with Rollback**
When a user drags a card to a new column, the UI updates immediately without waiting for the database. If the Supabase request fails, the card snaps back to its original position and an error toast is shown.

**In-place Array Mutation for Drag-and-Drop**
vuedraggable holds internal references to the column arrays. Replacing arrays on each store update would break drag tracking. The Kanban board uses `splice(0, col.length, ...next)` to mutate arrays in-place, keeping drag handlers stable while staying reactive.

**Debounced Notes Auto-save**
The notes textarea fires an update 600 ms after the user stops typing, avoiding a database write on every keystroke. A "Saved" indicator appears for 1.5 s after the write completes.

**Supabase RLS as the Authorization Layer**
Row-Level Security policies enforce that every `SELECT`, `INSERT`, `UPDATE`, and `DELETE` is scoped to `auth.uid() = user_id`. The application never needs to manually filter by user in queries — the database guarantees data isolation.

**Conversion Funnel Logic**
The analytics page computes stage-by-stage conversion rates (Applied / Total, Interviews / Applied, Offers / Interviews) to give actionable insight into where in the pipeline applications drop off.

---

## Database Schema

```sql
CREATE TABLE jobs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company     text NOT NULL,
  position    text NOT NULL,
  url         text,
  salary      text,
  status      text NOT NULL CHECK (status IN ('wishlist','applied','interview','offer','rejected')),
  notes       text DEFAULT '',
  deadline    date,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY jobs_select ON jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY jobs_insert ON jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY jobs_update ON jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY jobs_delete ON jobs FOR DELETE USING (auth.uid() = user_id);
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project with GitHub OAuth configured
- A [GitHub OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)

### Setup

```bash
git clone https://github.com/your-username/DevJobTracker.git
cd DevJobTracker
npm install
```

Copy the environment template and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm run preview
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Supabase anonymous (public) key |

Configure the Supabase OAuth redirect URL to `https://your-domain.com/auth/confirm` in your Supabase dashboard and GitHub OAuth App settings.

---

## Project Status

Core features are complete and deployed to production. Potential future additions:

- Export job list to CSV
- Interview calendar view
- Bulk status updates (multi-select)
- Email reminders for upcoming deadlines
- Time-to-offer analytics

---

## License

MIT
