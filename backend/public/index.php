<?php
// Exibir erros detalhados durante o debug (desative em produção)
error_reporting(E_ALL);
ini_set('display_errors', '1');

date_default_timezone_set('America/Sao_Paulo');

// Handle CORS (enviar headers ANTES de qualquer processamento)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Verificar extensões PHP obrigatórias
$requiredExtensions = ['openssl', 'mbstring'];
$missingExtensions = [];
foreach ($requiredExtensions as $ext) {
    if (!extension_loaded($ext)) {
        $missingExtensions[] = $ext;
    }
}
if (!empty($missingExtensions)) {
    http_response_code(500);
    $extList = implode(', ', $missingExtensions);
    $installCmd = 'sudo apt install ' . implode(' ', array_map(fn($e) => 'php-' . $e, $missingExtensions));
    echo json_encode([
        'error' => "Extensões PHP ausentes: $extList",
        'install_debian' => $installCmd,
        'install_rhel' => str_replace('apt install', 'yum install', $installCmd),
        'php_version' => PHP_VERSION
    ]);
    exit;
}

// Verificar se o autoloader existe antes de tentar carregá-lo
$autoloadPath = __DIR__ . '/../vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Autoloader não encontrado. Execute "composer install" na pasta backend/',
        'path' => $autoloadPath
    ]);
    exit;
}

require_once $autoloadPath;

use App\Infrastructure\Persistence\JsonCollectedItemRepository;
use App\Infrastructure\Email\PHPMailerEmailSender;
use App\Application\Service\CollectItemService;
use App\Application\Service\ReportService;
use App\Presentation\Controller\CollectController;

// Simple .env Loader
$envPath = __DIR__ . '/../.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        // Remover possíveis caracteres \r de line endings Windows (CRLF)
        $line = str_replace("\r", '', $line);
        if (empty($line) || strpos($line, '#') === 0 || strpos($line, '=') === false) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

// ============================================================
// Roteamento Resiliente (compatível com XAMPP, Apache e Nginx)
// ============================================================
$method = $_SERVER['REQUEST_METHOD'];
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Forçar limpeza de REQUEST_URI para evitar problemas com barras duplas
$requestUri = preg_replace('#/+#', '/', $requestUri);

/**
 * Prioridade de detecção da rota:
 * 
 * 1. Parâmetro ?route= na query string (usado pelo rewrite do Nginx)
 * 2. PATH_INFO (usado pelo XAMPP/Apache)
 * 3. Extração direta do REQUEST_URI removendo prefixos conhecidos (/api)
 */
if (isset($_GET['route']) && $_GET['route'] !== '') {
    $path = $_GET['route'];
} elseif (isset($_SERVER['PATH_INFO']) && $_SERVER['PATH_INFO'] !== '') {
    $path = $_SERVER['PATH_INFO'];
} else {
    // Tentar detectar removendo o prefixo /api se presente na URL real
    $path = $requestUri;
    $prefixes = ['/api', '/backend/public/index.php'];
    
    foreach ($prefixes as $prefix) {
        if (strpos($path, $prefix) === 0) {
            $path = substr($path, strlen($prefix));
        }
    }
}

// Limpeza final do path
$path = '/' . ltrim($path, '/');
$path = rtrim($path, '/');
if (empty($path)) $path = '/';

// Setup DI (Manual for this structure)
try {
    $repository = new JsonCollectedItemRepository();
} catch (\Throwable $e) {
    http_response_code(500);
    $msg = $e->getMessage();
    $linux_hint = 'Verifique se o usuário do servidor (ex: www-data ou nginx) tem permissão na pasta backend/database/. ';
    $linux_hint .= 'Execute: sudo chown -R www-data:www-data backend/database && sudo chmod -R 775 backend/database';
    
    echo json_encode([
        'error' => 'Erro de Banco de Dados: ' . $msg,
        'linux_hint' => $linux_hint,
        'debug' => [
            'os' => PHP_OS,
            'user' => posix_getpwuid(posix_geteuid())['name'] ?? 'unknown',
            'dir' => __DIR__
        ]
    ]);
    exit;
}

$emailSender = new PHPMailerEmailSender();
$collectService = new CollectItemService($repository);
$reportService = new ReportService($repository, $emailSender);
$controller = new CollectController($repository, $collectService, $reportService);

// Routes
try {
    // Normalizar path para as rotas
    $routePath = $path === '' ? '/' : $path;

    if ($routePath === '/items' && $method === 'GET') {
        $controller->listItems();
    } elseif ($routePath === '/items' && $method === 'POST') {
        $controller->collectItem();
    } elseif ($routePath === '/items' && $method === 'DELETE') {
        $controller->clearAll();
    } elseif (preg_match('#^/items/(\d+)$#', $routePath, $matches) && $method === 'DELETE') {
        $controller->deleteItem((int)$matches[1]);
    } elseif ($routePath === '/report' && $method === 'POST') {
        $controller->sendReport();
    } else {
        http_response_code(404);
        echo json_encode([
            'error' => "Rota não encontrada: $routePath",
            'debug' => [
                'uri' => $requestUri,
                'method' => $method,
                'detected_path' => $path
            ]
        ]);
    }
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error: ' . $e->getMessage()]);
}

