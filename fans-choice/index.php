<?php
// En producción los errores se loguean, nunca se muestran al visitante
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/error.log');

// Autoload de Composer
require_once __DIR__ . '/vendor/autoload.php';

// Cargar .env si existe (desarrollo local). En producción Docker las vars vienen del entorno.
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

// BASE_PATH (sistema de ficheros) y APP_BASE (URL)
define('BASE_PATH', __DIR__);
require_once __DIR__ . '/config/app.php';

// Iniciar sesión una sola vez
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ── Obtener la ruta solicitada ────────────────────────────────────────────────
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_uri = str_replace('\\', '/', $request_uri);

// Quitar el prefijo de subcarpeta (APP_BASE) para quedarnos con la ruta limpia
if (APP_BASE !== '' && stripos($request_uri, APP_BASE) === 0) {
    $request_uri = substr($request_uri, strlen(APP_BASE));
}
$request_uri = trim($request_uri, '/');
$request_uri = strtolower($request_uri);

// ── Tabla de rutas ────────────────────────────────────────────────────────────
$routes = [
    ''                => ['view',       'views/inicio.php'],
    'inicio'          => ['view',       'views/inicio.php'],
    'terminos'        => ['view',       'views/terminos.php'],
    'politicas'       => ['view',       'views/politicas.php'],
    'votacion'        => ['controller', 'VotacionController', 'index'],
    'procesar_voto'   => ['controller', 'VotacionController', 'procesarVoto'],
    'logout'          => ['view',       'logout.php'],
];

// ── Despacho ──────────────────────────────────────────────────────────────────
if (!array_key_exists($request_uri, $routes)) {
    http_response_code(404);
    echo "Error 404: Página no encontrada. [ruta: " . htmlspecialchars($request_uri) . "]";
    exit();
}

[$type, $target, $action] = array_pad($routes[$request_uri], 3, null);

if ($type === 'view') {
    require_once BASE_PATH . '/' . $target;
    exit();
}

// Controlador
if ($type === 'controller') {
    require_once BASE_PATH . '/controllers/' . $target . '.php';
    $controller = new $target();

    if ($target === 'VotacionController') {
        if ($request_uri === 'procesar_voto') {
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405);
                echo "Método no permitido.";
                exit();
            }
            $controller->procesarVoto();
        } else {
            $controller->index();
        }
    }
    exit();
}
