import {test} from 'node:test';
import assert from 'node:assert/strict';
import {articleExposure} from '../public/mindmap.js';
test('article exposure counts each connected holding once, without claiming dollar effects',()=>{const r=articleExposure({channel:'energy'},[40,20,15,10,10,5]);assert.deepEqual(r,{indices:[0,4],weight:50,known:true});assert.equal(Object.hasOwn(r,'dollars'),false);});
test('unrouted and uncertain articles never acquire inferred exposure',()=>{for(const r of [null,{channel:'uncertain'},{channel:'unknown'}])assert.deepEqual(articleExposure(r,[40,20,15,10,10,5]),{indices:[],weight:0,known:false});});
test('irrelevant articles have zero exposure and zero positions are omitted',()=>{assert.deepEqual(articleExposure({channel:'irrelevant'},[40,20,15,10,10,5]),{indices:[],weight:0,known:true});assert.deepEqual(articleExposure({channel:'energy'},[0,20,15,10,50,5]).indices,[4]);});

import {eventTimeline,factorGroups} from '../public/mindmap.js';
test('upcoming timeline orders verified dates, retains unknown events and excludes past dates',()=>{
 const rows=eventTimeline({fed:{date:'2026-10-28'},oil:{date:'2026-09-23'},jobs:{date:'2026-09-01'}},new Date('2026-09-19T12:00:00Z'));
 assert.deepEqual(rows.map(r=>r.key),['oil','fed','inflation','jobs']);
 assert.equal(rows.find(r=>r.key==='jobs').date,null);
 assert.equal(rows.length,4);
});
test('shared evidence stays in a single source group even when it informs multiple events',()=>{
 const items=[{id:'a',kind:'official',source:'speeches',categories:['fed','jobs']},{id:'b',kind:'publisher',source:'people-news'},{id:'c',kind:'community',source:'x'},{id:'d',kind:'community',source:'reddit'},{id:'e',kind:'community',source:'hn'}];
 const groups=factorGroups({news:items});assert.equal(groups.length,5);
 assert.deepEqual(groups.flatMap(g=>g.items.map(n=>n.id)).sort(),['a','b','c','d','e']);
});

import {eventRange} from '../public/mindmap.js';
test('event ranges remain separate and follow the editable portfolio',()=>{
 const p={value:100000,weights:[40,20,15,10,10,5]};
 assert.deepEqual(eventRange(p,'fed'),[-3100,2000]);
 assert.deepEqual(eventRange(p,'oil'),[-240,240]);
 assert.deepEqual(eventRange({value:100000,weights:[0,0,0,0,0,100]},'fed'),[0,0]);
});
