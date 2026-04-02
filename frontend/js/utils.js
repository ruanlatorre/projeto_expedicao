/**
 * Funções Utilitárias Globais
 */

const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');

// Função para mostrar notificação rápida
function showToast(message, type = 'success') {
    if (!toastMsg || !toast) return;
    toastMsg.textContent = message;
    toast.style.background = type === 'success' ? '#28a745' : '#dc3545';
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Função para formatar data e hora
function formatDateTime(dbDate) {
    const date = new Date(dbDate);
    return date.toLocaleDateString('pt-PT') + ' às ' + date.toLocaleTimeString('pt-PT');
}

// Verifica se a string é uma URL de imagem
function isImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const cleanUrl = url.split('?')[0].split('#')[0];
    return (
        cleanUrl.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i) !== null ||
        url.startsWith('data:image/') ||
        url.includes('images.unsplash.com') ||
        url.includes('img.freepik.com')
    );
}

// Gera um código de cor baseado em uma string
function generateColorCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return "00000".substring(0, 6 - c.length) + c;
}
