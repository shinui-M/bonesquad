/**
 * 뼈갈단 데이터 마이그레이션 스크립트
 * Google Sheets (Apps Script) → Supabase
 *
 * 사용법:
 * 1. .env.local 파일에 Supabase 정보 설정
 * 2. GOOGLE_SCRIPT_URL 환경 변수 설정
 * 3. npx ts-node scripts/migrate-data.ts 실행
 */

import { createClient } from '@supabase/supabase-js'

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Missing Supabase environment variables')
  process.exit(1)
}

if (!GOOGLE_SCRIPT_URL) {
  console.error('Error: Missing GOOGLE_SCRIPT_URL environment variable')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Types for old data structure
interface OldMember {
  name: string
  bio?: string
  avatar?: string
}

interface OldTask {
  memberName: string
  date: string
  content: string
  rating?: number
}

interface OldFeed {
  id: string
  memberName: string
  content: string
  imageUrl?: string
  timestamp: string
}

interface OldComment {
  feedId: string
  memberName: string
  content: string
  timestamp: string
}

interface OldGroupMember {
  group: string
  memberName: string
  joinedAt: string
}

interface OldGroupPost {
  group: string
  memberName: string
  content: string
  timestamp: string
}

interface OldDietLog {
  memberName: string
  date: string
  breakfast?: string
  lunch?: string
  dinner?: string
  snack?: string
  exercise?: string
}

interface OldData {
  members: OldMember[]
  tasks: OldTask[]
  feeds: OldFeed[]
  comments: OldComment[]
  groupMembers: OldGroupMember[]
  groupPosts: OldGroupPost[]
  dietLogs: OldDietLog[]
}

// Utility to generate a temporary email from name
function generateTempEmail(name: string): string {
  const sanitized = name.replace(/\s/g, '').toLowerCase()
  return `${sanitized}@bonesquad.temp`
}

// Utility to generate a random password
function generatePassword(): string {
  return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)
}

// Map to store member name -> user ID
const memberIdMap = new Map<string, string>()

// Map to store old feed ID -> new feed ID
const feedIdMap = new Map<string, string>()

// Map to store group name -> group ID
const groupIdMap = new Map<string, string>()

async function fetchOldData(): Promise<OldData> {
  console.log('Fetching data from Google Apps Script...')

  const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAllData`)
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`)
  }

  const data = await response.json()
  console.log('Data fetched successfully')
  return data
}

async function migrateMembers(members: OldMember[]): Promise<void> {
  console.log(`\nMigrating ${members.length} members...`)

  for (const member of members) {
    try {
      const email = generateTempEmail(member.name)
      const password = generatePassword()

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: member.name },
      })

      if (authError) {
        // User might already exist
        if (authError.message.includes('already been registered')) {
          const { data: users } = await supabase.auth.admin.listUsers()
          const existingUser = users.users.find((u) => u.email === email)
          if (existingUser) {
            memberIdMap.set(member.name, existingUser.id)
            console.log(`  [SKIP] ${member.name} - already exists`)
            continue
          }
        }
        console.error(`  [ERROR] ${member.name}: ${authError.message}`)
        continue
      }

      const userId = authData.user!.id
      memberIdMap.set(member.name, userId)

      // Update profile with additional info
      const { error: profileError } = await supabase.from('profiles').update({
        bio: member.bio || null,
        avatar_url: member.avatar || null,
      }).eq('id', userId)

      if (profileError) {
        console.error(`  [WARN] Profile update failed for ${member.name}: ${profileError.message}`)
      }

      console.log(`  [OK] ${member.name}`)
    } catch (error) {
      console.error(`  [ERROR] ${member.name}:`, error)
    }
  }

  console.log(`Member migration complete. Mapped ${memberIdMap.size} members.`)
}

async function loadGroups(): Promise<void> {
  console.log('\nLoading groups...')

  const { data: groups, error } = await supabase.from('groups').select('*')

  if (error) {
    console.error('Failed to load groups:', error.message)
    return
  }

  groups?.forEach((group) => {
    groupIdMap.set(group.name, group.id)
  })

  console.log(`Loaded ${groupIdMap.size} groups`)
}

async function migrateTasks(tasks: OldTask[]): Promise<void> {
  console.log(`\nMigrating ${tasks.length} tasks...`)

  let success = 0
  let failed = 0

  for (const task of tasks) {
    const userId = memberIdMap.get(task.memberName)
    if (!userId) {
      console.error(`  [SKIP] Task - member not found: ${task.memberName}`)
      failed++
      continue
    }

    try {
      // Parse content into items format
      const items = task.content.split('\n').filter(Boolean).map((line) => ({
        category: 'study',
        content: line,
      }))

      const { error } = await supabase.from('weekly_logs').upsert({
        user_id: userId,
        date: task.date,
        rating: task.rating || null,
        content: { items },
      })

      if (error) throw error
      success++
    } catch (error) {
      console.error(`  [ERROR] Task for ${task.memberName} on ${task.date}:`, error)
      failed++
    }
  }

  console.log(`Tasks migration: ${success} success, ${failed} failed`)
}

async function migrateFeeds(feeds: OldFeed[]): Promise<void> {
  console.log(`\nMigrating ${feeds.length} feeds...`)

  let success = 0
  let failed = 0

  for (const feed of feeds) {
    const userId = memberIdMap.get(feed.memberName)
    if (!userId) {
      console.error(`  [SKIP] Feed - member not found: ${feed.memberName}`)
      failed++
      continue
    }

    try {
      const { data, error } = await supabase.from('feeds').insert({
        user_id: userId,
        content: feed.content,
        image_url: feed.imageUrl || null,
        created_at: feed.timestamp,
      }).select()

      if (error) throw error

      // Map old ID to new ID
      if (data && data[0]) {
        feedIdMap.set(feed.id, data[0].id)
      }
      success++
    } catch (error) {
      console.error(`  [ERROR] Feed by ${feed.memberName}:`, error)
      failed++
    }
  }

  console.log(`Feeds migration: ${success} success, ${failed} failed`)
}

