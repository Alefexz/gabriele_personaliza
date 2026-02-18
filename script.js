document.addEventListener('DOMContentLoaded', () => {
    
    // --- MENU MOBILE ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if(menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active-menu');
        });
    }

    // --- FILTRAGEM DO CATÁLOGO ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    // Só executa se houver botões de filtro na página
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 1. Remove classe 'active' de todos os botões
                filterBtns.forEach(b => b.classList.remove('active'));
                // 2. Adiciona 'active' no botão clicado
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                // 3. Lógica de mostrar/esconder cards
                productCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');

                    if (filterValue === 'todos' || filterValue === cardCategory) {
                        card.classList.remove('hide');
                        card.classList.add('show');
                    } else {
                        card.classList.add('hide');
                        card.classList.remove('show');
                    }
                });
            });
        });
    }

    // --- NOVO: CORREÇÃO DO LINK DO INSTAGRAM (DEEP LINK) ---
    // Verifica se o usuário está acessando por um celular
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Procura todos os links que apontam para o Instagram da Gabriele
        const instaLinks = document.querySelectorAll('a[href*="instagram.com/gabriele_personaliza"]');
        
        instaLinks.forEach(link => {
            // Muda para o protocolo do App (instagram://)
            // Isso força o celular a abrir o perfil direto, sem parar no feed
            link.href = "instagram://user?username=gabriele_personaliza";
        });
    }
});