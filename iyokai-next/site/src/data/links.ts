import { useEffect, useState } from 'react'

export type LinkItem = { label: string; note?: string; href: string | null }

type MusicBot = { name: string; clientId: string; permissions: string }
export type PublicLinks = {
  platforms: Record<string, string>
  music: { title: string; artist: string; tracks: string[] }
  contactEmail: string
  projects: { name: string; url: string }[]
  discord: {
    botClientId: string
    appClientId: string
    botPermissions: string
    desktopUrl: string
    mobileUrl: string
    modClientId: string
    modPermissions: string
    musicBots: MusicBot[]
  }
}

/** Solo https: un link scritto male o con un altro protocollo non diventa mai cliccabile. */
export function safeUrl(value: string | undefined | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

const isId = (value: string | undefined) => Boolean(value && /^\d{15,25}$/.test(value))

export function botInvite(clientId: string | undefined, permissions = '0'): string | null {
  if (!isId(clientId)) return null
  const query = new URLSearchParams({
    client_id: clientId as string,
    scope: 'bot applications.commands',
    permissions: /^\d+$/.test(permissions) ? permissions : '0',
  })
  return `https://discord.com/oauth2/authorize?${query}`
}

export function appInstall(clientId: string | undefined): string | null {
  if (!isId(clientId)) return null
  const query = new URLSearchParams({ client_id: clientId as string, integration_type: '1', scope: 'applications.commands' })
  return `https://discord.com/oauth2/authorize?${query}`
}

const PLATFORM_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  youtubeMusic: 'YouTube Music',
  spotify: 'Spotify',
  twitch: 'Twitch',
  kick: 'Kick',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  x: 'X',
  bluesky: 'Bluesky',
  steam: 'Steam',
  discord: 'Discord',
}

export function platformLinks(links: PublicLinks, keys: string[]): LinkItem[] {
  return keys.map((key) => ({ label: PLATFORM_LABELS[key] ?? key, href: safeUrl(links.platforms[key]) }))
}

/** I link pubblici: un file solo, modificabile senza toccare il codice. */
export function usePublicLinks(): PublicLinks | null {
  const [links, setLinks] = useState<PublicLinks | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    fetch('/links.json', { cache: 'no-store', signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => data && setLinks(data as PublicLinks))
      .catch(() => undefined)
    return () => controller.abort()
  }, [])
  return links
}
