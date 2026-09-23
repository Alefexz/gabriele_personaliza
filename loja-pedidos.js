export const API = 'https://backand-gabrielepersonaliza.vercel.app/api/';
export const currency = cents => (Number(cents || 0) / 100).toLocaleString('pt-BR', {style:'currency',currency:'BRL'});
export function read(key, fallback = null, storage = sessionStorage) {
    try { return JSON.parse(storage.getItem(key)) ?? fallback; } catch { return fallback; }
}
export function write(key, value, storage = sessionStorage) {
    try { storage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
export function secret() { return Array.from(crypto.getRandomValues(new Uint8Array(32)), x => x.toString(16).padStart(2,'0')).join(''); }
export async function request(route, body, token) {
    const r = await fetch(API + route, { method:'POST', cache:'no-store',
        headers:{'Content-Type':'application/json', ...(token ? {'X-Order-Token':token} : {})},
        body:JSON.stringify(body), signal:AbortSignal.timeout(25000) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || 'Não foi possível concluir. Tente novamente.');
    return data;
}
export function track(name, data = {}) {
    if (read('gabriele-estatisticas', null, localStorage) === 'sim') window.gtag?.('event', name, data);
    else { try { if(localStorage.getItem('gabriele-estatisticas') === 'sim') window.gtag?.('event',name,data); } catch {} }
}
export function addItem(product, quantity, personalization = {}) {
    const cart = read('gp-cart', []);
    if (cart.length >= 20) throw new Error('Limite de 20 itens por pedido.');
    const photo = (product.fotos || [product.foto])[0];
    cart.push({ productId:product.id, name:product.nome, quantity, minimum:product.minimo || 1,
        unit_cents: Math.round(Number(product.em_promocao && product.preco_promocional > 0 ? product.preco_promocional : product.preco) * 100),
        photo: typeof photo === 'string' && /^https:\/\//.test(photo) ? photo : '/assets/img/icon-192.png', personalization });
    if (!write('gp-cart', cart)) throw new Error('Libere o armazenamento de sessão do navegador para montar o pedido.');
    track('add_to_cart', {currency:'BRL',items:[{item_id:product.id,quantity}]});
}
export function trackingUrl(order) { return location.origin + '/meu-pedido.html#' + order.docId + '.' + order.token; }

