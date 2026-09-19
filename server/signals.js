import {signals,belongsToSignal} from '../public/signals.js';
const oilURL='https://www.eia.gov/petroleum/supply/weekly/';
export function parseOil(csv,html,now=Date.now()){
 const rows=csv.trim().split(/\r?\n/).map(r=>[...r.matchAll(/"([^"]*)"/g)].map(m=>m[1]));
 const row=rows.find(r=>r[0]==='Commercial (Excluding SPR)');
 const parts=rows[0]?.[1]?.split('/').map(Number);if(!row||parts?.length!==3)throw new Error('Inventory table format unavailable');
 const date=new Date(Date.UTC(2000+parts[2],parts[0]-1,parts[1])).toISOString();const value=Number(row[1]),previous=Number(row[2]);
 if(!Number.isFinite(value)||value<=0||!Number.isFinite(previous)||previous<=0||Date.parse(date)>now||now-Date.parse(date)>14*86400000)throw new Error('Inventory data is stale or invalid');
 const text=html.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ');
 const released=text.match(/(?<!Next )Release Date:\s*([A-Za-z]+\.?\s+\d{1,2},\s*\d{4})/i);const published=released?Date.parse(released[1]+' 00:00:00 GMT'):NaN;if(!Number.isFinite(published)||published>now||now-published>14*86400000)throw new Error('Publication date unavailable');
 const next=text.match(/Next Release Date:\s*([A-Za-z]+\.?\s+\d{1,2},\s*\d{4})/i);const nextDate=next?Date.parse(next[1]+' 12:00:00 GMT'):NaN;
 return {date,value,previous,change:value-previous,publishedAt:new Date(published).toISOString(),nextDate:Number.isFinite(nextDate)&&nextDate>now?new Date(nextDate).toISOString().slice(0,10):null,url:oilURL};
}
export function buildEvents(data){
 const events={fed:data.event?{...data.event,baseline:'Current target range in the supplied Fed statement'}:null};
 const cpi=data.macro.find(m=>m.id==='CPIAUCSL');const unemployment=data.macro.find(m=>m.id==='UNRATE');
 const current=m=>m&&Date.now()-Date.parse(m.date)>=0&&Date.now()-Date.parse(m.date)<75*86400000;
 if(current(cpi)&&Number.isFinite(cpi.previous)&&cpi.previous>0){const value=Math.round((cpi.value/cpi.previous-1)*1000)/10;events.inflation={date:null,label:'Next monthly CPI release',url:'https://www.bls.gov/schedule/news_release/cpi.htm',baseline:`${value.toFixed(1)}% monthly CPI change · observation ${cpi.date}`,value,observationDate:cpi.date};}
 if(current(unemployment))events.jobs={date:null,label:'Next Employment Situation release',url:'https://www.bls.gov/schedule/news_release/empsit.htm',baseline:`${unemployment.value.toFixed(1)}% unemployment · observation ${unemployment.date}`,value:unemployment.value,observationDate:unemployment.date};
 if(data.oil)events.oil={date:data.oil.nextDate,label:'Next weekly petroleum report',url:data.oil.url,baseline:`${data.oil.value.toFixed(3)} million barrels · week ending ${data.oil.date.slice(0,10)} · latest change ${data.oil.change.toFixed(3)} million`,value:data.oil.value,observationDate:data.oil.date};
 return Object.fromEntries(Object.keys(signals).map(k=>[k,events[k]||null]));
}
export function selectEvidence(data,signal,now=Date.now()){
 const config=signals[signal];const pool=data.news.filter(n=>belongsToSignal(n,signal)&&now-Date.parse(n.publishedAt)>=0&&now-Date.parse(n.publishedAt)<30*86400000).sort((a,b)=>Number(b.categories?.includes(signal)||false)-Number(a.categories?.includes(signal)||false)||(b.coverage==='original policy passage')-(a.coverage==='original policy passage'));const official=pool.filter(n=>!n.kind||n.kind==='official').slice(0,6),publishers=pool.filter(n=>n.kind==='publisher').slice(0,4),community=pool.filter(n=>n.kind==='community').filter((n,i,a)=>!n.threadId||a.findIndex(x=>x.source===n.source&&x.threadId===n.threadId)===i);const diverse=[];for(const source of [...new Set(community.map(n=>n.source))]){const first=community.find(n=>n.source===source);if(first)diverse.push(first);}for(const item of community)if(!diverse.includes(item))diverse.push(item);return [...official,...publishers,...diverse.slice(0,4)];
}
