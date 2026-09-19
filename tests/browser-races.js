async page => {
 page.setDefaultTimeout(10000);await page.setViewportSize({width:1440,height:1000});await page.reload();await page.locator('.map-node.article').first().waitFor();
 let held=null;await page.route('**/api/analyze?signal=fed',r=>{held=r;});
 await page.locator('.map-primary-actions [data-map-action=analyze]').click();
 if(!await page.locator('.map-primary-actions [data-map-action=analyze]').isDisabled())throw Error('Duplicate analysis enabled');
 await page.locator('[data-signal=oil]').click();if(!await page.locator('[data-map-outcome=draw]').isVisible())throw Error('Signal switch blocked during analysis');
 await page.locator('#refresh-live').click();await page.locator('.map-node.article').first().waitFor();
 if(!held)throw Error('Request not captured');await held.fulfill({json:{status:'ready',model:'STALE FIXTURE',asOf:new Date().toISOString(),probabilities:{cut:1,hold:0,hike:0},routes:[]}});await page.unroute('**/api/analyze?signal=fed');
 await page.locator('[data-signal=fed]').click();if((await page.locator('.map-status').innerText()).includes('Experimental event-weighted'))throw Error('Stale response leaked through refresh');
 let calls=[];await page.route('**/api/analyze?signal=*',async r=>{calls.push(r.request().url().split('signal=')[1]);await r.fulfill({json:{status:'insufficient_evidence',message:'TEST abstention',routes:[]}});});
 await page.locator('#analyze-all').click();await page.waitForFunction(()=>!document.querySelector('#analyze-all').disabled);
 if(calls.join(',')!=='fed,inflation,jobs,oil')throw Error('Analyze all skipped or duplicated signals: '+calls.join(','));
 await page.unroute('**/api/analyze?signal=*');await page.reload();return 'PASS: duplicate-click guard, signal switching during requests, stale response rejection after refresh, and all four batch calls. Fixtures removed.';
}
