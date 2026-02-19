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

    // --- SOLUÇÃO DEFINITIVA DO INSTAGRAM ---
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const instaLinks = document.querySelectorAll('a[href*="instagram.com"]');

    instaLinks.forEach(link => {
        // 1. Link 100% limpo, sem o rastreador (?igsh) que quebra o aplicativo
        link.href = "https://www.instagram.com/gabriele_personaliza/";

        // 2. Se for celular, tira o bloqueio de nova aba
        if (isMobile) {
            link.removeAttribute('target');
        } else {
            // Se for PC, garante que vai abrir em nova aba
            link.setAttribute('target', '_blank');
        }
    });
});