// View state belongs to History state, not a changing path or fragment.
// This is a presentation preference, never an authorization boundary.
export const currentRoute=()=>location.hash||history.state?.iyRoute||'';
export function setRoute(route,{replace=false}={}){
 if(typeof route!=='string'||!/^#[a-z0-9/_-]*$/i.test(route))throw new TypeError('Invalid view');
 history[replace?'replaceState':'pushState']({...history.state,iyRoute:route},'',(location.pathname||'/')+(location.search||''));
}
export function normalizeRoute(){if(location.hash)setRoute(/^#[a-z0-9/_-]*$/i.test(location.hash)?location.hash:'#protocols',{replace:true});}
