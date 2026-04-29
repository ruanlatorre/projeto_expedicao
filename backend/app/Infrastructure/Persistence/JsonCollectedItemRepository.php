<?php
// backend/app/Infrastructure/Persistence/JsonCollectedItemRepository.php

namespace App\Infrastructure\Persistence;

use App\Domain\Model\CollectedItem;
use App\Domain\Repository\CollectedItemRepository;

class JsonCollectedItemRepository implements CollectedItemRepository
{
    private string $filePath;

    public function __construct()
    {
        // Usar caminhos absolutos baseados no diretório do script para evitar problemas de CWD no Linux
        $baseDir = dirname(__DIR__, 3);
        
        // Sempre usar barra normal (/) — funciona tanto no Windows quanto no Linux
        $this->filePath = str_replace('\\', '/', $baseDir) . '/database/items.json';
        
        $dbDir = dirname($this->filePath);
        
        if (!is_dir($dbDir)) {
            if (!@mkdir($dbDir, 0775, true)) {
                throw new \RuntimeException(
                    "Não foi possível criar a pasta database/. " .
                    "Verifique as permissões do diretório pai para o usuário PHP-FPM (geralmente www-data). " .
                    "Execute: sudo chown -R www-data:www-data " . dirname($dbDir)
                );
            }
        }
        
        if (!is_writable($dbDir)) {
            throw new \RuntimeException(
                "A pasta database/ não tem permissão de escrita para o usuário PHP. " .
                "No Nginx/Linux, execute: sudo chown -R www-data:www-data " . $dbDir . " && chmod -R 775 " . $dbDir
            );
        }
        
        if (!file_exists($this->filePath)) {
            if (@file_put_contents($this->filePath, json_encode([], JSON_PRETTY_PRINT)) === false) {
                throw new \RuntimeException(
                    "Não foi possível criar items.json em: " . $this->filePath
                );
            }
        }
    }

    private function readItems(): array
    {
        $content = @file_get_contents($this->filePath);
        if ($content === false) {
            return [];
        }
        $data = json_decode($content, true);
        return is_array($data) ? $data : [];
    }

    private function writeItems(array $items): void
    {
        $data = json_encode(array_values($items), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        // Usar file locking para evitar condições de corrida em acessos simultâneos
        $fp = fopen($this->filePath, 'c');
        if ($fp === false) {
            throw new \RuntimeException("Não foi possível abrir items.json para escrita.");
        }
        
        if (flock($fp, LOCK_EX)) {
            ftruncate($fp, 0);
            rewind($fp);
            fwrite($fp, $data);
            fflush($fp);
            flock($fp, LOCK_UN);
        }
        
        fclose($fp);
    }

    public function save(CollectedItem $item): void
    {
        $items = $this->readItems();
        
        $id = $item->getId() ?? (int)(microtime(true) * 1000); // Milisegundos como ID
        
        $items[] = [
            'id' => $id,
            'code' => $item->getCode(),
            'timestamp' => $item->getTimestamp()->format('Y-m-d H:i:s'),
            'scan_count' => $item->getScanCount()
        ];
        
        $this->writeItems($items);
    }

    public function findAll(): array
    {
        $itemsData = $this->readItems();
        $items = [];
        
        foreach ($itemsData as $data) {
            $items[] = new CollectedItem(
                $data['code'],
                $data['id'],
                new \DateTimeImmutable($data['timestamp']),
                $data['scan_count'] ?? 1
            );
        }
        
        return $items;
    }

    public function deleteAll(): void
    {
        $this->writeItems([]);
    }

    public function deleteById(int $id): void
    {
        $items = $this->readItems();
        $filteredItems = array_filter($items, fn($item) => $item['id'] !== $id);
        $this->writeItems($filteredItems);
    }

    public function existsByCode(string $code): bool
    {
        $items = $this->readItems();
        foreach ($items as $item) {
            if ($item['code'] === $code) {
                return true;
            }
        }
        return false;
    }

    public function incrementScanCount(string $code): void
    {
        $items = $this->readItems();
        foreach ($items as &$item) {
            if ($item['code'] === $code) {
                $item['scan_count'] = ($item['scan_count'] ?? 1) + 1;
                $item['timestamp'] = date('Y-m-d H:i:s');
                break;
            }
        }
        $this->writeItems($items);
    }

    public function findByCode(string $code): ?CollectedItem
    {
        $items = $this->readItems();
        foreach ($items as $data) {
            if ($data['code'] === $code) {
                return new CollectedItem(
                    $data['code'],
                    $data['id'],
                    new \DateTimeImmutable($data['timestamp']),
                    $data['scan_count'] ?? 1
                );
            }
        }
        return null;
    }
}
