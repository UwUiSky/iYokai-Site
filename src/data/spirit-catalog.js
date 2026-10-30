import bios from './spirit-bios.it.json' with { type:'json' };

// Canonical identities. A musical name is an instance, never a separate feature.
export const MUSIC_NAMES=['Shirayuki','Aoi','Kuro','Hana','Rei'];
export const SPIRITS=[
 {id:'kitsune',name:'Kitsune',type:'feature',lore:'kitsune',scope:'core'},
 {id:'tengu',name:'Tengu',type:'feature',lore:'tengu',scope:'safety'},
 {id:'nekomata',name:'Nekomata',type:'feature',lore:'nekomata',scope:'community'},
 {id:'bakeneko',name:'Bakeneko',type:'feature',lore:'bakeneko',scope:'creative'},
 {id:'oni',name:'Oni',type:'feature',lore:'oni',scope:'safety'},
 {id:'rokurokubi',name:'Rokurokubi',type:'feature',lore:'rokurokubi',scope:'personal'},
 {id:'main',name:'iYokaiミ',type:'bot',lore:'kitsune',scope:'core',identity:'core'},
 {id:'music',name:'Le Cinque Sorelle Musicali',type:'collection',lore:'music',scope:'music'},
 ...MUSIC_NAMES.map((name,i)=>({id:name.toLowerCase(),name,type:'bot',lore:name.toLowerCase(),scope:'music',identity:`music-${i+1}`,musicNumber:i+1})),
 {id:'mod',name:'iYokai Mod',type:'bot',lore:'mod',identity:'mod'},
 {id:'nsfw',name:'iYokai NSFW',type:'bot',lore:'nsfw',age:true,identity:'nsfw'},
 {id:'app',name:'iYokai App',type:'app',lore:'app',scope:'personal'},
 {id:'house',name:'La Casa degli Spiriti',type:'home',lore:'house'},
];
export function spiritById(id){return SPIRITS.find(s=>s.id===id)||null;}
export function spiritBio(id){return bios[id]||null;}
const CATEGORIES={
 safety:['Antinuke','Antiraid','AutoMod','Sicurezza','Log','Moderazione','Ban (modban)'],
 community:['Livelli','Clan','Economia'],
 creative:['Divertimento','Ai','Utility'],
 personal:["iYokai App (app separata, installata sull'utente)"],
 music:['Musica'],
 moderation:['Moderazione','Ban (modban)'],
 tickets:['Ticket'],
 levels:['Livelli'],
 automation:['Gestione','Moduli'],
};
export function scopedCommands(commands,scope='*'){
 if(scope==='*')return commands;
 if(scope==='core')return commands.filter(c=>!c.category.startsWith('iYokai App (')&&!c.category.startsWith('iYokai NSFW ('));
 const allowed=CATEGORIES[scope];
 return allowed?commands.filter(c=>allowed.includes(c.category)):[];
}
