/**
 * Avatar utility functions using DiceBear API
 */

// Available DiceBear styles
export const AVATAR_STYLES = [
  'notionists',
  'notionists-neutral',
  'avataaars',
  'avataaars-neutral',
  'bottts',
  'bottts-neutral',
  'lorelei',
  'lorelei-neutral',
  'micah',
  'personas',
  'pixel-art',
  'pixel-art-neutral',
  'thumbs',
] as const

export type AvatarStyle = typeof AVATAR_STYLES[number]

/**
 * Generate a DiceBear avatar URL
 */
export function generateAvatarUrl(
  seed: string,
  style: AvatarStyle = 'notionists',
  size: number = 128
): string {
  const encodedSeed = encodeURIComponent(seed)
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodedSeed}&size=${size}`
}

/**
 * Get avatar URL from profile data or generate one
 */
export function getAvatarUrl(
  avatarUrl: string | null,
  name: string,
  style: AvatarStyle = 'notionists'
): string {
  if (avatarUrl) return avatarUrl
  return generateAvatarUrl(name, style)
}

/**
 * Get style display name
 */
export function getStyleDisplayName(style: AvatarStyle): string {
  const styleNames: Record<AvatarStyle, string> = {
    'notionists': 'Notionists',
    'notionists-neutral': 'Notionists (무표정)',
    'avataaars': 'Avataaars',
    'avataaars-neutral': 'Avataaars (무표정)',
    'bottts': 'Bottts (로봇)',
    'bottts-neutral': 'Bottts (로봇 무표정)',
    'lorelei': 'Lorelei',
    'lorelei-neutral': 'Lorelei (무표정)',
    'micah': 'Micah',
    'personas': 'Personas',
    'pixel-art': 'Pixel Art',
    'pixel-art-neutral': 'Pixel Art (무표정)',
    'thumbs': 'Thumbs',
  }
  return styleNames[style] || style
}
