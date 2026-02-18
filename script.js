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

    // --- CORREÇÃO DEFINITIVA INSTAGRAM ---
    const instaLinks = document.querySelectorAll('a[href*="instagram.com"]');
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    instaLinks.forEach(link => {
        if (isMobile) {
            // Abre direto no app no perfil correto
            link.href = "instagram://user?username=gabriele_personaliza";
        } else {
            // Desktop abre normal
            link.href = "https://www.instagram.com/gabriele_personaliza/";
        }
    });

});
