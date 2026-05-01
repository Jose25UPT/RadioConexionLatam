<?php
/**
 * Configuración central de la aplicación.
 * APP_BASE: sub-ruta donde vive el proyecto (vacío si está en la raíz del dominio).
 * Se calcula automáticamente a partir del SCRIPT_NAME, por lo que funciona tanto
 * en local (/radiolatam/Fans-Choice) como en producción (/ o /fans-choice).
 */
define('VOTACION_CERRADA', true);

if (!defined('APP_BASE')) {
    $envBase = getenv('FC_APP_BASE');
    if ($envBase !== false && $envBase !== '') {
        define('APP_BASE', rtrim($envBase, '/'));
    } else {
        $script = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '/index.php');
        $dir    = dirname($script);
        $dir    = ($dir === '/' || $dir === '.') ? '' : rtrim($dir, '/');
        define('APP_BASE', $dir);
    }
}
