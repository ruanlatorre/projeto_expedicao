<?php
/**
 * FacchiniLOG — Script de Diagnóstico para Servidor Linux
 * 
 * Acesse pelo navegador: http://seu-servidor/caminho/backend/public/diagnose.php
 * 
 * ⚠️ REMOVA ESTE ARQUIVO APÓS O DIAGNÓSTICO!
 */

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Diagnóstico FacchiniLOG</title>";
echo "<style>body{font-family:monospace;background:#1a1a2e;color:#e0e0e0;padding:20px;max-width:900px;margin:0 auto}";
echo "h1{color:#ff6b35}h2{color:#64b5f6;border-bottom:1px solid #333;padding-bottom:8px;margin-top:30px}";
echo ".ok{color:#4caf50;font-weight:bold}.fail{color:#f44336;font-weight:bold}.warn{color:#ff9800;font-weight:bold}";
echo ".box{background:#16213e;border-radius:8px;padding:15px;margin:10px 0;border-left:4px solid #333}";
echo ".box.pass{border-left-color:#4caf50}.box.error{border-left-color:#f44336}.box.warning{border-left-color:#ff9800}";
echo "pre{background:#0f3460;padding:10px;border-radius:4px;overflow-x:auto;font-size:13px}</style></head><body>";

echo "<h1>🔍 Diagnóstico FacchiniLOG</h1>";
echo "<p>Executado em: " . date('d/m/Y H:i:s') . " | Servidor: " . php_uname() . "</p>";

$allPassed = true;

// ============================================================
// 1. Versão do PHP
// ============================================================
echo "<h2>1. Versão do PHP</h2>";
$phpVersion = PHP_VERSION;
$phpOk = version_compare($phpVersion, '8.0.0', '>=');
$class = $phpOk ? 'pass' : 'error';
$status = $phpOk ? '<span class="ok">✅ OK</span>' : '<span class="fail">❌ FALHA</span>';
echo "<div class='box $class'>PHP Version: <strong>$phpVersion</strong> — $status (Requerido: >= 8.0.0)</div>";
if (!$phpOk) $allPassed = false;

// ============================================================
// 2. Extensões PHP
// ============================================================
echo "<h2>2. Extensões PHP</h2>";
$requiredExts = ['openssl', 'mbstring', 'json', 'fileinfo'];
foreach ($requiredExts as $ext) {
    $loaded = extension_loaded($ext);
    $class = $loaded ? 'pass' : 'error';
    $status = $loaded ? '<span class="ok">✅ Carregada</span>' : '<span class="fail">❌ NÃO ENCONTRADA</span>';
    echo "<div class='box $class'>Extensão <strong>$ext</strong>: $status</div>";
    if (!$loaded) $allPassed = false;
}

// ============================================================
// 3. Autoloader do Composer (vendor/)
// ============================================================
echo "<h2>3. Autoloader do Composer</h2>";
$autoloadPath = __DIR__ . '/../vendor/autoload.php';
$autoloadExists = file_exists($autoloadPath);
$class = $autoloadExists ? 'pass' : 'error';
$status = $autoloadExists ? '<span class="ok">✅ Encontrado</span>' : '<span class="fail">❌ NÃO ENCONTRADO</span>';
echo "<div class='box $class'>vendor/autoload.php: $status<br><small>Caminho: " . realpath($autoloadPath) . " (" . $autoloadPath . ")</small></div>";
if (!$autoloadExists) {
    $allPassed = false;
    echo "<div class='box warning'>💡 <strong>Solução:</strong> Execute <code>composer install</code> na pasta backend/</div>";
}

// Tenta carregar o autoloader
if ($autoloadExists) {
    try {
        require_once $autoloadPath;
        echo "<div class='box pass'>Autoloader carregado: <span class='ok'>✅ OK</span></div>";
    } catch (Throwable $e) {
        echo "<div class='box error'>Erro ao carregar autoloader: <span class='fail'>❌ " . $e->getMessage() . "</span></div>";
        $allPassed = false;
    }
}

