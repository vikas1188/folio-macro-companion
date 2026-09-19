// Server-only bridge. The deployed database function authenticates this scoped key.
export const storeConfigured=env=>!!(env.FOLIO_STORE_URL&&env.FOLIO_STORE_KEY);
export async function store(env,action,args={}){
 if(!storeConfigured(env))throw new Error('Persistent ingestion store is not configured');
 const r=await fetch(env.FOLIO_STORE_URL,{method:'POST',headers:{Authorization:'Bearer '+env.FOLIO_STORE_KEY,'Content-Type':'application/json'},body:JSON.stringify({action,...args}),signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw new Error('Persistent store unavailable ('+r.status+')');return r.json();
}
export function canonicalURL(value){const u=new URL(value);u.hash='';for(const key of [...u.searchParams.keys()])if(/^utm_|^(fbclid|gclid)$/i.test(key))u.searchParams.delete(key);return u.toString();}
export function postRows(posts){return [...new Map(posts.map(n=>{const url=canonicalURL(n.url);const id=['x','reddit','hn'].includes(n.source)?n.id:n.source+':'+url;return [id,{id,source:n.source,canonical_url:url,payload:{...n,id,url},published_at:n.publishedAt,last_seen:new Date().toISOString()}];})).values()];}
