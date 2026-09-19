async page=>{
 page.setDefaultTimeout(12000);await page.setViewportSize({width:1440,height:1000});await page.reload();await page.locator('.asset-prob-card').first().waitFor();
 if(await page.locator('.asset-prob-card').count()!==5)throw Error('Expected five ETF baselines');
 for(const ticker of ['SPY','TLT','GLD','SLV','USO']){await page.locator('[data-asset='+ticker+']').click();const text=await page.locator('.probability-method').innerText();if(!text.includes('95% sampling range')||!text.includes('Not conditioned on chatter'))throw Error('Missing probability method');await page.keyboard.press('Escape');if(!await page.evaluate(t=>document.activeElement.dataset.asset===t,ticker))throw Error('Asset focus not restored');}
 await page.locator('[data-signal=inflation]').click();await page.locator('#map-source').selectOption('hn');
 const articles=await page.locator('.map-node.article').allTextContents();if(!articles.length||articles.some(t=>!t.includes('Hacker News')))throw Error('Source filter failed');
 await page.locator('.map-node.article').first().click();if(!(await page.locator('.map-detail').innerText()).includes('Unverified community discussion'))throw Error('Missing community label');
 await page.locator('[data-map-action=close]').click();await page.locator('#map-source').selectOption('all');await page.locator('[data-map-action=clear]').click();if(await page.locator('#map-source').inputValue()!=='all')throw Error('Reset filter failed');
 await page.setViewportSize({width:390,height:844});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
 await page.locator('[data-asset=SPY]').click();if(!await page.locator('.probability-method').isVisible())throw Error('Mobile probability details missing');await page.keyboard.press('Escape');return 'PASS: five probability detail views, method/uncertainty labels, keyboard focus, HN filter, community labels, reset and mobile layout.';
}
