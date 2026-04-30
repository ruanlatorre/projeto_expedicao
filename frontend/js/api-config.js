/**
 * Configuração da URL base da API
 * 
 * Estratégia de detecção automática de ambiente:
 * - Tenta detectar o caminho base do projeto dinamicamente.
 * - Suporta XAMPP (Apache), Nginx (Linux) e acessos via IP.
 */
const getApiBaseUrl = () => {
    const url = new URL(window.location.href);
    let path = url.pathname;

    // 1. Limpar o path de arquivos (ex: index.html)
    if (path.includes('.html')) {
        path = path.substring(0, path.lastIndexOf('/'));
    }

    // Se estiver dentro da pasta frontend, sobe um nível para achar a raiz do projeto
    if (path.endsWith('/frontend')) {
        path = path.substring(0, path.lastIndexOf('/frontend'));
    }

    // Remove barra duplicada se o path for apenas "/"
    const basePath = path === '/' ? '' : path.replace(/\/$/, '');

    return url.origin + basePath + '/api';
};


const API_BASE_URL = getApiBaseUrl();
console.log('[FacchiniLOG] API_BASE_URL:', API_BASE_URL);
