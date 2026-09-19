import {peopleXQuery} from '../public/people.js';
// Reserve budget before a supervised Console run; never starts an Actor.
import {store} from '../server/store.js';
const env=process.env,end=new Date().toISOString().slice(0,10);
try{
 const runs=await store(env,'runs');const previous=runs.find(r=>r.state==='succeeded'&&r.details?.accepted>0);
 const start=previous?.window_end.slice(0,10)||new Date(Date.parse(end)-2*86400000).toISOString().slice(0,10);
 const result=await store(env,'reserve',{key:'x-macro-v1:'+end,end:end+'T00:00:00Z'});
 if(!result.allowed){console.log('No run authorized: '+result.reason);process.exit(0);}
 console.log(JSON.stringify({reservationId:result.run.id,url:'https://console.apify.com/actors/nfp1fpt5gUlBwPcor/input',input:{searchTerms:[peopleXQuery+' since:'+start+' until:'+end],sort:'Latest',maxItems:10},options:{maxTotalChargeUsd:.10,timeoutSecs:120,memoryMbytes:256},next:'Start once in Console, then npm run import:x -- RUN_ID '+result.run.id},null,2));
}catch(e){console.error(e.message);process.exitCode=1;}
