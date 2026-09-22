(() => {
    const key = 'gabriele-estatisticas';
    let started = false;
    const read = () => { try { return localStorage.getItem(key); } catch (_) { return null; } };
    function enable() {
        window['ga-disable-G-T24GYM57CT'] = false;
        if (started) return;
        started = true;
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', 'G-T24GYM57CT');
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-T24GYM57CT';
        document.head.appendChild(script);
    }
    function choose(value) {
        try { localStorage.setItem(key, value); } catch (_) {}
        window['ga-disable-G-T24GYM57CT'] = value !== 'sim';
        if (value === 'sim') enable();
        else {
            document.cookie.split(';').forEach(entry => {
                const name = entry.split('=')[0].trim();
                if (!/^_ga(?:_|$)/.test(name)) return;
                ['', '; domain=' + location.hostname, '; domain=.gabrielepersonaliza.com.br'].forEach(domain => {
                    document.cookie = name + '=; Max-Age=0; path=/' + domain;
                });
            });
        }
        document.getElementById('cookie-preferences')?.remove();
    }
    window.abrirPreferencias = () => {
        if (document.getElementById('cookie-preferences')) return;
        const panel = document.createElement('section');
        panel.id = 'cookie-preferences';
        panel.setAttribute('aria-label', 'Preferências de privacidade');
        panel.style.cssText = 'position:fixed;bottom:0;left:0;width:100%;box-sizing:border-box;padding:16px 20px;background:white;color:#333;border-top:1px solid #ccc;box-shadow:0 -3px 16px #0001;z-index:4000;font:14px/1.5 system-ui;max-height:50dvh;overflow:auto';
        panel.innerHTML = '<p style="margin:0 0 12px">Podemos usar estatísticas opcionais para melhorar a loja? <a href="/privacidade.html">Política de privacidade</a></p><div style="display:flex;gap:12px;flex-wrap:wrap"><button type="button" data-choice="nao">Só essenciais</button><button type="button" data-choice="sim">Aceitar estatísticas</button></div>';
        panel.querySelectorAll('button').forEach(button => {
            button.style.cssText = 'min-height:44px;padding:10px 16px;border:1px solid #69448a;border-radius:6px;background:white;color:#54336f;font:inherit;cursor:pointer';
            button.addEventListener('click', () => choose(button.dataset.choice));
        });
        document.body.appendChild(panel);
    };
    if (read() === 'sim') enable();
    else if (read() === null) window.abrirPreferencias();
})();
