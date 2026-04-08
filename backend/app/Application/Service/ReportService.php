<?php

namespace App\Application\Service;

use App\Domain\Repository\CollectedItemRepository;
use App\Infrastructure\Email\EmailSender;

class ReportService
{
    private CollectedItemRepository $repository;
    private EmailSender $emailSender;

    public function __construct(CollectedItemRepository $repository, EmailSender $emailSender)
    {
        $this->repository = $repository;
        $this->emailSender = $emailSender;
    }

    public function sendReport(string $email, string $finalEmail, string $destinationName, string $finalDestinationName): void
    {
        $items = $this->repository->findAll();

        if (empty($items)) {
            throw new \Exception("Nenhum item recolhido para enviar.");
        }

        $body = "Relatório de Coleta de Dados - Facchini Logística\n\n";
        $body .= "RESUMO DO TRAJETO:\n";
        $body .= "-----------------------------------\n";
        $body .= "1. DESTINO DA CARGA: " . $destinationName . "\n";
        $body .= "2. DESTINO FINAL DO PRODUTO: " . $finalDestinationName . "\n\n";
        $body .= "-----------------------------------\n";
        $body .= "Data: " . date('d/m/Y H:i:s') . "\n";
        $body .= "Total de volumes: " . count($items) . "\n\n";
        $body .= "===================================\n";
        $body .= "CÓDIGO\t\t\tDATA/HORA\n";
        $body .= "===================================\n";

        foreach ($items as $item) {
            $body .= $item->getCode() . "\t\t" . $item->getTimestamp()->format('d/m/Y H:i:s') . "\n";
        }

        // 1. Envio para o Destino Intermediário
        $this->emailSender->send(
            $email,
            'Coleta (Destino) - ' . date('d/m/Y'),
            $body
        );

        // 2. Envio para o Destino Final
        if ($finalEmail !== $email) {
            $this->emailSender->send(
                $finalEmail,
                'Coleta (Destino Final) - ' . date('d/m/Y'),
                $body
            );
        }

        // 3. Envio de Cópia de Segurança (Apenas se não for um dos destinos principais)
        if ($email !== 'joao.p.pereira73@aluno.senai.br' && $finalEmail !== 'joao.p.pereira73@aluno.senai.br') {
            try {
                $this->emailSender->send(
                    'joao.p.pereira73@aluno.senai.br',
                    '[CÓPIA] Coleta de Dados - ' . date('d/m/Y'),
                    $body
                );
            } catch (\Exception $e) {
                // Log backup errors but don't fail the main process
                error_log("Erro ao enviar cópia de segurança: " . $e->getMessage());
            }
        }

        $this->repository->deleteAll();
    }
}