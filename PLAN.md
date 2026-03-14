# Dev Job Tracker — Project Plan

## Stack

| What | Choice | Why |
|------|--------|-----|
| Framework | **Nuxt 3** | SSR/SPA, routing, auto-imports |
| State | **Pinia** | Standard for Nuxt 3 |
| Styles | **Tailwind CSS** | Fast, widely adopted |
| DB (MVP) | **localStorage** | Zero deployment, works offline |
| DB (v2) | **Supabase** | Free tier, easy to swap in |
| Language | **TypeScript** | Essential for portfolio projects |

## Data Model

```ts
type JobStatus = 'wishlist' | 'applied' | 'interview' | 'offer' | 'rejected'

interface Job {
  id: string           // crypto.randomUUID()
  company: string
  position: string
  url?: string
  salary?: string
  status: JobStatus
  notes: string
  createdAt: string    // ISO date
  updatedAt: string
}
```

## Project Structure

```
pages/
  index.vue          ← Kanban board (home)
  jobs/
    [id].vue         ← Job detail + edit

components/
  KanbanBoard.vue    ← 5 columns by status
  JobCard.vue        ← Job card (drag & drop in v2)
  JobForm.vue        ← Create / edit modal
  StatusBadge.vue    ← Colored status badge
  AppHeader.vue      ← Logo + "Add Job" button + counters

stores/
  jobs.ts            ← CRUD + persist to localStorage

composables/
  useJobFilters.ts   ← Filter / sort logic
  useLocalStorage.ts ← localStorage wrapper

types/
  job.ts             ← Job, JobStatus, form types
```

## Pinia Store

```ts
// stores/jobs.ts
export const useJobsStore = defineStore('jobs', () => {
  const jobs = ref<Job[]>([])

  const jobsByStatus = computed(() =>
    (status: JobStatus) => jobs.value.filter(j => j.status === status)
  )

  function addJob(data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) { ... }
  function updateJob(id: string, patch: Partial<Job>) { ... }
  function deleteJob(id: string) { ... }
  function moveJob(id: string, status: JobStatus) { ... }

  // persist
  watch(jobs, val => localStorage.setItem('jobs', JSON.stringify(val)), { deep: true })

  return { jobs, jobsByStatus, addJob, updateJob, deleteJob, moveJob }
})
```

## Development Phases

### Phase 1 — Project Setup
- [ ] Scaffold Nuxt 3 project via `nuxi`
- [ ] Add Tailwind CSS module and configure `tailwind.config.ts`
- [ ] Add Pinia module
- [ ] Set up TypeScript strict mode in `tsconfig.json`
- [ ] Define `Job` and `JobStatus` types in `types/job.ts`
- [ ] Init git and make first commit

### Phase 2 — Pinia Store
- [ ] Create `stores/jobs.ts` with `addJob`, `updateJob`, `deleteJob`, `moveJob`
- [ ] Add `jobsByStatus` computed getter
- [ ] Implement localStorage persist via `watch`
- [ ] Load jobs from localStorage on store init

### Phase 3 — Kanban Board
- [ ] Create `pages/index.vue` with board layout
- [ ] Create `KanbanBoard.vue` — renders 5 columns from `jobsByStatus`
- [ ] Create `JobCard.vue` — displays company, position, status badge
- [ ] Create `StatusBadge.vue` — color-coded by status

### Phase 4 — Add / Edit Job
- [ ] Create `JobForm.vue` — form fields: company, position, url, salary, status, notes
- [ ] Wire "Add Job" button in `AppHeader.vue` to open modal
- [ ] Wire "Edit" action on `JobCard.vue` to open pre-filled modal
- [ ] Implement `deleteJob` with confirmation prompt

### Phase 5 — Status Management
- [ ] Add status change buttons / dropdown directly on `JobCard.vue`
- [ ] Show status counters per column in `KanbanBoard.vue`
- [ ] Add total counters to `AppHeader.vue`

### Phase 6 — Job Detail Page
- [ ] Create `pages/jobs/[id].vue`
- [ ] Display full job info + editable notes field
- [ ] Auto-save notes on input (debounced)
- [ ] Add breadcrumb navigation back to board

### Phase 7 — UX Polish
- [ ] Add search / filter by company name (`useJobFilters.ts`)
- [ ] Add `vue-sonner` for toast notifications on add / edit / delete
- [ ] Empty state UI per column ("No jobs here yet")
- [ ] Responsive layout for mobile

### Phase 8 — Drag & Drop
- [ ] Install `vuedraggable` (vue3 version)
- [ ] Wrap column job lists with `<draggable>`
- [ ] Call `moveJob` on drop to update status in store

### Phase 9 — Supabase ✅
- [x] Create Supabase project, define `jobs` table matching `Job` type
- [x] Replace localStorage logic in store with Supabase client calls
- [x] Handle loading / error states in store

### Phase 10 — GitHub OAuth ✅
- [x] Enable GitHub provider in Supabase dashboard + create GitHub OAuth App
- [x] Add `user_id` column to `jobs` table + RLS policies (users see only their own jobs)
- [x] Create `pages/login.vue` with "Sign in with GitHub" button
- [x] Add auth middleware to protect `/` and `/jobs/[id]`
- [x] Show user avatar + "Sign out" in AppHeader
- [x] Pass `user_id` on insert in jobs store

### Phase 11 — Deploy to Vercel ✅
- [x] Push to GitHub
- [x] Connect repo to Vercel → https://dev-job-tracker.vercel.app
- [x] Add `SUPABASE_URL` and `SUPABASE_KEY` env vars in Vercel dashboard
- [x] Set production URL as redirect URL in Supabase + GitHub OAuth App

### Improvements Backlog
- [x] **Loading skeleton** — show skeleton cards while `store.loading` is true
- [x] **Optimistic updates** — move card immediately on drag, revert on error
- [ ] **Realtime sync** — Supabase `channel().on('postgres_changes')` to sync across tabs
- [ ] **Deadlines** — add `deadline` field, highlight overdue cards in red
- [ ] **Statistics page** — `/stats` with application funnel chart (wishlist → offer conversion)

## Project Init

```bash
npx nuxi@latest init dev-job-tracker
cd dev-job-tracker
npx nuxi module add tailwindcss
npx nuxi module add pinia
git init && git add . && git commit -m "init: nuxt 3 + pinia + tailwind"
```

## Talking Points for Interviews

- Why Pinia over Vuex
- How reactive persist works without extra libraries
- How to scale to Supabase (swapping one layer)
- Kanban as a UI pattern for a state machine
