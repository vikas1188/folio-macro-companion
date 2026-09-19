// Dedicated Folio-only API; no general SQL or arbitrary table access.
const response=(data:unknown,status=200)=>Response.json(data,{status});
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return response({error:'Method not allowed'},405);
 try{
 const token=req.headers.get('authorization')?.replace(/^Bearer /,'')||'';
 if(token.length<32)return response({error:'Unauthorized'},401);
 const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))].map(x=>x.toString(16).padStart(2,'0')).join('');
 const root=Deno.env.get('SUPABASE_URL')+'/rest/v1/';const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
 async function db(path:string,method='GET',body?:unknown,prefer='return=representation'){
 const r=await fetch(root+path,{method,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:prefer},body:body===undefined?undefined:JSON.stringify(body)});
 if(!r.ok)throw new Error('Database operation failed');const text=await r.text();return text?JSON.parse(text):null;
 }
 if(!(await db('folio_access?token_hash=eq.'+hash+'&select=token_hash')).length)return response({error:'Unauthorized'},401);
 const body=await req.json();let result;
 switch(body.action){
 case 'getCache':{const rows=await db('folio_cache?key=eq.'+encodeURIComponent(body.key)+'&expires_at=gt.'+encodeURIComponent(new Date().toISOString()));result=rows[0]?.payload??null;break;}
 case 'putCache':{if(typeof body.key!=='string'||JSON.stringify(body.payload).length>1500000) return response({error:'Invalid cache'},400);await db('folio_cache?on_conflict=key','POST',{key:body.key,payload:body.payload,expires_at:new Date(Date.now()+Math.min(Math.max(body.ttl||300000,1000),86400000)).toISOString()},'resolution=merge-duplicates,return=minimal');result={saved:true};break;}
 case 'posts':result=await db('folio_posts?select=payload&published_at=gte.'+encodeURIComponent(new Date(Date.now()-30*86400000).toISOString())+'&source=eq.'+encodeURIComponent(body.source||'x')+'&order=published_at.desc&limit=200');result=result.map((r:any)=>r.payload);break;
 case 'savePosts':{if(!Array.isArray(body.rows)||body.rows.length>200)return response({error:'Invalid batch'},400);const rows=body.rows.map((r:any)=>({id:r.id,source:r.source,canonical_url:r.canonical_url,payload:r.payload,published_at:r.published_at,last_seen:new Date().toISOString()}));if(rows.length)await db('folio_posts?on_conflict=id','POST',rows,'resolution=merge-duplicates,return=minimal');result={saved:rows.length};break;}
 case 'reserve':if(typeof body.key!=='string'||body.key.length>300||!Number.isFinite(Date.parse(body.end)))return response({error:'Invalid window'},400);result=await db('rpc/folio_reserve','POST',{p_key:body.key,p_end:body.end});break;
 case 'finish':{if(!/^[a-f0-9-]{36}$/.test(body.id)||!['running','succeeded','failed','unknown'].includes(body.state))return response({error:'Invalid run'},400);result=await db('folio_runs?id=eq.'+body.id,'PATCH',{state:body.state,...(body.runId?{run_id:body.runId}:{}),...(body.datasetId?{dataset_id:body.datasetId}:{}),...(typeof body.actualUsd==='number'?{actual_usd:body.actualUsd}:{}),...(body.details?{details:body.details}:{})});break;}
 case 'runs':result=await db('folio_runs?order=created_at.desc&limit=100');break;
 default:return response({error:'Unknown action'},400);
 }
 return response(result);
 }catch{return response({error:'Store operation failed'},503);}
});
