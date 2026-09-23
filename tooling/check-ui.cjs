const { chromium } = require(process.argv[2] || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
for (const file of ['index.html','painel-gabriele-2026.html']) {
    const html=fs.readFileSync(file,'utf8');
    for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        if(match[1].includes('ld+json') || !match[2].trim()) continue;
        const result=spawnSync(process.execPath,['--input-type=module','--check'],{input:match[2],encoding:'utf8'});
        assert.equal(result.status,0,file+': '+result.stderr);
    }
}
(async()=>{
    const browser=await chromium.launch({headless:true,channel:'msedge'});
    try {
        const context=await browser.newContext();
        const page=await context.newPage();
        const errors=[];page.on('pageerror',e=>errors.push(e.message));
        const out=path.join(os.tmpdir(),'gabriele-ui-review');fs.mkdirSync(out,{recursive:true});
        for(const width of [1440,990,390,320]) {
            await page.setViewportSize({width,height:900});
            await page.goto('http://127.0.0.1:8000/',{waitUntil:'domcontentloaded'});
            await page.locator('#site-loader').waitFor({state:'hidden'});
            if(await page.getByRole('button',{name:'Só essenciais',exact:true}).isVisible())
                await page.getByRole('button',{name:'Só essenciais',exact:true}).click();
            assert.ok(await page.locator('.product-card').count()>30);
            await page.getByRole('searchbox').fill('lapis');
            await page.getByRole('button',{name:'Kit Festas 13',exact:true}).click();
            await page.getByText('Nenhum produto encontrado.',{exact:true}).waitFor();
            await page.getByRole('button',{name:'Todos 36',exact:true}).click();
            await page.getByRole('button',{name:'Ver Detalhes',exact:true}).click();
            await page.getByRole('dialog').waitFor();
            await page.keyboard.press('Escape');
            await page.getByRole('dialog').waitFor({state:'hidden'});
            await page.getByRole('button',{name:'Ver Detalhes',exact:true}).click();
            await page.getByLabel('Tema da Festa / Cores desejadas').fill('Teste local');
            await page.getByRole('button',{name:'Revisar e comprar no site'}).click();
            await page.waitForURL('**/checkout.html',{waitUntil:'domcontentloaded'});
            await page.getByRole('heading',{name:'Seu pedido',exact:true}).waitFor();
            const size=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
            assert.ok(size.scroll<=size.width,JSON.stringify({width,...size}));
            await page.screenshot({path:path.join(out,'checkout-'+width+'.png'),fullPage:true});
            await page.goto('http://127.0.0.1:8000/',{waitUntil:'domcontentloaded'});
            await page.locator('#site-loader').waitFor({state:'hidden'});
            const home=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
            assert.ok(home.scroll<=home.width,'Homepage overflow '+width);
            await page.screenshot({path:path.join(out,'home-'+width+'.png'),fullPage:false});
        }
        // Simulated API responses validate UI handling without creating a real order or charge.
        await page.goto('http://127.0.0.1:8000/checkout.html');
        await page.route('https://backand-gabrielepersonaliza.vercel.app/api/orders', async route=>{
            await route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({
                docId:'f'.repeat(32),id_visual:'#TESTELOCAL',items:[],total_cents:10000,deposit_cents:5000,
                received_cents:0,balance_cents:10000,payment_status:'pending',fulfillment_status:'Aguardando pagamento'
            })});
        });
        await page.getByLabel('Nome completo').fill('Teste automatizado');
        await page.getByLabel('WhatsApp com DDD').fill('92999999999');
        await page.getByLabel('E-mail do pagador').fill('teste@example.com');
        await page.locator('#terms').check();await page.locator('#arranged').check();
        await page.getByRole('button',{name:'Revisar valor atualizado'}).click();
        await page.locator('#review-panel').waitFor({state:'visible'});
        await page.getByRole('button',{name:'Gerar Pix da entrada'}).click();
        await page.waitForURL('**/meu-pedido.html**',{waitUntil:'domcontentloaded'});
        await page.getByRole('heading',{name:'Pedido #TESTELOCAL'}).waitFor();
        await page.route('https://backand-gabrielepersonaliza.vercel.app/api/pix', route=>route.fulfill({
            status:503,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({error:'Falha simulada, tente novamente.'})
        }));
        await page.getByRole('button',{name:'Gerar ou recuperar Pix'}).click();
        await page.getByText('Falha simulada, tente novamente.',{exact:true}).waitFor();
        assert.equal(await page.getByRole('button',{name:'Gerar ou recuperar Pix'}).isEnabled(),true);
        assert.deepEqual(errors,[]);
        console.log('PASS: 4 viewport sizes, combined filters, modal Escape, cart, mocked quote/private tracking/payment error. Screenshots: '+out);
    } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
