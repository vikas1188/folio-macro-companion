import {test} from 'node:test';import assert from 'node:assert/strict';import {bayesPosterior} from '../public/math.js';
test('Bayes demo computes normalized posterior, neutral and contrary evidence',()=>{assert.ok(Math.abs(bayesPosterior(.4,2)-4/7)<1e-12);assert.ok(Math.abs(bayesPosterior(.4,1)-.4)<1e-12);assert.ok(bayesPosterior(.4,.5)<.4);assert.equal(bayesPosterior(0,2),0);assert.equal(bayesPosterior(1,2),1);});
test('Bayes demo rejects invalid teaching inputs',()=>{for(const args of [[NaN,2],[1.1,2],[-.1,2],[.5,0],[.5,Infinity]])assert.throws(()=>bayesPosterior(...args));});
