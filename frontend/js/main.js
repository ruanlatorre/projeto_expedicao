/**
 * Ponto de Entrada da Aplicação
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa ícones
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Carrega itens iniciais
    if (typeof loadItems === 'function') {
        loadItems();
    }

    // Configura botões de fechar modais genéricos
    const closeButtons = document.querySelectorAll('.btn-close-modal, .btn-secondary');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) {
                modal.style.display = 'none';
                if (modal.classList.contains('show')) modal.classList.remove('show');
            }
        });
    });
});

// Listener global para redimensionamento e orientação (Scanner)
window.addEventListener('resize', () => {
    if (typeof restartScanner === 'function') restartScanner();
});

window.addEventListener('orientationchange', () => {
    if (typeof restartScanner === 'function') restartScanner();
});
