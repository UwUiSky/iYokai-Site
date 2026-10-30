// Complete still illustrations. Poses and fur are painted into each environment;
// image and character always share one scale and the same perspective.
export const STILL_ART = {
  discord:'/cinematic/protocol-discord-wide.webp',
  shrine:'/cinematic/still-shrine-seated-wide.webp',
  city:'/cinematic/still-city-lean-wide.webp',
  theater:'/cinematic/still-theater-bow-wide.webp',
  social:'/cinematic/protocol-social-wide.webp',
  live:'/cinematic/protocol-live-wide.webp',
  projects:'/cinematic/protocol-projects-wide.webp',
  contact:'/cinematic/protocol-contact-wide.webp',
  protocolMusic:'/cinematic/protocol-music-wide.webp',
  music:'/cinematic/still-music-studio-wide.webp',
};

// Same character per protocol; independent paintings for its inner layouts.
export const PROTOCOL_DETAIL_ART = Object.fromEntries(
 ['social','music','live','projects','contact'].map(id=>[id,`/cinematic/protocol-${id}-detail-wide.webp`])
);
export const DISCORD_ART = {
 overview:STILL_ART.discord,
 features:'/cinematic/discord-security-ears-v2-wide.webp',
 music:'/cinematic/discord-music-ears-v3-wide.webp',
 dashboard:'/cinematic/discord-dashboard-ears-v3-wide.webp',
 spirits:'/cinematic/discord-spirits-v2-wide.webp',
 invites:'/cinematic/discord-invites-wide.webp',
 house:'/cinematic/spirit-house-wide.webp',
};
