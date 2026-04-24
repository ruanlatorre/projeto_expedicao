<?php
/**
 * Script de Diagnóstico para Linux/Nginx
 */
header('Content-Type: application/json');

$results = [
    'status' => 'ok',
    'timestamp' => date('Y-m-d H:i:s'),
    'environment' => [
        'os' => PHP_OS,
        'php_version' => PHP_VERSION,
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
        'user' => get_current_user(),
        'sapi' => PHP_SAPI
    ],
    'checks' => []
];

// 1. Verificação de Extensões
$requiredExtensions = ['openssl', 'mbstring', 'json', 'filter'];
foreach ($requiredExtensions as $ext) {
    $results['checks']['extension_' . $ext] = extension_loaded($ext);
}

// 2. Verificação de Permissões
$baseDir = dirname(__DIR__);
$dbDir = $baseDir . '/database';

$results['checks']['database_dir_exists'] = is_dir($dbDir);
$results['checks']['database_dir_writable'] = is_writable($dbDir);

// 3. Verificação de Caminhos (Case-Sensitivity)
$repoFile = $baseDir . '/app/Infrastructure/Persistence/JsonCollectedItemRepository.php';
$results['checks']['repository_file_exists'] = file_exists($repoFile);

// 4. Verificação de Vendor
$results['checks']['composer_autoload_exists'] = file_exists($baseDir . '/vendor/autoload.php');

// Determinar status final
foreach ($results['checks'] as $check) {
    if ($check === false) {
        $results['status'] = 'error';
        break;
    }
}

echo json_encode($results, JSON_PRETTY_PRINT);
