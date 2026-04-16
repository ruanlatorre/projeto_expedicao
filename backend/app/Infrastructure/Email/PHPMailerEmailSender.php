<?php

namespace App\Infrastructure\Email;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class PHPMailerEmailSender implements EmailSender
{
    private string $host;
    private int $port;
    private bool $auth;
    private string $username;
    private string $password;
    private string $secure;
    private string $fromEmail;
    private string $fromName;

    public function __construct()
    {
        $this->host = getenv('SMTP_HOST') ?: 'smtp.gmail.com';
        $this->port = (int)(getenv('SMTP_PORT') ?: 587);
        $this->auth = filter_var(getenv('SMTP_AUTH') ?: 'true', FILTER_VALIDATE_BOOLEAN);
        $this->username = getenv('SMTP_USER') ?: '';
        $this->password = getenv('SMTP_PASS') ?: '';
        $this->secure = getenv('SMTP_SECURE') ?: 'tls'; // tls, ssl, ou none
        $this->fromEmail = getenv('MAIL_FROM') ?: '';
        $this->fromName = getenv('MAIL_NAME') ?: 'Facchini Data Collection';
    }

    public function send(string $to, string $subject, string $body): void
    {
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = $this->host;
            $mail->Port = $this->port;
            $mail->CharSet = 'UTF-8';

            // Autenticação (desabilitada para relay)
            $mail->SMTPAuth = $this->auth;
            if ($this->auth) {
                $mail->Username = $this->username;
                $mail->Password = $this->password;
            }

            // Criptografia (desabilitada para relay)
            if ($this->secure === 'tls') {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            } elseif ($this->secure === 'ssl') {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            } else {
                $mail->SMTPSecure = '';
                $mail->SMTPAutoTLS = false;
            }

            $mail->setFrom($this->fromEmail, $this->fromName);
            $mail->addAddress($to);

            $mail->isHTML(false);
            $mail->Subject = $subject;
            $mail->Body = $body;

            $mail->send();
        }
        catch (Exception $e) {
            throw new \Exception("Falha ao enviar e-mail: {$mail->ErrorInfo}");
        }
    }
}

