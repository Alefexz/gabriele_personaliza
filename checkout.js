import { read, write, secret, request, currency, trackingUrl, track } from './loja-pedidos.js';
const $ = id => document.getElementById(id);
let cart = read('gp-cart', []);
let draft = null;
function el(tag, text) { const e=document.createElement(tag); e.textContent=text; return e; }
function totals(target, total, deposit, label='Total estimado') {
    target.replaceChildren();
    for(const [name, value] of [[label,total],['Entrada de 50%',deposit],['Saldo restante',total-deposit]]) {
        const row=el('div',''); row.className='money-row'; row.append(el('span',name),el('strong',currency(value))); target.append(row);
    }
}
function render() {
    $('cart').replaceChildren();
    cart.forEach((item,index) => {
        const row=el('article',''); row.className='cart-item';
        const img=document.createElement('img'); img.src=item.photo; img.alt=item.name; img.addEventListener('error',()=>{img.src='/assets/img/icon-192.png'},{once:true});
        const detail=el('div',''); detail.append(el('h3',item.name),el('p',item.quantity+' unidades · '+currency(item.unit_cents)+' cada'));
        const p=item.personalization || {};
        detail.append(el('p',[p.theme,p.name,p.age,p.date].filter(Boolean).join(' · ')));
        const remove=el('button','×'); remove.className='danger'; remove.type='button'; remove.title='Remover '+item.name; remove.setAttribute('aria-label',remove.title);
        remove.onclick=()=>{cart.splice(index,1);write('gp-cart',cart);draft=null;sessionStorage.removeItem('gp-attempt');render();};
        row.append(img,detail,remove); $('cart').append(row);
    });
    if(!cart.length) $('cart').append(el('p','Seu carrinho está vazio. Escolha um produto no catálogo.'));
    $('review').disabled=!cart.length;
    const sum=cart.reduce((n,i)=>n+i.unit_cents*i.quantity,0);
    totals($('estimate'),sum,Math.ceil(sum/2));
}
$('delivery').onchange=()=> {
    $('review').textContent=$('delivery').value==='entrega'?'Solicitar cotação de entrega':'Revisar valor atualizado';
    $('arranged').required=$('delivery').value==='retirada';
};
$('checkout-form').onsubmit=async e=>{
    e.preventDefault(); $('message').textContent='';
    if($('delivery').value==='entrega') {
        const message='Olá! Quero cotar entrega para: '+cart.map(i=>i.quantity+'x '+i.name).join('; ')+'. Meu nome é '+$('name').value+'.';
        location.href='https://wa.me/559292770409?text='+encodeURIComponent(message); return;
    }
    $('review').disabled=true;
    try {
        const body={action:'create', customer:{name:$('name').value.trim(),phone:$('phone').value.trim(),email:$('email').value.trim()},
            items:cart.map(({productId,quantity,personalization})=>({productId,quantity,personalization})),
            delivery:'retirada',terms:$('terms').checked};
        const fingerprint=JSON.stringify(body);
        let attempt=read('gp-attempt');
        if(!attempt || attempt.fingerprint!==fingerprint) {
            attempt={key:crypto.randomUUID(),token:secret(),fingerprint};
            if(!write('gp-attempt',attempt)) throw new Error('Armazenamento indisponível. Libere a sessão antes de continuar.');
        }
        const result=await request('orders',{...body,key:attempt.key},attempt.token);
        draft={...result,token:attempt.token}; write('gp-current-order',draft);
        $('checkout-form').hidden=true; $('review-panel').hidden=false;
        totals($('confirmed'),result.total_cents,result.deposit_cents,'Total confirmado');
        $('tracking').href=trackingUrl(draft);
        // Catalog prices are estimates; the shopper explicitly accepts the server quote here.
        if(result.total_cents!==cart.reduce((n,i)=>n+i.unit_cents*i.quantity,0))
            $('message').textContent='O catálogo mudou. Confira o valor atualizado antes de gerar o Pix.';
        track('begin_checkout',{currency:'BRL',value:result.total_cents/100});
    } catch(err) { $('message').textContent=err.message; }
    finally { $('review').disabled=!cart.length; }
};
$('edit').onclick=()=>{ $('review-panel').hidden=true;$('checkout-form').hidden=false; };
$('pay').onclick=()=>{ if(draft) location.href=trackingUrl(draft); };
render();

