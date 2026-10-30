import { STILL_ART } from './artworks.js';
export const PROTOCOLS = [
 { id:'discord', art:STILL_ART.discord, number:'01', name:'Discord Core', key:'discord' },
 { id:'social', art:STILL_ART.social, number:'02', key:'social' },
 { id:'music', art:STILL_ART.protocolMusic, number:'03', key:'music' },
 { id:'live', art:STILL_ART.live, number:'04', key:'live' },
 { id:'projects', art:STILL_ART.projects, number:'05', key:'projects' },
 { id:'contact', art:STILL_ART.contact, number:'06', key:'contact' },
];
export const protocolFromHash = hash => PROTOCOLS.find(p=>hash===`#protocol/${p.id}` || hash.startsWith(`#protocol/${p.id}/`));
// Progress counts completed prerequisites. It never advances on a timer.
export async function prepareResources(tasks,onProgress=()=>{}) {
 let done=0;onProgress(0);
 if(!tasks.length){onProgress(1);return;}
 await Promise.all(tasks.map(async task=>{await task();onProgress(++done/tasks.length);}));
}
