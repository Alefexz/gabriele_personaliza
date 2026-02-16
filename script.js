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
});