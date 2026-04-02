/**
 * Configuração da URL base da API
 */
const getApiBaseUrl = () => {
    const url = new URL(window.location.href);
    let path = url.pathname;

    // Remove o nome do arquivo se presente (ex: index.html)
    if (path.includes('.html')) {
        path = path.substring(0, path.lastIndexOf('/'));
    }

    // Se estiver dentro da pasta frontend, sobe um nível para achar a raiz do projeto
    if (path.endsWith('/frontend')) {
        path = path.substring(0, path.lastIndexOf('/frontend'));
    }

    // Remove barra duplicada se o path for apenas "/"
    const basePath = path === '/' ? '' : path.replace(/\/$/, '');

    return url.origin + basePath + '/backend/public/index.php';
};

const API_BASE_URL = getApiBaseUrl();
