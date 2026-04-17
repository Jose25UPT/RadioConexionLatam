<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once dirname(__DIR__, 2) . '/config/app.php';

$votante_id   = $_SESSION['votante_id']      ?? '0';
$hashed_email = $_SESSION['user_email_hash'] ?? '';
$codigo_usuario = "código: {$votante_id}" . substr($hashed_email, 0, 10);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LATAM Awards - Fans Choice</title>
    <link rel="icon" href="<?php echo APP_BASE; ?>/assets/img/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="<?php echo APP_BASE; ?>/assets/css/nav.css">
    <link rel="stylesheet" href="<?php echo APP_BASE; ?>/assets/css/body.css">
    <link rel="stylesheet" href="<?php echo APP_BASE; ?>/assets/css/google.css">
</head>
<body>
<header class="main-header">
    <div class="title-container">
        <img src="<?php echo APP_BASE; ?>/assets/img/favicon.ico" alt="Logo LATAM Awards" class="logo-icon" />
        <h1 class="event-title">LATAM Awards - <span>Fans Choice</span></h1>
    </div>

    <div class="user-info">
        <div class="user-details">
            <span class="user-name"><?php echo htmlspecialchars($codigo_usuario); ?></span>
        </div>
        <a href="<?php echo APP_BASE; ?>/logout.php" class="logout-button">Cerrar sesión</a>
    </div>
</header>
