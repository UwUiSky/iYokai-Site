import { appInstall, botInvite, platformLinks, safeUrl, type LinkItem, type PublicLinks } from './links'

export type ProtocolId = 'discord' | 'social' | 'music' | 'live' | 'projects' | 'contact'

export type Section = {
  id: string
  kicker: string
  title: string
  body?: string
  art: string
  /** Dove sta il testo: l'illustrazione ha la Kitsune a destra, quindi di base a sinistra. */
  align?: 'left' | 'low'
  list?: { name: string; role: string }[]
  links?: (links: PublicLinks) => LinkItem[]
}

export type Protocol = {
  id: ProtocolId
  number: string
  kanji: string
  name: string
  line: string
  art: string
  sections: Section[]
}

const art = (name: string) => `/art/${name}.webp`

export const PROTOCOLS: Protocol[] = [
  {
    id: 'discord',
    number: '01',
    kanji: '一',
    name: 'Discord Bot',
    line: 'Il tuo alleato digitale, nato dall’equilibrio tra tecnologia e leggenda.',
    art: art('protocol-discord-wide'),
    sections: [
      {
        id: 'casa',
        kicker: 'La Casa degli Spiriti',
        title: 'Più di un bot. Uno spirito.',
        body: 'La Kitsune arriva alla soglia e guarda dentro. Oltre la porta ogni stanza custodisce una parte della tua community.',
        art: art('spirit-house-wide'),
      },
      {
        id: 'suono',
        kicker: 'La sala del suono',
        title: 'Cinque voci, una sola radio.',
        body: 'Shirayuki, Aoi, Kuro, Hana e Rei: cinque istanze musicali con playlist, radio e coda condivisa.',
        art: art('discord-music-wide'),
        links: (l) =>
          l.discord.musicBots.map((bot) => ({ label: bot.name, note: 'Invita nel server', href: botInvite(bot.clientId, bot.permissions) })),
      },
      {
        id: 'schermi',
        kicker: 'La sala degli schermi',
        title: 'Ogni modulo ha il suo spirito.',
        art: art('discord-security-wide'),
        list: [
          { name: 'Kitsune', role: 'Moderazione avanzata: AutoMod, filtri, ban e mute' },
          { name: 'Tengu', role: 'Sicurezza: anti-raid, anti-nuke, verifica' },
          { name: 'Nekomata', role: 'Ticket: assistenza rapida e ordinata' },
          { name: 'Bakeneko', role: 'Livelli e XP: la progressione della community' },
          { name: 'Oni', role: 'Musica e radio' },
          { name: 'Rokurokubi', role: 'Automazioni: il bot lavora per te' },
        ],
      },
      {
        id: 'code',
        kicker: 'Le nove code',
        title: 'Nove code. Un’unica identità.',
        body: 'Otto bot e un’app Discord. La Casa degli Spiriti è la loro dimora, non una decima coda.',
        art: art('discord-spirits-v2-wide'),
        list: [
          { name: 'iYokaiミ', role: 'Il cuore' },
          { name: 'Shirayuki · Aoi · Kuro · Hana · Rei', role: 'Le cinque voci' },
          { name: 'iYokai NSFW', role: 'Solo adulti, accesso separato' },
          { name: 'iYokai App', role: 'Ti segue dove il bot non c’è' },
          { name: 'iYokai Mod', role: 'Il guardiano' },
        ],
      },
      {
        id: 'invoca',
        kicker: 'Invocazione',
        title: 'Invita lo spirito.',
        art: art('discord-invites-wide'),
        align: 'low',
        links: (l) => [
          { label: 'Invita il bot', note: 'Nel tuo server', href: botInvite(l.discord.botClientId, l.discord.botPermissions) },
          { label: 'Aggiungi l’app', note: 'Al tuo profilo', href: appInstall(l.discord.appClientId) },
          { label: 'iYokai Mod', note: 'Invita nel server', href: botInvite(l.discord.modClientId, l.discord.modPermissions) },
          { label: 'Casa degli Spiriti · Desktop', note: 'Scarica', href: safeUrl(l.discord.desktopUrl) },
          { label: 'Casa degli Spiriti · Android', note: 'Scarica', href: safeUrl(l.discord.mobileUrl) },
        ],
      },
    ],
  },
  {
    id: 'social',
    number: '02',
    kanji: '二',
    name: 'Social e gioco',
    line: 'Dove trovarmi: canali, profili di gioco, community.',
    art: art('protocol-social-wide'),
    sections: [
      {
        id: 'canali',
        kicker: 'I miei canali',
        title: 'Seguimi dove sei già.',
        art: art('protocol-social-wide'),
        links: (l) => platformLinks(l, ['instagram', 'tiktok', 'x', 'bluesky', 'youtube']),
      },
      {
        id: 'gioco',
        kicker: 'Gioco e community',
        title: 'Giochiamo insieme.',
        art: art('still-shrine-seated-wide'),
        links: (l) => platformLinks(l, ['steam', 'discord', 'twitch', 'kick']),
      },
    ],
  },
  {
    id: 'music',
    number: '03',
    kanji: '三',
    name: 'Musica',
    line: 'The Oni of Jah: dodici tracce tra reggae, eco e tempesta.',
    art: art('protocol-music-wide'),
    sections: [
      {
        id: 'album',
        kicker: 'Il suono',
        title: 'The Oni of Jah.',
        body: 'L’album di iYokaiミ. Ascoltalo dove preferisci.',
        art: art('protocol-music-wide'),
        links: (l) => platformLinks(l, ['spotify', 'youtubeMusic', 'youtube']),
      },
    ],
  },
  {
    id: 'live',
    number: '04',
    kanji: '四',
    name: 'Live',
    line: 'Dirette e video nuovi.',
    art: art('protocol-live-wide'),
    sections: [
      {
        id: 'dirette',
        kicker: 'In diretta',
        title: 'Quando si accende la lanterna.',
        art: art('protocol-live-wide'),
        links: (l) => platformLinks(l, ['twitch', 'kick', 'youtube']),
      },
    ],
  },
  {
    id: 'projects',
    number: '05',
    kanji: '五',
    name: 'Progetti',
    line: 'Il laboratorio: ciò che sto costruendo.',
    art: art('protocol-projects-wide'),
    sections: [
      {
        id: 'laboratorio',
        kicker: 'Lavori in corso',
        title: 'Il laboratorio.',
        art: art('protocol-projects-wide'),
        links: (l) => l.projects.map((project) => ({ label: project.name, note: 'Codice', href: safeUrl(project.url) })),
      },
    ],
  },
  {
    id: 'contact',
    number: '06',
    kanji: '六',
    name: 'Contattami',
    line: 'Una lettera arriva sempre.',
    art: art('protocol-contact-wide'),
    sections: [
      {
        id: 'lettera',
        kicker: 'La stanza delle lettere',
        title: 'Scrivimi.',
        art: art('protocol-contact-wide'),
        links: (l) => [
          { label: 'Discord', note: 'Il modo più rapido', href: safeUrl(l.platforms.discord) },
          { label: 'Email', note: 'Posta', href: /^[^\s@<>"']+@[^\s@<>"']+\.[a-z]{2,}$/i.test(l.contactEmail) ? `mailto:${l.contactEmail}` : null },
        ],
      },
    ],
  },
]

export const protocolById = (id: ProtocolId) => PROTOCOLS.find((p) => p.id === id) as Protocol
