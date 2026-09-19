// Experimental one-release forecasts. Latest-vintage observations are not a
// point-in-time backtest; publish that limitation beside every estimate.
const contracts={inflation:{series:'CPIAUCSL',keys:['cooler','same','hotter']},jobs:{series:'UNRATE',keys:['lower','same','higher']}};
const bucket=(a,b)=>a<b-1e-8?0:a>b+1e-8?2:1;
function distribution(sequence){
 const counts=[1,1,1],conditional=[0,0,0],state=sequence.at(-1);
 sequence.filter(k=>k!==null).forEach(k=>counts[k]++);
 for(let i=1;i<sequence.length;i++)if(sequence[i-1]===state&&sequence[i]!==null)conditional[sequence[i]]++;
 const base=counts.map(n=>n/(sequence.filter(k=>k!==null).length+3)),n=conditional.reduce((a,b)=>a+b,0);
 return {p:n>=12?conditional.map((v,i)=>(v+12*base[i])/(n+12)):base,base,matched:n,conditioned:n>=12};
}
export function forecastEvent(data,key,now=Date.now()){
 const c=contracts[key],event=data.events?.[key];if(!c||!event)return null;
 const series=data.macro?.find(m=>m.id===c.series);
 const rows=[...new Map((series?.history||[]).filter(r=>Number.isFinite(r.value)&&Number.isFinite(Date.parse(r.date))&&Date.parse(r.date)<=now).map(r=>[r.date,r])).values()].sort((a,b)=>a.date.localeCompare(b.date)).slice(-160);
 if(rows.length<80||now-Date.parse(rows.at(-1).date)>75*86400000||rows.at(-1).date!==series.date)return null;
 const adjacent=(a,b)=>{a=new Date(a.date);b=new Date(b.date);return b.getUTCFullYear()*12+b.getUTCMonth()-a.getUTCFullYear()*12-a.getUTCMonth()===1;};
 if(key==='inflation'&&rows.some(r=>r.value<=0))return null;
 const values=key==='inflation'?rows.slice(1).map((r,i)=>adjacent(rows[i],r)?Math.round((r.value/rows[i].value-1)*1000)/10:null):rows.map(r=>Math.round(r.value*10)/10);
 if(values.at(-1)===null||Math.abs(values.at(-1)-event.value)>.000001)return null;
 const sequence=values.slice(1).map((v,i)=>v===null||values[i]===null||(key==='jobs'&&!adjacent(rows[i],rows[i+1]))?null:bucket(v,values[i]));
 if(sequence.at(-1)===null||sequence.filter(k=>k!==null).length<60)return null;
 const fit=distribution(sequence),split=Math.max(48,sequence.length-24);let score=0,reference=0,windows=0;
 for(let i=split;i<sequence.length;i++){if(sequence[i]===null||sequence[i-1]===null)continue;windows++;const pred=distribution(sequence.slice(0,i));for(let k=0;k<3;k++){score+=(pred.p[k]-(sequence[i]===k?1:0))**2;reference+=(pred.base[k]-(sequence[i]===k?1:0))**2;}}
 const holdout={windows,brier:score/windows,referenceBrier:reference/windows};
 return {status:'ready',signal:key,model:'Folio statistical baseline v1',forecastKind:'statistical_baseline',probabilities:Object.fromEntries(c.keys.map((k,i)=>[k,fit.p[i]])),asOf:data.fetchedAt||new Date(now).toISOString(),event,routes:[],evidenceIds:[],historyStart:rows[0].date,observationDate:rows.at(-1).date,sampleSize:sequence.filter(k=>k!==null).length,matchedTransitions:fit.matched,conditioned:fit.conditioned,holdout,source:series.url,method:'Experimental next-release baseline from FRED monthly observations. '+(fit.conditioned?'Conditions on the latest direction, shrunk toward overall frequencies with 12 pseudo-observations.':'Uses smoothed overall direction frequencies; too few matching transitions for conditioning.')+' Missing-month transitions are excluded, never interpolated. Latest revised data, not first-release vintages: retrospective scores are not real-time validation. Reddit and Jev do not change these baseline probabilities. Impact uses fixed scenario assumptions.'};
}
export function withBaseline(result,baseline){
 if(!baseline||result?.status==='ready')return result;
 return {...baseline,routes:result?.routes||[],evidenceIds:result?.evidenceIds||[],newsAssessment:{status:result?.status||'not_analyzed',message:result?.message||'News assessment not run',evidenceAdequacy:result?.evidenceAdequacy??null},message:'Statistical baseline available; news has not established a supported adjustment.'};
}
