// Read an already budgeted Console run. This command never launches an Actor.
import {store,postRows} from '../server/store.js';
import {normalizePosts} from '../server/chatter.js';
const env=process.env,id=process.argv[2];
try{
 if(!/^[A-Za-z0-9]+$/.test(id||''))throw new Error('Usage: npm run import:x -- APIFY_RUN_ID');
 const record=(await store(env,'runs')).find(r=>r.run_id===id||(r.id===process.argv[3]&&r.state==='reserved'&&!r.run_id));
 if(!record)throw new Error('Run must first be recorded in the Folio spending ledger; import refused.');
 const call=async path=>{const r=await fetch('https://api.apify.com/v2/'+path,{headers:{Authorization:'Bearer '+env.APIFY_TOKEN},signal:AbortSignal.timeout(20000)});if(!r.ok)throw new Error('Apify read failed: '+r.status);return r.json();};
 const run=(await call('actor-runs/'+id)).data;
 if(run.actId!=='nfp1fpt5gUlBwPcor'||run.options?.maxTotalChargeUsd>0.10||!run.options?.maxTotalChargeUsd||Date.parse(run.startedAt)<Date.parse(record.created_at))throw new Error('Run does not match the reserved actor, time or cost cap.');
 if(run.status!=='SUCCEEDED')throw new Error('Run is not complete; no new run started.');
 const rows=await call('datasets/'+run.defaultDatasetId+'/items?clean=true&limit=50');
 const posts=normalizePosts(rows.map(d=>({id:d.id,title:d.text,url:d.url||'https://x.com/i/web/status/'+d.id,publishedAt:d.createdAt,excerpt:d.text,authorHandle:d.author?.userName||null,isRetweet:!!d.isRetweet,threadId:d.conversationId})), 'x');
 if(!posts.length)throw new Error('No usable posts found. Demo placeholders are never imported.');
 const before=await store(env,'posts',{source:'x'});
 await store(env,'savePosts',{rows:postRows(posts)});
 await store(env,'finish',{id:record.id,state:'succeeded',runId:id,datasetId:run.defaultDatasetId,actualUsd:run.usageTotalUsd,details:{received:rows.length,accepted:posts.length,origin:'supervised_console',importedAt:new Date().toISOString()}});
 const after=await store(env,'posts',{source:'x'});
 console.log(JSON.stringify({received:rows.length,accepted:posts.length,newUniquePosts:after.length-before.length,totalStoredX:after.length,reportedUsageUsd:run.usageTotalUsd,newScrapes:0}));
}catch(e){console.error(e.message);process.exitCode=1;}
