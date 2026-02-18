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

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

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

    // --- CORREÇÃO DO LINK DO INSTAGRAM (MÉTODO UNIVERSAL) ---
    // Verifica se é celular
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Seleciona todos os links do Instagram
        const instaLinks = document.querySelectorAll('a[href*="instagram.com"]');
        
        instaLinks.forEach(link => {
            // O segredo: usar "/_u/" na URL força o app a abrir o perfil
            // E removemos aquele lixo "?igsh=..." para limpar o link
            link.href = "https://www.instagram.com/_u/gabriele_personaliza/";
        });
    }
});