async function migrateComments(comments: OldComment[]): Promise<void> {
  console.log(`\nMigrating ${comments.length} comments...`)

  let success = 0
  let failed = 0

  for (const comment of comments) {
    const userId = memberIdMap.get(comment.memberName)
    const feedId = feedIdMap.get(comment.feedId)

    if (!userId) {
      console.error(`  [SKIP] Comment - member not found: ${comment.memberName}`)
      failed++
      continue
    }

    if (!feedId) {
      console.error(`  [SKIP] Comment - feed not found: ${comment.feedId}`)
      failed++
      continue
    }

    try {
      const { error } = await supabase.from('comments').insert({
        feed_id: feedId,
        user_id: userId,
        content: comment.content,
        created_at: comment.timestamp,
      })

      if (error) throw error
      success++
    } catch (error) {
      console.error(`  [ERROR] Comment by ${comment.memberName}:`, error)
      failed++
    }
  }

  console.log(`Comments migration: ${success} success, ${failed} failed`)
}

async function migrateGroupMembers(groupMembers: OldGroupMember[]): Promise<void> {
  console.log(`\nMigrating ${groupMembers.length} group memberships...`)

  let success = 0
  let failed = 0

  for (const gm of groupMembers) {
    const userId = memberIdMap.get(gm.memberName)
    const groupId = groupIdMap.get(gm.group)

    if (!userId) {
      console.error(`  [SKIP] Group member - member not found: ${gm.memberName}`)
      failed++
      continue
    }

    if (!groupId) {
      console.error(`  [SKIP] Group member - group not found: ${gm.group}`)
      failed++
      continue
    }

    try {
      const { error } = await supabase.from('group_members').insert({
        group_id: groupId,
        user_id: userId,
        joined_at: gm.joinedAt,
      })

      if (error && !error.message.includes('duplicate')) throw error
      success++
    } catch (error) {
      console.error(`  [ERROR] Group member ${gm.memberName} in ${gm.group}:`, error)
      failed++
    }
  }

  console.log(`Group members migration: ${success} success, ${failed} failed`)
}

async function migrateGroupPosts(groupPosts: OldGroupPost[]): Promise<void> {
  console.log(`\nMigrating ${groupPosts.length} group posts...`)

  let success = 0
  let failed = 0

  for (const post of groupPosts) {
    const userId = memberIdMap.get(post.memberName)
    const groupId = groupIdMap.get(post.group)

    if (!userId) {
      console.error(`  [SKIP] Group post - member not found: ${post.memberName}`)
      failed++
      continue
    }

    if (!groupId) {
      console.error(`  [SKIP] Group post - group not found: ${post.group}`)
      failed++
      continue
    }

    try {
      const { error } = await supabase.from('group_posts').insert({
        group_id: groupId,
        user_id: userId,
        content: post.content,
        created_at: post.timestamp,
      })

      if (error) throw error
      success++
    } catch (error) {
      console.error(`  [ERROR] Group post by ${post.memberName}:`, error)
      failed++
    }
  }

  console.log(`Group posts migration: ${success} success, ${failed} failed`)
}

async function migrateDietLogs(dietLogs: OldDietLog[]): Promise<void> {
  console.log(`\nMigrating ${dietLogs.length} diet logs...`)

  let success = 0
  let failed = 0

  for (const log of dietLogs) {
    const userId = memberIdMap.get(log.memberName)

    if (!userId) {
      console.error(`  [SKIP] Diet log - member not found: ${log.memberName}`)
      failed++
      continue
    }

    try {
      const { error } = await supabase.from('diet_logs').upsert({
        user_id: userId,
        date: log.date,
        breakfast: log.breakfast || null,
        lunch: log.lunch || null,
        dinner: log.dinner || null,
        snack: log.snack || null,
        exercise: log.exercise || null,
      })

      if (error) throw error
      success++
    } catch (error) {
      console.error(`  [ERROR] Diet log for ${log.memberName} on ${log.date}:`, error)
      failed++
    }
  }

  console.log(`Diet logs migration: ${success} success, ${failed} failed`)
}

async function main() {
  console.log('='.repeat(50))
  console.log('뼈갈단 데이터 마이그레이션 시작')
  console.log('='.repeat(50))

  try {
    // 1. Fetch old data
    const oldData = await fetchOldData()

    // 2. Load existing groups
    await loadGroups()

    // 3. Migrate members first (creates user accounts)
    await migrateMembers(oldData.members)

    // 4. Migrate tasks (weekly logs)
    await migrateTasks(oldData.tasks)

    // 5. Migrate feeds
    await migrateFeeds(oldData.feeds)

    // 6. Migrate comments (depends on feeds)
    await migrateComments(oldData.comments)

    // 7. Migrate group members
    await migrateGroupMembers(oldData.groupMembers)

    // 8. Migrate group posts
    await migrateGroupPosts(oldData.groupPosts)

    // 9. Migrate diet logs
    await migrateDietLogs(oldData.dietLogs)

    console.log('\n' + '='.repeat(50))
    console.log('마이그레이션 완료!')
    console.log('='.repeat(50))

    // Print member credentials for reference
    console.log('\n생성된 임시 계정:')
    console.log('(사용자들에게 비밀번호 재설정을 안내해주세요)')
    memberIdMap.forEach((id, name) => {
      console.log(`  ${name}: ${generateTempEmail(name)}`)
    })
  } catch (error) {
    console.error('\n마이그레이션 실패:', error)
    process.exit(1)
  }
}

main()
