# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run dev      # Development server (usually port 3000)
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

### Key Directories

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - React components organized by feature (auth, calendar, feed, group, member, layout, ui)
- `src/lib/hooks/` - Custom hooks for data fetching with real-time Supabase subscriptions
- `src/lib/supabase/` - Supabase client factories (browser, server, middleware)
- `src/lib/types/database.ts` - TypeScript types for Supabase tables
- `src/lib/utils/` - Utilities for date formatting (Korean) and avatar generation
- `supabase/schema.sql` - Database schema with RLS policies

### Data Flow Pattern

1. **AuthProvider** (`components/auth/AuthProvider.tsx`) wraps the app with user/profile state
2. **Custom hooks** (`lib/hooks/`) fetch data and set up real-time subscriptions:
   - `useWeeklyLogs` - Weekly progress logs
   - `useFeeds` - Social feed with comments
   - `useGroups`, `useGroupMembers`, `useGroupPosts` - Study groups
   - `useDietLogs` - Diet tracking
3. **Components** consume hooks and render UI

### Real-Time Subscription Pattern

```typescript
useEffect(() => {
  const channel = supabase
    .channel('channel_name')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tablename' }, () => fetchData())
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [])
```

### Database Tables

- `profiles` - User profiles (linked to auth.users)
- `weekly_logs` - Daily progress with rating and categorized content
- `feeds` / `comments` - Social posts and replies
- `groups` / `group_members` / `group_posts` - Study groups
- `diet_logs` - Health tracking

### Styling

- Tailwind CSS with custom theme variables in `globals.css`
- Custom utility classes: `.btn-primary`, `.btn-secondary`, `.input-field`, `.textarea-field`, `.tab-btn`, `.feed-card`, `.submitter-card`
- Color variables: `--primary` (red), `--accent-green`, `--accent-blue`, `--accent-yellow`

### Type Conventions

- Row types: `Profile`, `Feed`, `Comment`, `Group`, etc.
- Extended types with relations: `FeedWithAuthor`, `WeeklyLogWithAuthor`, `GroupMemberWithProfile`
- Content types: `WeeklyLogContent`, `WeeklyLogItem`
