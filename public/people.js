// Roles checked against linked primary sources on 2026-09-19; review after 30 days.
const fed='https://www.federalreserve.gov/aboutthefed/bios/board/';
const monetary={signals:['fed','inflation','jobs'],assets:['SPY','TLT','GLD','SLV'],why:'FOMC policy participation and public guidance can change rate expectations, discount rates and real yields.',source:fed,officialHosts:['www.federalreserve.gov'],group:'Monetary policy'};
export const people=[
{id:'warsh',name:'Kevin Warsh',role:'Federal Reserve chair',aliases:['Kevin Warsh'],speechName:'Warsh',...monetary},
{id:'jefferson',name:'Philip Jefferson',role:'Fed vice chair',aliases:['Philip Jefferson','Philip N. Jefferson'],speechName:'Jefferson',...monetary},
{id:'bowman',name:'Michelle Bowman',role:'Fed vice chair for supervision',aliases:['Michelle Bowman','Michelle W. Bowman'],speechName:'Bowman',...monetary},
{id:'waller',name:'Christopher Waller',role:'Federal Reserve governor',aliases:['Christopher Waller','Christopher J. Waller'],speechName:'Waller',...monetary},
{id:'powell',name:'Jerome Powell',role:'Federal Reserve governor',aliases:['Jerome Powell','Jerome H. Powell'],speechName:'Powell',...monetary},
{id:'cook',name:'Lisa Cook',role:'Federal Reserve governor',aliases:['Lisa Cook','Lisa D. Cook'],speechName:'Cook',...monetary},
{id:'barr',name:'Michael Barr',role:'Federal Reserve governor',aliases:['Michael Barr','Michael S. Barr'],speechName:'Barr',...monetary},
{id:'bessent',name:'Scott Bessent',role:'US Treasury secretary',aliases:['Scott Bessent'],signals:['fed','inflation','oil'],assets:['SPY','TLT','GLD','SLV','USO'],why:'Debt issuance, fiscal policy and sanctions can affect yields, the dollar and energy supply. Treasury does not set the Fed policy rate.',group:'Fiscal policy',source:'https://home.treasury.gov/about/general-information/officials/scott-bessent',officialHosts:['home.treasury.gov'],handle:'SecScottBessent',accountKind:'personal official',accountSource:'https://home.treasury.gov/'},
{id:'trump',name:'Donald Trump',role:'US president',aliases:['Donald Trump','Donald J. Trump','President Trump'],signals:['fed','inflation','jobs','oil'],assets:['SPY','TLT','GLD','SLV','USO'],why:'Tariffs, fiscal proposals, sanctions and energy decisions can shift prices and growth. Presidential comments do not constitute an FOMC decision.',group:'Executive policy',source:'https://www.whitehouse.gov/administration/donald-j-trump/',officialHosts:['www.whitehouse.gov']},
{id:'alghais',name:'Haitham Al Ghais',role:'OPEC secretary general',aliases:['Haitham Al Ghais','Haitham al-Ghais'],signals:['oil','inflation'],assets:['USO','SPY','GLD','SLV'],why:'Communicates OPEC’s oil-market outlook. Production decisions belong to member countries collectively, not the secretary general alone.',group:'Energy policy',source:'https://opec.org/assets/assetdb/opec-secretary-general-biography.pdf',officialHosts:['www.opec.org','opec.org'],handle:'OPECSecretariat',accountKind:'institutional',accountSource:'https://www.opec.org/assets/assetdb/bulletin-2018-09.pdf'}
].map(p=>({...p,verifiedAt:'2026-09-19',reviewAfter:'2026-10-19'}));
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
export function matchPeople(item){
 const text=item.title+' '+(item.excerpt||'');let host='';try{host=new URL(item.url).hostname;}catch{}
 return people.flatMap(p=>{
 const author=item.source==='x'&&p.handle&&item.authorHandle?.toLowerCase()===p.handle.toLowerCase()&&!item.isRetweet;
 const officialSpeech=item.source==='speeches'&&host==='www.federalreserve.gov'&&new RegExp('^'+p.speechName+'(?:,|:)','i').test(item.title);
 const named=p.aliases.some(a=>new RegExp('\\b'+esc(a)+'\\b','i').test(text));
 if(!author&&!officialSpeech&&!named)return [];
 const relation=officialSpeech?'official_statement':author?(p.accountKind==='institutional'?'institutional_post':'own_post'):'reported_mention';
 return [{personId:p.id,relation,label:{official_statement:'Original official speech',own_post:'Matched official account',institutional_post:'Institutional account · not a personal opinion',reported_mention:'Mention or reported coverage · not verified as their opinion'}[relation]}];
 });
}
export const peopleSearchQueries=[ '"Kevin Warsh" OR "Michelle Bowman" OR "Christopher Waller" OR "Philip Jefferson" OR "Jerome Powell" OR "Lisa Cook" OR "Michael Barr"', '"Scott Bessent" OR "President Trump"', '"Haitham Al Ghais"'];
export const peopleXQuery='('+people.flatMap(p=>[...(p.handle?['from:'+p.handle]:[]),'"'+p.name+'"']).join(' OR ')+') (inflation OR rates OR oil OR tariffs OR jobs OR economy OR monetary) lang:en -filter:retweets';
export function personExposure(person,weights){const tickers=['SPY','TLT','GLD','SLV','USO','CASH'];return tickers.reduce((sum,t,i)=>sum+(person.assets.includes(t)?Number(weights[i]||0):0),0);}

export function actionableStatements(news,signal){
 return news.filter(n=>n.people?.length&&(n.categories?.includes(signal)||(n.people.some(p=>p.relation==='official_statement')&&/economic outlook|monetary policy|interest rate|inflation/i.test(n.title))))
 .sort((a,b)=>Number(b.people.some(p=>p.relation==='official_statement'||p.relation==='own_post'))-Number(a.people.some(p=>p.relation==='official_statement'||p.relation==='own_post'))||Date.parse(b.publishedAt)-Date.parse(a.publishedAt)).slice(0,3);
}