// ============================================================
// 4. Classes PSR-4 (Case-Sensitivity)
// ============================================================
echo "<h2>4. Classes PSR-4 (Case-Sensitivity no Linux)</h2>";
$classChecks = [
    'App\\Domain\\Model\\CollectedItem' => __DIR__ . '/../app/Domain/Model/CollectedItem.php',
    'App\\Domain\\Repository\\CollectedItemRepository' => __DIR__ . '/../app/Domain/Repository/CollectedItemRepository.php',
    'App\\Application\\Service\\CollectItemService' => __DIR__ . '/../app/Application/Service/CollectItemService.php',
    'App\\Application\\Service\\ReportService' => __DIR__ . '/../app/Application/Service/ReportService.php',
    'App\\Infrastructure\\Persistence\\JsonCollectedItemRepository' => __DIR__ . '/../app/Infrastructure/Persistence/JsonCollectedItemRepository.php',
    'App\\Infrastructure\\Email\\EmailSender' => __DIR__ . '/../app/Infrastructure/Email/EmailSender.php',
    'App\\Infrastructure\\Email\\PHPMailerEmailSender' => __DIR__ . '/../app/Infrastructure/Email/PHPMailerEmailSender.php',
    'App\\Presentation\\Controller\\CollectController' => __DIR__ . '/../app/Presentation/Controller/CollectController.php',
];

foreach ($classChecks as $className => $expectedPath) {
    $fileExists = file_exists($expectedPath);
    $shortName = basename($expectedPath);
    $class = $fileExists ? 'pass' : 'error';
    $status = $fileExists ? '<span class="ok">✅</span>' : '<span class="fail">❌ Arquivo não encontrado</span>';
    echo "<div class='box $class'>$status <strong>$shortName</strong><br><small>Namespace: $className<br>Caminho: $expectedPath</small></div>";
    if (!$fileExists) $allPassed = false;
}

// Verificação extra: tentar instanciar classes se autoloader foi carregado
if ($autoloadExists && class_exists('App\\Domain\\Model\\CollectedItem', true)) {
    echo "<div class='box pass'>Autoloading de classes: <span class='ok'>✅ Funcionando corretamente</span></div>";
} elseif ($autoloadExists) {
    echo "<div class='box error'>Autoloading de classes: <span class='fail'>❌ Falha ao carregar classes via autoloader</span><br>";
    echo "<small>💡 Execute <code>composer dump-autoload</code> no servidor Linux</small></div>";
    $allPassed = false;
}

// ============================================================
// 5. PHPMailer
// ============================================================
echo "<h2>5. PHPMailer</h2>";
$phpmailerPath = __DIR__ . '/../vendor/phpmailer/phpmailer/src/PHPMailer.php';
$phpmailerExists = file_exists($phpmailerPath);
$class = $phpmailerExists ? 'pass' : 'error';
$status = $phpmailerExists ? '<span class="ok">✅ Encontrado</span>' : '<span class="fail">❌ NÃO ENCONTRADO</span>';
echo "<div class='box $class'>PHPMailer: $status</div>";
if (!$phpmailerExists) {
    $allPassed = false;
    echo "<div class='box warning'>💡 <strong>Solução:</strong> Execute <code>composer install</code> na pasta backend/</div>";
}

// ============================================================
// 6. Pasta database/ (Permissões de Escrita)
// ============================================================
echo "<h2>6. Pasta database/ (Permissões)</h2>";
$dbDir = __DIR__ . '/../database';
$dbDirExists = is_dir($dbDir);
$class = $dbDirExists ? 'pass' : 'error';
$status = $dbDirExists ? '<span class="ok">✅ Existe</span>' : '<span class="fail">❌ NÃO EXISTE</span>';
echo "<div class='box $class'>Diretório database/: $status<br><small>Caminho: " . realpath($dbDir) . "</small></div>";

