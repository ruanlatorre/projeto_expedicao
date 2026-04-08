/**
 * Lógica da Tela de Splash e Carrossel
 */

document.addEventListener('DOMContentLoaded', () => {
    const btnEnterApp = document.getElementById('btnEnterApp');
    const splashScreen = document.getElementById('splashScreen');
    const appContainer = document.querySelector('.app-container');
    const progressBar = document.querySelector('.progress-bar');
    const carouselItems = document.querySelectorAll('.carousel-item');
    const carouselContainer = document.querySelector('.carousel-container');

    if (!splashScreen) return;

    let currentSlide = 1;
    let autoRotateInterval = null;

    function updateCarousel() {
        if (!carouselItems.length) return;
        carouselItems.forEach((item, index) => {
            item.classList.remove('active', 'prev', 'next', 'hidden');

            if (index === currentSlide) {
                item.classList.add('active');
            } else if (index === (currentSlide - 1 + carouselItems.length) % carouselItems.length) {
                item.classList.add('prev');
            } else if (index === (currentSlide + 1) % carouselItems.length) {
                item.classList.add('next');
            } else {
                item.classList.add('hidden');
            }
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % carouselItems.length;
        updateCarousel();
    }

    // Auto-rotação
    function startAutoRotate() {
        stopAutoRotate();
        autoRotateInterval = setInterval(nextSlide, 800);
    }

    function stopAutoRotate() {
        if (autoRotateInterval) {
            clearInterval(autoRotateInterval);
            autoRotateInterval = null;
        }
    }

    // Início
    updateCarousel();
    startAutoRotate();

    // Clique nas imagens
    carouselItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            currentSlide = index;
            updateCarousel();
            startAutoRotate();
        });
    });

    // Evento de entrar na aplicação
    if (btnEnterApp) {
        btnEnterApp.addEventListener('click', () => {
            splashScreen.classList.add('fade-out');
            if (appContainer) {
                appContainer.style.opacity = '1';
                appContainer.classList.add('reveal');
            }
            stopAutoRotate();
        });
    }

    // Exibir o botão após o carregamento da barra
    if (progressBar) {
        progressBar.addEventListener('animationend', () => {
            if (btnEnterApp) {
                btnEnterApp.classList.add('show');
            }
        });
    }
});
