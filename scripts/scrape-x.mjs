import {peopleXQuery} from '../public/people.js';
// Paid collection is operator-only. Web requests never import this module.
import {store,postRows} from '../server/store.js';
import {normalizePosts} from '../server/chatter.js';
const env=process.env,actor='apidojo~twitter-scraper-lite';
const end=new Date().toISOString().slice(0,10),windowKey='x-macro-v1:'+end;
const maxTotalChargeUsd=.10;
async function call(path,options={}){const r=await fetch('https://api.apify.com/v2/'+path,{...options,headers:{Authorization:'Bearer '+env.APIFY_TOKEN,'Content-Type':'application/json'},signal:AbortSignal.timeout(30000)});if(!r.ok)throw new Error('Apify returned '+r.status);return r.json();}
let reservation;
try{
 if(process.argv.includes('--dry-run')){console.log(JSON.stringify({actor,maxItems:30,maxTotalChargeUsd,monthlyReservedCeilingUsd:.50,cooldownHours:24,windowKey,automaticSchedule:false},null,2));process.exit(0);}
 if(!env.APIFY_TOKEN)throw new Error('APIFY_TOKEN required. No run started.');
 const account=(await call('users/me')).data;if(account?.isPaying!==true)throw new Error('This actor blocks API scraping on the Free plan. Use the capped Console input and import its completed run; no paid run started.');
 const runs=await store(env,'runs');
 const prior=runs.find(r=>r.window_key===windowKey);
 if(prior?.state==='succeeded'){console.log('Already collected this window; reused stored posts. No new Apify run.');process.exit(0);}
 if(prior&&(!prior.run_id||prior.state==='failed'))throw new Error('This window already has a failed or uncertain attempt. Inspect the ledger; no automatic retry.');
 const previous=runs.find(r=>r.state==='succeeded');
 const start=previous?.window_end?.slice(0,10)||new Date(Date.parse(end)-2*86400000).toISOString().slice(0,10);
 const input={searchTerms:[peopleXQuery],sort:'Latest',maxItems:30,start,end};
 if(prior){reservation=prior;}else{
 const decision=await store(env,'reserve',{key:windowKey,end:end+'T00:00:00Z'});
 if(!decision.allowed){console.log('Collection skipped: '+decision.reason+'. No Apify run started.');process.exit(0);}
 reservation=decision.run;
 }
 let run;
 if(reservation.run_id)run=(await call('actor-runs/'+reservation.run_id)).data;
 else{
 // Never retry this POST: an uncertain network result retains its reservation.
 run=(await call('acts/'+actor+'/runs?timeout=120&memory=256&maxTotalChargeUsd='+maxTotalChargeUsd,{method:'POST',body:JSON.stringify(input)})).data;
 await store(env,'finish',{id:reservation.id,state:'running',runId:run.id});
 console.log('Started '+run.id+'; 30 items, $0.10 actor cap, 120-second timeout.');
 }
 const deadline=Date.now()+150000;
 while(!['SUCCEEDED','FAILED','TIMED-OUT','ABORTED'].includes(run.status)&&Date.now()<deadline){await new Promise(r=>setTimeout(r,5000));run=(await call('actor-runs/'+run.id)).data;}
 if(run.status!=='SUCCEEDED'){
 await store(env,'finish',{id:reservation.id,state:['FAILED','TIMED-OUT','ABORTED'].includes(run.status)?'failed':'running',runId:run.id,actualUsd:run.usageTotalUsd,details:{status:run.status}});
 throw new Error('Run '+run.id+' is '+run.status+'. No new run will be started on retry.');
 }
 const id=run.defaultDatasetId;if(!/^[a-zA-Z0-9]+$/.test(id))throw new Error('Invalid dataset ID');
 const raw=await call('datasets/'+id+'/items?clean=true&limit=50');
 const posts=normalizePosts(raw.map(d=>({id:d.id,title:d.text,url:d.url||'https://x.com/i/web/status/'+d.id,publishedAt:d.createdAt,excerpt:d.text,authorHandle:d.author?.userName||null,isRetweet:!!d.isRetweet})), 'x');
 if(raw.length&&!posts.length){await store(env,'finish',{id:reservation.id,state:'failed',runId:run.id,datasetId:id,actualUsd:run.usageTotalUsd,details:{received:raw.length,accepted:0,failure:'No usable posts; possible demo-only dataset'}});throw new Error('Dataset contained no usable posts; run recorded as failed.');}
 await store(env,'savePosts',{rows:postRows(posts)});
 await store(env,'finish',{id:reservation.id,state:'succeeded',runId:run.id,datasetId:id,actualUsd:run.usageTotalUsd,details:{received:raw.length,accepted:posts.length,input,usage:run.usageTotalUsd??null}});
 console.log(JSON.stringify({status:'succeeded',runId:run.id,received:raw.length,stored:posts.length,reportedUsageUsd:run.usageTotalUsd??null,actorCapUsd:.10,monthlyReservedCeilingUsd:.50}));
}catch(e){
 // A known running run remains resumable. An unknown launch blocks future spend.
 if(reservation&&!reservation.run_id){const runs=await store(env,'runs').catch(()=>[]);const current=runs.find(r=>r.id===reservation.id);if(current?.state==='reserved')await store(env,'finish',{id:reservation.id,state:'unknown'}).catch(()=>{});}
 console.error(e.message);process.exitCode=1;
}