if ($dbDirExists) {
    $dbWritable = is_writable($dbDir);
    $class = $dbWritable ? 'pass' : 'error';
    $status = $dbWritable ? '<span class="ok">✅ Gravável</span>' : '<span class="fail">❌ SEM PERMISSÃO DE ESCRITA</span>';
    echo "<div class='box $class'>Permissão de escrita em database/: $status</div>";
    if (!$dbWritable) {
        $allPassed = false;
        $currentUser = function_exists('posix_getpwuid') ? posix_getpwuid(posix_geteuid())['name'] : get_current_user();
        echo "<div class='box warning'>💡 PHP está rodando como: <strong>$currentUser</strong><br>";
        echo "Execute: <code>sudo chown -R $currentUser:$currentUser " . realpath($dbDir) . " && sudo chmod -R 775 " . realpath($dbDir) . "</code></div>";
    }
    
    // Verificar items.json
    $itemsPath = $dbDir . '/items.json';
    if (file_exists($itemsPath)) {
        $itemsWritable = is_writable($itemsPath);
        $class = $itemsWritable ? 'pass' : 'error';
        $status = $itemsWritable ? '<span class="ok">✅ Gravável</span>' : '<span class="fail">❌ SEM PERMISSÃO</span>';
        echo "<div class='box $class'>items.json: $status (Tamanho: " . filesize($itemsPath) . " bytes)</div>";
        if (!$itemsWritable) $allPassed = false;
    } else {
        // Tentar criar
        $created = @file_put_contents($itemsPath, json_encode([]));
        if ($created !== false) {
            echo "<div class='box pass'>items.json: <span class='ok'>✅ Criado com sucesso</span></div>";
        } else {
            echo "<div class='box error'>items.json: <span class='fail'>❌ Não foi possível criar</span></div>";
            $allPassed = false;
        }
    }
} else {
    $allPassed = false;
    // Tentar criar a pasta
    echo "<div class='box warning'>💡 Tentando criar pasta database/...</div>";
    if (@mkdir($dbDir, 0775, true)) {
        @file_put_contents($dbDir . '/items.json', json_encode([]));
        echo "<div class='box pass'>Pasta database/ criada: <span class='ok'>✅ OK</span></div>";
    } else {
        echo "<div class='box error'>Não foi possível criar: <span class='fail'>❌ Sem permissão</span></div>";
    }
}

// ============================================================
// 7. Arquivo .env
// ============================================================
echo "<h2>7. Arquivo .env</h2>";
$envPath = __DIR__ . '/../.env';
$envExists = file_exists($envPath);
$class = $envExists ? 'pass' : 'error';
$status = $envExists ? '<span class="ok">✅ Encontrado</span>' : '<span class="fail">❌ NÃO ENCONTRADO</span>';
echo "<div class='box $class'>.env: $status</div>";
if (!$envExists) $allPassed = false;

if ($envExists) {
    $envContent = file_get_contents($envPath);
    $hasCRLF = strpos($envContent, "\r\n") !== false;
    if ($hasCRLF) {
        echo "<div class='box warning'>.env tem line endings Windows (CRLF): <span class='warn'>⚠️ Pode causar problemas</span><br>";
        echo "<small>Execute: <code>sed -i 's/\\r\$//' " . realpath($envPath) . "</code></small></div>";
    } else {
        echo "<div class='box pass'>Line endings .env: <span class='ok'>✅ Unix (LF)</span></div>";
    }
    
    // Verificar variáveis carregadas
    $envVars = ['SMTP_HOST', 'SMTP_PORT', 'MAIL_FROM'];
    // Simular carregamento do .env
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0 || strpos($line, '=') === false) continue;
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        putenv(sprintf('%s=%s', $name, $value));
    }
    foreach ($envVars as $var) {
        $val = getenv($var);
        $hasValue = !empty($val);
        $class = $hasValue ? 'pass' : 'warning';
        $displayVal = $var === 'SMTP_PASS' ? '***' : $val;
        $status = $hasValue ? '<span class="ok">✅ ' . htmlspecialchars($displayVal) . '</span>' : '<span class="warn">⚠️ Vazio</span>';
        echo "<div class='box $class'>$var: $status</div>";
    }
}

