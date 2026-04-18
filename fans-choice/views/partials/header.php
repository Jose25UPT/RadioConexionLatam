<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once dirname(__DIR__, 2) . '/config/app.php';
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
    <link rel="stylesheet" href="<?php echo APP_BASE; ?>/assets/css/inicio.css">
</head>
<body>
    <header class="main-header">
        <div class="title-container">
            <a href="https://www.radioconexionlatam.net.pe" target="_blank">
                <img src="<?php echo APP_BASE; ?>/assets/img/favicon.ico" alt="Logo LATAM Awards" class="logo-icon" />
            </a>
            <h1 class="event-title">LATAM Awards - <span>Fans Choice</span></h1>
        </div>

        <input type="checkbox" id="menu-toggle" />
        <label for="menu-toggle" class="menu-toggle-label">
            <span></span>
            <span></span>
            <span></span>
        </label>

        <nav class="main-nav">
            <ul>
                <li><a href="https://www.radioconexionlatam.net.pe/" class="btn-back">&#8592; Visítanos</a></li>
                <li><a href="<?php echo APP_BASE; ?>/">Inicio</a></li>
                <?php /* Ocultos por solicitud del cliente — no eliminar
                <li><a href="https://docs.google.com/document/d/1yt-MV8csmsN7eWlvLPHZg23YgefnbLeGnJrWIWm2guc/edit?tab=t.0" target="_blank">Bases del Reglamento</a></li>
                <li><a href="<?php echo APP_BASE; ?>/assets/LATAM Awards - Fans Choice 2025 Bases.pdf" download="LATAM Awards - Fans Choice 2025 Bases.pdf">Descargar Bases PDF</a></li>
                */ ?>
            </ul>
        </nav>
    </header>
