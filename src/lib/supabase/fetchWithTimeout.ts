/**
 * Wraps a Supabase query with a timeout to prevent infinite loading.
 * Returns null on timeout — callers should handle null with a fallback (e.g. empty array).
 */
export async function fetchWithTimeout<T>(
  queryPromise: PromiseLike<{ data: T; error: any }>,
  timeoutMs = 12000
): Promise<T | null> {
  let timedOut = false

  const timeoutPromise = new Promise<{ data: null; error: null }>((resolve) =>
    setTimeout(() => {
      timedOut = true
      console.warn(`[fetchWithTimeout] Query timed out after ${timeoutMs}ms`)
      resolve({ data: null, error: null })
    }, timeoutMs)
  )

  const { data, error } = await Promise.race([queryPromise, timeoutPromise])

  if (timedOut) return null
  if (error) throw error

  return data
}
