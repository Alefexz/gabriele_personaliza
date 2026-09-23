import {read,write,request,currency,trackingUrl} from './loja-pedidos.js';
const $=id=>document.getElementById(id);
const match=location.hash.slice(1).match(/^([a-zA-Z0-9_-]{12,80})\.([a-f0-9]{64})$/);
const saved=read('gp-saved-order',null,localStorage);
let access=match?{docId:match[1],token:match[2]}:read('gp-current-order');
if(!access && saved && saved.until>Date.now()) access=saved;
if(match) { write('gp-current-order',access); history.replaceState(null,'',location.pathname); }
let order=null,busy=false;
const labels={pending:'Aguardando pagamento',in_process:'Em análise',approved:'Entrada confirmada',rejected:'Recusado',cancelled:'Cancelado pelo processador',refunded:'Reembolsado',charged_back:'Contestação do pagamento'};
function render(p) {
    order=p; $('order').hidden=false; $('no-order').hidden=true;
    $('order-title').textContent='Pedido '+p.id_visual;
    $('status').textContent='Pagamento: '+(labels[p.payment_status] || 'Aguardando confirmação');
    $('fulfillment').textContent='Produção: '+p.fulfillment_status;
    $('fulfillment').textContent += ' · Previsão: ' + (p.promised_date || 'aguardando registro da loja') +
        '. Recebimento: ' + (p.pickup_instructions || 'retirada combinada em Manacapuru') +
        '. Vencimento do saldo: ' + (p.balance_due || 'conforme combinado com a loja') + '.';
    $('items').replaceChildren();
    for(const item of p.items) {const line=document.createElement('p');line.textContent=item.quantity+'x '+item.name; $('items').append(line);}
    $('amounts').replaceChildren();
    for(const [label,value] of [['Total do pedido',p.total_cents],['Recebido via processador',p.received_cents],['Outros recebimentos confirmados pela loja',p.manual_received_cents],['Saldo restante',p.balance_cents]]) {
        const line=document.createElement('p');line.className='money-row';
        const l=document.createElement('span');l.textContent=label;const v=document.createElement('strong');v.textContent=currency(value);
        line.append(l,v);$('amounts').append(line);
    }
    $('payment').hidden=['approved','refunded','charged_back'].includes(p.payment_status) || p.status==='Cancelado';
    $('art').hidden=!p.art?.url;
    if(p.art?.url) {
        const u=new URL(p.art.url);
        if(u.protocol==='https:') $('art-link').href=u.href;
        $('art-state').textContent=p.art.approved_at?'Arte aprovada em '+new Date(p.art.approved_at).toLocaleString('pt-BR'):'Versão '+p.art.version+' aguardando sua conferência.';
        $('approve').disabled=!!p.art.approved_at;
    }
    $('support').href='https://wa.me/559292770409?text='+encodeURIComponent('Olá! Preciso de atendimento sobre meu pedido '+p.id_visual+'.');
}
async function refresh() {
    if(!access || busy) return;
    busy=true;
    try {render(await request('orders',{action:'status',docId:access.docId},access.token));$('message').textContent='Atualizado às '+new Date().toLocaleTimeString('pt-BR');}
    catch(e) {$('message').textContent=e.message+' Você pode tentar novamente nesta página.'; if(!order) $('no-order').hidden=false;}
    finally {busy=false;}
}
$('generate').onclick=async()=>{
    $('generate').disabled=true;
    try {
        const p=await request('pix',{docId:access.docId},access.token);
        if(p.qr_code && p.qr_code_base64) {
            $('pix').hidden=false;$('code').value=p.qr_code;$('qr').src='data:image/png;base64,'+p.qr_code_base64;
            $('expires').textContent='Vencimento informado pelo Mercado Pago: '+new Date(p.expires_at).toLocaleString('pt-BR')+'.';
        } else await refresh();
    } catch(e) {$('message').textContent=e.message;}
    finally {$('generate').disabled=false;}
};
async function copy(value) {try {await navigator.clipboard.writeText(value);$('message').textContent='Copiado.';}catch {$('message').textContent='A cópia foi bloqueada pelo navegador.';}}
$('copy').onclick=()=>copy($('code').value);
$('save-link').onclick=()=>copy(trackingUrl(access));
$('refresh').onclick=refresh;
$('remember').onclick=()=>{$('message').textContent=write('gp-saved-order',{...access,until:Date.now()+90*86400000},localStorage)?'Pedido lembrado neste aparelho.':'Não foi possível guardar o acesso.';};
$('forget').onclick=()=>{try{localStorage.removeItem('gp-saved-order');sessionStorage.removeItem('gp-current-order');}catch{} $('message').textContent='Acesso removido deste aparelho. Guarde seu link antes de sair.';};
$('approve').onclick=async()=>{
    if(!$('art-check').checked){$('message').textContent='Confira a arte e marque a confirmação.';return;}
    $('approve').disabled=true;
    try {render(await request('orders',{action:'approve-art',docId:access.docId,version:order.art.version},access.token));}
    catch(e){$('message').textContent=e.message;$('approve').disabled=false;}
};
$('open-order').onsubmit=e=>{e.preventDefault();try {const u=new URL($('private-link').value);if(u.origin!==location.origin||!/^#[a-zA-Z0-9_-]{12,80}\.[a-f0-9]{64}$/.test(u.hash))throw Error();location.hash=u.hash;location.reload();}catch{$('message').textContent='Link privado inválido.';}};
if(access){refresh();setInterval(()=>{if(!document.hidden)refresh();},20000);}else{$('message').textContent='Nenhum pedido aberto neste aparelho.';$('no-order').hidden=false;}
