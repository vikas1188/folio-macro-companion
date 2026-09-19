async page => {
 await page.setViewportSize({width:1440,height:1000});await page.reload();
 page.setDefaultTimeout(12000);
 const check=(ok,message)=>{if(!ok)throw Error(message)};
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.locator('.map-node.article').first().waitFor();
 const newsCount=await page.locator('.map-node.article').count();check(newsCount>0,'No articles');
 for(const kind of ['article','signal','holding','portfolio']){
  const n=page.locator('.map-node.'+kind).first();const id=await n.getAttribute('data-map-id');await n.click();check(await page.locator('.map-detail').isVisible(),kind+' detail missing');await page.keyboard.press('Escape');check(await page.locator('.map-detail').isHidden(),'Escape missing');check(await page.evaluate(id=>document.activeElement.dataset.mapId===id,id),'Opener focus not restored');
 }
 const expected={fed:['cut','+$2,000'],inflation:['cooler','+$1,200'],jobs:['lower','+$375'],oil:['draw','+$240']};
 for(const [signal,[outcome,total]] of Object.entries(expected)){
  await page.locator('[data-signal='+signal+']').click();await page.locator('[data-map-outcome='+outcome+']').click();check((await page.locator('.map-node.portfolio').innerText()).includes(total),'Wrong '+signal+' total');
  for(const node of await page.locator('.map-node.holding').all()){await node.click();check(await page.locator('.map-detail > table tbody tr').count()===1,'Holding detail not isolated');await page.locator('[data-map-action=close]').click();}
 }
 await page.locator('[data-signal=fed]').click();
 while(!(await page.locator('[data-map-action=next]').isDisabled()))await page.locator('[data-map-action=next]').click();check(await page.locator('.map-node.article').count()>0,'Last page empty');
 await page.locator('[data-map-action=clear]').click();check(await page.locator('[data-map-action=prev]').isDisabled(),'Reset did not return to first page');
 await page.locator('[data-map-outcome=cut]').click();await page.locator('#value').fill('200000');check((await page.locator('.map-node.portfolio').innerText()).includes('+$4,000'),'Value not reactive');
 await page.locator('[data-holding]').first().fill('90');check((await page.locator('.map-status').innerText()).includes('Allocation needs attention'),'Invalid allocation hidden');check(!(await page.locator('.map-node.portfolio').innerText()).includes('+$4,000'),'Stale amount displayed');await page.locator('#reset').click();
 await page.route('**/api/analyze?signal=*',r=>r.fulfill({status:502,json:{message:'Test upstream unavailable'}}));
 await page.locator('.map-primary-actions [data-map-action=analyze]').click();await page.waitForFunction(()=>document.querySelector('.map-status').textContent.includes('Test upstream unavailable'));check((await page.locator('.map-primary-actions').innerText()).includes('Retry analysis'),'No retry action');await page.unroute('**/api/analyze?signal=*');
 await page.route('**/api/briefing',r=>r.fulfill({status:502,json:{error:'Test source unavailable'}}));await page.locator('#refresh-live').click();await page.waitForFunction(()=>document.querySelector('.map-empty')?.textContent.includes('Test source unavailable'));check(await page.locator('.map-node').count()===0,'Stale nodes after source failure');await page.unroute('**/api/briefing');await page.locator('[data-map-action=refresh]').click();await page.locator('.map-node.article').first().waitFor();
 await page.setViewportSize({width:390,height:844});check(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'Mobile page overflow');await page.locator('.map-scroll').evaluate(el=>el.scrollLeft=650);await page.locator('.map-node.portfolio').click();await page.keyboard.press('Escape');check((await page.locator('.map-scroll').evaluate(el=>el.scrollLeft))>500,'Map scroll lost');
 check(errors.length===0,'Browser errors: '+errors.join('; '));return 'PASS: node details, keyboard focus, all signal calculations, holdings, pagination, reset, invalid inputs, API failure/retry, source failure/recovery and mobile scrolling; zero page errors.';
}
