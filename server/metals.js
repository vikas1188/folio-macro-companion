const endpoint='https://api.hyperliquid.xyz/info';
const instruments=[{coin:'xyz:GOLD',name:'Gold'},{coin:'xyz:SILVER',name:'Silver'}];
const positive=v=>typeof v==='string'&&v.trim()!==''&&Number.isFinite(Number(v))&&Number(v)>0?Number(v):null;
export function parseMetalBook(book,coin,now=Date.now()){
 if(book?.coin!==coin||!Number.isFinite(book.time)||book.time>now+5000||now-book.time>60000)throw new Error('Missing, stale or mismatched exchange timestamp');
 const bid=positive(book.levels?.[0]?.[0]?.px),ask=positive(book.levels?.[1]?.[0]?.px);
 if(bid===null||ask===null||bid>ask)throw new Error('Invalid or crossed order book');
 return{coin,bid,ask,price:(bid+ask)/2,priceType:'Bid/ask midpoint',unit:'USD per troy ounce reference',instrumentType:'HIP-3 perpetual',asOf:new Date(book.time).toISOString()};
}
async function info(body){const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error('Hyperliquid returned '+r.status);return r.json();}
let cache=null,pending=null;
export async function metalQuotes(){
 if(cache&&Date.now()-Date.parse(cache.fetchedAt)<10000)return cache;
 if(pending)return pending;
 pending=(async()=>{
 const meta=await info({type:'meta',dex:'xyz'});
 if(!Array.isArray(meta?.universe))throw new Error('Hyperliquid metadata unavailable');
 const quotes=await Promise.all(instruments.map(async item=>{try{const asset=meta.universe.find(a=>a.name===item.coin);if(!asset||asset.isDelisted)throw new Error('Instrument unavailable');const book=await info({type:'l2Book',coin:item.coin});return{...item,...parseMetalBook(book,item.coin),status:'available'};}catch(e){return{...item,status:'unavailable',message:e.message};}}));
 const result={source:'Hyperliquid · XYZ',fetchedAt:new Date().toISOString(),refreshSeconds:30,quotes};
 if(quotes.some(q=>q.status==='available'))cache=result;return result;
 })();try{return await pending;}finally{pending=null;}
}
