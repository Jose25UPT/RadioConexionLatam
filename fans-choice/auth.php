<?php
ob_start();

error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/error.log');

require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

require_once __DIR__ . '/config/app.php';

if (VOTACION_CERRADA) {
    header('Location: ' . APP_BASE . '/');
    exit();
}

require_once __DIR__ . '/controllers/AuthController.php';

$authController = new AuthController();
$authController->login();

ob_end_flush();
