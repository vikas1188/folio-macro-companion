import {test} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/[action].js';
async function call(path,method='GET',extra={}){let body='';const res={statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v},end(v){body=v}};await handler({url:path,method,headers:{host:'folio.vercel.app',...extra}},res);return{...res,body:JSON.parse(body)};}
test('Vercel adapter returns connection flags without exposing keys',async()=>{const r=await call('/api/status');assert.equal(r.statusCode,200);assert.equal(typeof r.body.jevConfigured,'boolean');assert.equal(Object.keys(r.body).length,3);assert.equal(r.headers['cache-control'],'no-store');});
test('Vercel adapter preserves method and origin checks',async()=>{assert.equal((await call('/api/analyze')).statusCode,405);assert.equal((await call('/api/analyze','POST',{origin:'https://other.test'})).statusCode,403);assert.equal((await call('/api/unknown')).statusCode,404);});
