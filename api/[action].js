import {handleAPI} from '../server/api.js';

// Vercel's Node request/response adapter. Portfolio values remain client-side.
export default async function handler(req,res){
  try{
    const protocol=req.headers['x-forwarded-proto']==='http'?'http':'https';
    const host=req.headers.host;
    if(!host||/[\s/\\]/.test(host)){res.statusCode=400;res.end('Invalid host');return;}
    const headers=new Headers();
    for(const [key,value] of Object.entries(req.headers)){
      if(value!==undefined)headers.set(key,Array.isArray(value)?value.join(','):value);
    }
    const request=new Request(new URL(req.url,`${protocol}://${host}`),{method:req.method,headers});
    const response=await handleAPI(request,process.env);
    res.statusCode=response.status;
    for(const [key,value] of response.headers)res.setHeader(key,value);
    res.end(await response.text());
  }catch{
    res.statusCode=500;res.setHeader('Content-Type','application/json');
    res.end(JSON.stringify({error:'Unable to process this request. Please retry.'}));
  }
}
