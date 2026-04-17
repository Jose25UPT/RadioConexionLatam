<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../models/VotoModel.php';

class VotacionController {
    private $votoModel;

    public function __construct() {
        $this->votoModel = new VotoModel();
    }

    public function index() {
        if (!isset($_SESSION['access_token'])) {
            header('Location: ' . APP_BASE . '/');
            exit();
        }

        if (!isset($_SESSION['votante_id'])) {
            die('Error: No se ha identificado al votante.');
        }

        $votante_id  = $_SESSION['votante_id'];
        $categorias  = $this->votoModel->obtenerCategorias() ?? [];
        $votosPrevios = $this->votoModel->obtenerVotosPorVotante($votante_id) ?? [];
        $votados     = [];

        foreach ($votosPrevios as $voto) {
            $votados[$voto['categoria']] = $voto['opcion'];
        }

        include __DIR__ . '/../views/votacion.php';
    }

    public function procesarVoto() {
        if (!isset($_SESSION['votante_id'])) {
            echo json_encode(['status' => 'error', 'message' => 'Debes iniciar sesión para votar.']);
            exit();
        }

        $inputJSON = file_get_contents('php://input');
        $data      = json_decode($inputJSON, true);

        if (!$data || !isset($data['categoria']) || !isset($data['opcion'])) {
            echo json_encode(['status' => 'error', 'message' => 'Datos inválidos.']);
            exit();
        }

        // Validar CSRF token
        $csrfToken = $data['csrf_token'] ?? '';
        if (empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $csrfToken)) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Token de seguridad inválido.']);
            exit();
        }

        $votante_id = $_SESSION['votante_id'];
        $categoria  = filter_var($data['categoria'], FILTER_VALIDATE_INT);
        $opcion     = filter_var($data['opcion'],    FILTER_VALIDATE_INT);

        if (!$categoria || !$opcion) {
            echo json_encode(['status' => 'error', 'message' => 'Datos no válidos.']);
            exit();
        }

        // Whitelist: número máximo de candidatos por categoría
        $opciones_validas = [
            1  => 4,  // Cosplayer
            2  => 5,  // Evento viral
            3  => 5,  // Tienda favorita
            4  => 5,  // Creador de contenido
            5  => 4,  // Animador de eventos geek
            6  => 4,  // Banda musical
            7  => 4,  // Streamer
            8  => 5,  // Influencer
            9  => 4,  // Medio informativo geek
            10 => 4,  // Reportero geek
        ];

        if (!isset($opciones_validas[$categoria]) || $opcion < 1 || $opcion > $opciones_validas[$categoria]) {
            echo json_encode(['status' => 'error', 'message' => 'Opción no válida para esta categoría.']);
            exit();
        }

        if ($this->votoModel->obtenerVotoPorCategoria($votante_id, $categoria)) {
            echo json_encode(['status' => 'error', 'message' => 'Ya has votado en esta categoría.']);
            exit();
        }

        $response = $this->votoModel->registrarVoto($votante_id, $categoria, $opcion);

        if ($response) {
            echo json_encode(['status' => 'success', 'message' => 'Voto registrado correctamente.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'No se pudo registrar el voto. Inténtalo de nuevo.']);
        }
    }
}