// ============================================================
// 8. Line Endings dos Arquivos PHP
// ============================================================
echo "<h2>8. Line Endings dos Arquivos PHP</h2>";
$phpFiles = [
    __DIR__ . '/index.php',
    __DIR__ . '/../app/Domain/Model/CollectedItem.php',
    __DIR__ . '/../app/Presentation/Controller/CollectController.php',
];
$hasCRLFIssues = false;
foreach ($phpFiles as $f) {
    if (file_exists($f)) {
        $content = file_get_contents($f);
        $isCRLF = strpos($content, "\r\n") !== false;
        $basename = basename($f);
        if ($isCRLF) {
            echo "<div class='box warning'>$basename: <span class='warn'>⚠️ CRLF (Windows)</span></div>";
            $hasCRLFIssues = true;
        } else {
            echo "<div class='box pass'>$basename: <span class='ok'>✅ LF (Unix)</span></div>";
        }
    }
}
if ($hasCRLFIssues) {
    echo "<div class='box warning'>💡 Converter para LF: <code>find . -name '*.php' -exec sed -i 's/\\r\$//' {} \\;</code></div>";
}

// ============================================================
// 9. Teste de Escrita Real
// ============================================================
echo "<h2>9. Teste de Escrita Real</h2>";
$testFile = __DIR__ . '/../database/test_write_' . time() . '.tmp';
$writeResult = @file_put_contents($testFile, 'test');
if ($writeResult !== false) {
    @unlink($testFile);
    echo "<div class='box pass'>Teste de escrita em database/: <span class='ok'>✅ OK</span></div>";
} else {
    echo "<div class='box error'>Teste de escrita em database/: <span class='fail'>❌ FALHA — Sem permissão de escrita!</span></div>";
    $allPassed = false;
}

// ============================================================
// 10. Informações do Servidor
// ============================================================
echo "<h2>10. Informações do Servidor</h2>";
echo "<div class='box pass'>";
echo "OS: <strong>" . PHP_OS . "</strong><br>";
echo "SAPI: <strong>" . php_sapi_name() . "</strong><br>";
echo "Document Root: <strong>" . ($_SERVER['DOCUMENT_ROOT'] ?? 'N/A') . "</strong><br>";
echo "Script: <strong>" . ($_SERVER['SCRIPT_FILENAME'] ?? 'N/A') . "</strong><br>";
if (function_exists('posix_getpwuid')) {
    $userInfo = posix_getpwuid(posix_geteuid());
    echo "Usuário PHP: <strong>" . $userInfo['name'] . "</strong><br>";
} else {
    echo "Usuário PHP: <strong>" . get_current_user() . "</strong><br>";
}
echo "</div>";

// ============================================================
// Resultado Final
// ============================================================
echo "<h2>Resultado Final</h2>";
if ($allPassed) {
    echo "<div class='box pass' style='text-align:center;font-size:18px;padding:25px'>";
    echo "🎉 <span class='ok'>TODOS OS TESTES PASSARAM!</span><br>";
    echo "<small>Se o erro persistir, verifique a configuração do NGINX (fastcgi_pass)</small>";
    echo "</div>";
} else {
    echo "<div class='box error' style='text-align:center;font-size:18px;padding:25px'>";
    echo "⚠️ <span class='fail'>PROBLEMAS ENCONTRADOS — Corrija os itens marcados com ❌ acima</span>";
    echo "</div>";
}

echo "<p style='text-align:center;color:#666;margin-top:30px'>⚠️ <strong>Remova este arquivo após o diagnóstico!</strong></p>";
echo "</body></html>";
