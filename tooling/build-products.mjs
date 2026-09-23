import { mkdir, writeFile, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
const base = 'https://gabrielepersonaliza.com.br';
const endpoint = 'https://firestore.googleapis.com/v1/projects/gabriele-personaliza/databases/(default)/documents:runQuery';
const response = await fetch(endpoint, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
    structuredQuery:{from:[{collectionId:'produtos'}],where:{fieldFilter:{field:{fieldPath:'ativo'},op:'EQUAL',value:{booleanValue:true}}}}
}), signal:AbortSignal.timeout(30000)});
if(!response.ok) throw new Error('Catalog read failed: '+response.status);
function value(v) {
    if('stringValue' in v)return v.stringValue;
    if('integerValue' in v)return Number(v.integerValue);
    if('doubleValue' in v)return v.doubleValue;
    if('booleanValue' in v)return v.booleanValue;
    if('arrayValue' in v)return (v.arrayValue.values || []).map(value);
    if('mapValue' in v)return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k,v])=>[k,value(v)]));
    return null;
}
const products=(await response.json()).filter(row=>row.document).map(({document:d})=>({
    id:d.name.split('/').pop(),...Object.fromEntries(Object.entries(d.fields).map(([k,v])=>[k,value(v)]))
})).filter(p=>p.ativo && !p.arquivado);
if(!products.length) throw new Error('Empty catalog; refusing to replace product pages.');
const escape = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dir=path.resolve('produtos');
await mkdir(dir,{recursive:true});
await writeFile(path.join(dir,'manifest.js'),'export const productPages = new Set('+JSON.stringify(products.map(p=>p.id))+');\n');
const generated=new Set();
for(const p of products) {
    if(!/^[a-zA-Z0-9_-]+$/.test(p.id)) throw new Error('Invalid product ID');
    const filename=p.id+'.html';generated.add(filename);
    const url=base+'/produtos/'+filename;
    const image=(p.fotos || [p.foto]).find(f=>typeof f==='string' && /^https:\/\//.test(f)) || base+'/assets/img/icon-512.png';
    const price=Number(p.em_promocao && p.preco_promocional>0 ? p.preco_promocional : p.preco);
    const desc=String(p.descricao || p.nome+' personalizado em Manacapuru-AM.').trim();
    const schema={'@context':'https://schema.org','@type':'Product',name:p.nome,description:desc,image,
        brand:{'@type':'Brand',name:'Gabriele Personaliza'},
        offers:{'@type':'Offer',url,price:price.toFixed(2),priceCurrency:'BRL',availability:'https://schema.org/InStock'}};
    const html='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
        '<title>'+escape(p.nome)+' | Gabriele Personaliza</title><meta name="description" content="'+escape(desc.slice(0,160))+'">'+
        '<link rel="canonical" href="'+url+'"><link rel="icon" href="/assets/img/favicon-64.png">'+
        '<meta property="og:title" content="'+escape(p.nome)+'"><meta property="og:description" content="'+escape(desc.slice(0,200))+'">'+
        '<meta property="og:type" content="product"><meta property="og:url" content="'+url+'"><meta property="og:image" content="'+escape(image)+'">'+
        '<meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/paginas.css">'+
        '<script type="application/ld+json">'+JSON.stringify(schema).replace(/</g,'\\u003c')+'</script>'+
        '<style>.product{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:32px}.product img{width:100%;max-height:520px;object-fit:contain}.description{white-space:pre-line}h1{font-size:28px}@media(max-width:650px){.product{grid-template-columns:1fr}}</style></head><body>'+
        '<header><a class="brand" href="/">Gabriele Personaliza</a><a href="/checkout.html">Meu carrinho</a></header><main><div class="product">'+
        '<img src="'+escape(image)+'" alt="'+escape(p.nome)+'"><section><h1>'+escape(p.nome)+'</h1><p>'+escape(price.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}))+' por unidade</p><p>Quantidade mínima: '+escape(p.minimo || 1)+'</p>'+
        '<p class="description">'+escape(desc)+'</p><p>Feito em Manacapuru-AM. Produção habitual de 7 a 15 dias úteis; confirme a disponibilidade para seu evento.</p>'+
        '<a class="primary-link" href="/#produto='+p.id+'">Personalizar e comprar</a><p>Preço e disponibilidade são conferidos novamente ao revisar o pedido.</p>'+
        '</section></div><p><a href="/como-comprar.html">Pagamento, aprovação da arte e retirada</a></p></main>'+
        '<footer><a href="/">Catálogo</a><a href="/privacidade.html">Privacidade</a><a href="/termos.html">Termos</a><span>Manacapuru-AM</span></footer></body></html>';
    await writeFile(path.join(dir,filename),html);
}
for(const name of await readdir(dir)) if(/^[a-zA-Z0-9_-]+\.html$/.test(name) && !generated.has(name)) await unlink(path.join(dir,name));
const urls=['/','/privacidade.html','/termos.html','/como-comprar.html',...products.map(p=>'/produtos/'+p.id+'.html')];
await writeFile('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>'  <url><loc>'+escape(base+u)+'</loc></url>').join('\n')+'\n</urlset>\n');
console.log('Generated '+products.length+' product pages and sitemap.');
