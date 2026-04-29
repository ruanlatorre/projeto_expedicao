<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
echo json_encode(["status" => "ok", "message" => "PHP is working", "route" => $_GET['route'] ?? 'none']);
