document.addEventListener('DOMContentLoaded', () => {
    
    // --- MENU MOBILE ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if(menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active-menu');
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
