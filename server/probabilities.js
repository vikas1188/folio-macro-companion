// Descriptive historical base rates, not causal or chatter-conditioned forecasts.
export function wilson(successes,n){const z=1.96,p=successes/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return [Math.max(0,c-h),Math.min(1,c+h)];}
export function assetProbabilities(history,now=Date.now()){
 const samples=history.filter(s=>Number.isFinite(s.time)&&s.time*1000<Math.floor(now/86400000)*86400000&&Number.isFinite(s.price)&&s.price>0).sort((a,b)=>a.time-b.time).filter((s,i,a)=>!i||s.time!==a[i-1].time);
 if(samples.length<505||now-samples.at(-1).time*1000>7*86400000)return{status:'unavailable',reason:'At least 100 complete five-session blocks and a price within seven days are required.'};
 const returns=[];for(let i=samples.length-1;i>=5;i-=5){if(samples[i].time-samples[i-5].time>12*86400)continue;returns.unshift(samples[i].price/samples[i-5].price-1);}
 if(returns.length<100)return{status:'unavailable',reason:'Too few complete return windows.'};
 const bucket=r=>r>.01+1e-12?'up':r<-.01-1e-12?'down':'flat';const counts={down:0,flat:0,up:0};for(const r of returns)counts[bucket(r)]++;
 const n=returns.length,probabilities=Object.fromEntries(Object.entries(counts).map(([k,c])=>[k,c/n]));
 // Sequential holdout: each prediction sees only earlier five-session windows.
 const split=Math.floor(n*.8),train={down:0,flat:0,up:0};returns.slice(0,split).forEach(r=>train[bucket(r)]++);let brier=0;
 for(let i=split;i<n;i++){const actual=bucket(returns[i]);for(const k of Object.keys(train))brier+=(train[k]/i-(k===actual?1:0))**2;train[actual]++;}
 return{status:'ready',method:'historical_base_rate',horizonSessions:5,thresholdPercent:1,sampleSize:n,counts,probabilities,intervals:Object.fromEntries(Object.entries(counts).map(([k,c])=>[k,wilson(c,n)])),asOf:new Date(samples.at(-1).time*1000).toISOString(),historyStart:new Date(samples[0].time*1000).toISOString(),holdout:{windows:n-split,brier:brier/(n-split)},limitations:'Historical frequency, not a calibrated forward forecast. Not conditioned on chatter or the selected macro event. Wilson ranges describe sampling uncertainty and assume independent windows; regimes and serial dependence can invalidate that assumption.'};
}
