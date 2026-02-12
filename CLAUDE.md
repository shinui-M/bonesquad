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

- **Single-page app** with tab navigation (calendar, feed, groups, members)
- **AuthProvider** wraps the entire app providing `user`, `profile`, `session` state
- **Custom hooks** handle data fetching with Supabase real-time subscriptions
- **Supabase client** uses singleton pattern (`src/lib/supabase/client.ts`) to prevent session conflicts

### Key Directories

- `src/app/` - Next.js App Router (single page with tabs)
- `src/components/` - Feature-based organization (auth, calendar, feed, group, member, layout, ui)
- `src/lib/hooks/` - Data hooks with real-time subscriptions (useFeeds, useGroups, useWeeklyLogs)
- `src/lib/supabase/` - Client factories (browser singleton, server, middleware)
- `supabase/schema.sql` - Full database schema with RLS policies and triggers

### Data Flow Pattern

1. `AuthProvider` initializes session with 5s timeout to prevent infinite loading
2. Custom hooks fetch data and subscribe to Supabase real-time changes
3. Components consume hooks via `useAuth()` and feature-specific hooks

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

### Database Tables

- `profiles` - User profiles (auto-created via trigger on auth.users insert)
- `weekly_logs` - Daily progress with rating and JSONB content
- `feeds` / `comments` - Social posts with image_url support
- `groups` / `group_members` / `group_posts` - Study groups with created_by tracking
- `diet_logs` - Health tracking

### Supabase Storage

- Bucket: `feed-images` (public) - Feed image uploads
- Upload path: `{userId}/{timestamp}.{ext}`

### Styling

- Tailwind CSS 4 with custom theme in `globals.css`
- Custom classes: `.btn-primary`, `.btn-secondary`, `.input-field`, `.textarea-field`, `.feed-card`, `.group-card`
- Color variables: `--primary` (red), `--accent-green`, `--accent-blue`, `--accent-yellow`

### Type Conventions

- Row types: `Profile`, `Feed`, `Comment`, `Group`, etc.
- Extended types with relations: `FeedWithAuthor`, `WeeklyLogWithAuthor`, `GroupMemberWithProfile`
- Avatar types: `AvatarStyle` from DiceBear API styles

### Known Patterns

- Auth timeout (5s) in AuthProvider to handle slow/failing getSession calls
- Data fetch timeout (10s) in hooks to prevent infinite loading
- Middleware timeout (3s) for session refresh
