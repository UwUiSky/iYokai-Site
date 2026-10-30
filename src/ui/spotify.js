import { spotifyEmbed } from '../core/spotify.js';
import { loadPublicLinks } from '../core/links-config.js';
import { t, apply } from '../i18n/index.js';
export async function initSpotify(slot,providedConfig,{platformButtons=false}={}) {
 let config=providedConfig;try{config ||= (await loadPublicLinks()).music;}catch{}
 const entity=spotifyEmbed(config?.spotify);
 const label=document.createElement('p');label.className='spotify-note';label.dataset.i18n=entity?'spotify.intro':'spotify.pending';label.textContent=t(label.dataset.i18n);slot.append(label);
 if(!entity)return;
 if(document.documentElement.dataset.artwork==='static')document.getElementById('player').hidden=true;
 const release=document.createElement('div');release.className='spotify-release';
 const mark=document.createElement('span');mark.className='release-mark';mark.textContent='ミ';mark.setAttribute('aria-hidden','true');
 const names=document.createElement('div'),title=document.createElement('strong'),artist=document.createElement('small');title.textContent=config.title||'Spotify';artist.textContent=config.artist||'iYokaiミ';names.append(title,artist);release.append(mark,names);slot.prepend(release);label.hidden=true;
 const open=document.createElement('a');open.href=entity.url;open.target='_blank';open.rel='noopener noreferrer';open.className='text-link';open.dataset.i18n='spotify.open';
 // Local-only resources: open the official service outside this page.
 open.textContent=platformButtons?'Spotify':t('spotify.open');
 if(platformButtons){
  release.remove();open.className='music-platform-button';delete open.dataset.i18n;
  const youtube=document.createElement(config.youtube?'a':'button');youtube.className='music-platform-button';youtube.textContent='YouTube (Tema)';
  if(config.youtube){youtube.href=config.youtube;youtube.target='_blank';youtube.rel='noopener noreferrer';}else{youtube.type='button';youtube.disabled=true;youtube.title=t('gate.link-pending');}
  slot.append(open,youtube);
 }else slot.append(open);
 apply(slot);
}
