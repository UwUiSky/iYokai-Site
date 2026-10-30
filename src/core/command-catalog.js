// Accent-insensitive search; slash names and command signatures stay unchanged.
export const searchable = value => String(value ?? '').normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase('en').replace(/\s+/g,' ').trim();
export function indexCommands(catalog,{translations={},language='it',translationLanguage='en'}={}){
 if(!Array.isArray(catalog?.categories))throw new TypeError('Invalid command catalogue');
 return catalog.categories.flatMap(group=>{
  if(typeof group.name!=='string'||!Array.isArray(group.commands))throw new TypeError('Invalid command category');
  return group.commands.map(row=>{
   if(!Array.isArray(row)||typeof row[0]!=='string'||typeof row[1]!=='string')throw new TypeError('Invalid command');
   const [name,original]=row;
   const translated=language!=='it'&&typeof translations[name]==='string'&&translations[name].trim()?translations[name]:null;
   const description=translated||original;
   const kind=row[2]?.kind==='context'?'context':'slash';
   return {name,description,kind,language:translated?translationLanguage:'it',category:group.name,search:searchable(`${name} ${original} ${translations[name]||''} ${group.name}`)};
  });
 });
}
export function filterCommands(commands,{category='*',query=''}={}){
 const words=searchable(query).split(' ').filter(Boolean);
 return commands.filter(c=>(category==='*'||c.category===category)&&words.every(word=>c.search.includes(word)));
}
