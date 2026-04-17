<?php
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/controllers/AuthController.php';

$authController = new AuthController();
$authController->login();
