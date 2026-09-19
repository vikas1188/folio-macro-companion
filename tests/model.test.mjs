import {test} from 'node:test';import assert from 'node:assert/strict';import {calculate,holdings,policyIllustration} from '../public/model.js';const weights=holdings.map(h=>h.weight);
test('portfolio contributions and totals agree with independently calculated stress scenario',()=>{const r=calculate(100000,weights,'higher');assert.equal(r.pnl,-2800);assert.ok(Math.abs(r.percent+2.8)<1e-10);assert.deepEqual(r.contributions,[-1200,-1000,-300,-400,100,0]);});
test('moving ten points from equities to cash reduces modeled loss by 300',()=>{const r=calculate(100000,weights,'higher',10);assert.equal(r.after,-2500);assert.equal(r.difference,300);});
test('cash shift has an opportunity cost in the positive scenario',()=>{const r=calculate(100000,weights,'easing',10);assert.equal(r.pnl,2700);assert.equal(r.after,2400);});
test('cash has zero modeled return',()=>assert.equal(calculate(100000,[0,0,0,0,0,100],'shock').pnl,0));
test('invalid, missing, unbalanced or excessive allocations fail explicitly',()=>{for(const args of [[NaN,weights,'higher'],[100000,[10,10,10,10,10,10],'higher'],[100000,weights,'unknown'],[100000,weights,'higher',41],[100000,[-1,41,20,15,10,15],'higher']])assert.throws(()=>calculate(...args));});

test('event-weighted portfolio illustration uses all three mutually exclusive outcomes',()=>{const r=policyIllustration(100000,weights,{cut:.02,hold:.67,hike:.31});assert.deepEqual(r.outcomes,{cut:2000,hold:-625,hike:-3100});assert.equal(r.weighted,-1339.75);});
test('event illustration rejects invalid probabilities',()=>assert.throws(()=>policyIllustration(100000,weights,{cut:.5,hold:.5,hike:.5})));
