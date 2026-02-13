# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run dev      # Development server (port 3000)
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
```

## Architecture Overview

**Tech Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Supabase

### Core Architecture

- **Single-page app** with tab navigation (오늘의 성과, 뼈이스북, 스터디 그룹, 멤버)
- **No full-page loading blocker** — page layout (banner, tabs, footer) renders immediately; each tab handles its own loading state
- **AuthProvider** wraps the entire app providing `user`, `profile`, `session` state
- **Custom hooks** handle data fetching with Supabase real-time subscriptions
- **Supabase client** uses singleton pattern (`src/lib/supabase/client.ts`) to prevent session conflicts

### Key Directories

- `src/app/` - Next.js App Router (single page with tabs)
- `src/components/` - Feature-based organization (auth, calendar, feed, group, member, layout, ui, import)
- `src/lib/hooks/` - Data hooks with real-time subscriptions (useFeeds, useGroups, useWeeklyLogs, useMembers)
- `src/lib/supabase/` - Client factories (browser singleton, server, middleware) + fetchWithTimeout utility
- `supabase/schema.sql` - Full database schema with RLS policies and triggers

### Data Flow Pattern

1. `AuthProvider` initializes session with 3s timeout (graceful resolve, no error thrown)
2. Custom hooks fetch data via `fetchWithTimeout` (12s default) and subscribe to Supabase real-time changes
3. Components consume hooks via `useAuth()` and feature-specific hooks
4. All timeouts resolve gracefully (no `reject`) to avoid Next.js error overlays

### Timeout Architecture

All Supabase queries use `fetchWithTimeout` (`src/lib/supabase/fetchWithTimeout.ts`) which returns `null` on timeout instead of throwing. Callers handle `null` with fallback empty arrays.

- Auth session: 3s timeout → resolves null (user stays logged out until onAuthStateChange fires)
- Data reads (all hooks): 12s via `fetchWithTimeout` → returns null, sets empty state
- Profile update (write): 15s timeout in AuthProvider
- Middleware: 3s for session refresh
- **Supabase free tier**: Projects pause after 7 days of inactivity. Cold start can take 10+ seconds. Keep timeouts generous.

### Real-Time Subscription Pattern

```typescript
useEffect(() => {
  const channel = supabase
    .channel('channel_name')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tablename' }, () => fetchData())
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [fetchData])
```

### Modal Pattern

`Modal` component uses `createPortal(document.body)` to escape parent stacking contexts. This ensures modals always render above all other content regardless of where they are used in the component tree.

### Database Tables

- `profiles` - User profiles (auto-created via trigger on auth.users insert)
- `weekly_logs` - Daily progress with rating and JSONB content
- `feeds` / `comments` - Social posts with image_url support
- `groups` / `group_members` / `group_posts` - Study groups with created_by tracking
- `diet_logs` - Health tracking

All tables have RLS enabled. SELECT policies use `USING (true)` (public read). INSERT/UPDATE/DELETE require `auth.uid()` match.

### Supabase Storage

- Bucket: `feed-images` (public) - Feed image uploads
- Upload path: `{userId}/{timestamp}.{ext}`

### Styling

- Tailwind CSS 4 with custom theme in `globals.css`
- Custom classes: `.btn-primary`, `.btn-secondary`, `.input-field`, `.textarea-field`, `.feed-card`, `.group-card`
- Modal classes: `.modal-overlay` (fixed z-50), `.modal-content` (max-h-[90vh] overflow-y-auto)
- Color variables: `--primary` (red), `--accent-green`, `--accent-blue`, `--accent-yellow`

### Type Conventions

- Row types: `Profile`, `Feed`, `Comment`, `Group`, etc. (from `src/lib/types/database.ts`)
- Extended types with relations: `FeedWithAuthor`, `WeeklyLogWithAuthor`, `GroupMemberWithProfile`
- Avatar types: `AvatarStyle` from DiceBear API styles
