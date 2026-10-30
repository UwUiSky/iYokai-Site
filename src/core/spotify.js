export function spotifyEmbed(value) {
 try {
  const url=new URL(value);
  if(url.protocol!=='https:'||url.hostname!=='open.spotify.com'||url.username||url.password||url.port)return null;
  const hit=url.pathname.match(/^\/(?:intl-[a-z]{2}\/)?(artist|album|playlist|track)\/([a-zA-Z0-9]{22})\/?$/);
  if(!hit)return null;
  return {url:`https://open.spotify.com/${hit[1]}/${hit[2]}`,embed:`https://open.spotify.com/embed/${hit[1]}/${hit[2]}?theme=0`,kind:hit[1]};
 }catch{return null;}
}
