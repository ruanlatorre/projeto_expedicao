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

    // 2. Extrair a base do projeto removendo a pasta 'frontend' se estiver nela
    const segments = path.split('/').filter(s => s !== '');
    if (segments.length > 0 && segments[segments.length - 1] === 'frontend') {
        segments.pop();
    }
    
    // Reconstrói a base do projeto (ex: "" ou "/projeto")
    const projectRoot = segments.length > 0 ? '/' + segments.join('/') : '';

    // 3. Detecção de ambiente e construção da URL
    // IPs de rede local devem ser tratados como desenvolvimento (XAMPP)
    const isLocalOrNetwork = (
        url.hostname === 'localhost' || 
        url.hostname === '127.0.0.1' || 
        url.hostname.startsWith('192.168.') || 
        url.hostname.startsWith('10.') || 
        url.hostname.startsWith('172.') ||
        url.hostname.includes('.local')
    );

    if (isLocalOrNetwork) {
        // No XAMPP, o .htaccess no backend/public permite usar /api ou o path direto.
        // Usar /backend/public/index.php é o mais seguro para evitar problemas de mod_rewrite desativado.
        return url.origin + projectRoot + '/backend/public/index.php';
    }

    // Produção (Nginx): Caminho relativo para o prefixo /api que o Nginx gerencia
    return url.origin + projectRoot + '/api';
};


const API_BASE_URL = getApiBaseUrl();
console.log('[FacchiniLOG] API_BASE_URL:', API_BASE_URL);
