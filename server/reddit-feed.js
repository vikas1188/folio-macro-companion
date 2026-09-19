const decode=s=>String(s||'').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,'&');
const text=s=>decode(s).replace(/<[^>]*>/g,' ').replace(/&#(?:32|160);/g,' ').replace(/\s+/g,' ').trim();
export function parseRedditFeed(xml,now=Date.now()){
 const field=(body,name)=>body.match(new RegExp('<'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)</'+name+'>','i'))?.[1]||'';
 return [...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/g)].map(([,b])=>{const title=text(field(b,'title')),id=text(field(b,'id')),rawDate=field(b,'published')||field(b,'updated'),date=Date.parse(rawDate),url=decode(b.match(/<link\b[^>]*href="([^"]+)"[^>]*\/?\s*>/)?.[1]||'');return{id,threadId:id,title,url,publishedAt:Number.isFinite(date)?new Date(date).toISOString():null,excerpt:title+' — '+text(field(b,'content')).slice(0,1200)};}).filter(n=>n.id&&n.title&&/^https:\/\/www\.reddit\.com\/r\//.test(n.url)&&n.publishedAt&&Date.parse(n.publishedAt)<=now&&now-Date.parse(n.publishedAt)<30*86400000).slice(0,25);
}
