<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../config/google.php';
require_once __DIR__ . '/../models/VotanteModel.php';

class AuthController {
    private $google_client;
    private $votanteModel;

    public function __construct() {
        global $google_client;
        $this->google_client = $google_client;
        $this->votanteModel  = new VotanteModel();
    }

    public function login() {
        try {
            if (isset($_GET['code'])) {
                $token = $this->google_client->fetchAccessTokenWithAuthCode($_GET['code']);

                if (isset($token['error'])) {
                    throw new Exception('Error de autenticación: ' . htmlspecialchars($token['error']));
                }

                $this->google_client->setAccessToken($token['access_token']);
                $_SESSION['access_token'] = $token['access_token'];

                // Datos del usuario desde Google
                $google_service = new Google_Service_Oauth2($this->google_client);
                $data = $google_service->userinfo->get();

                $_SESSION['user_email_address'] = filter_var($data->getEmail(),   FILTER_SANITIZE_EMAIL);
                $_SESSION['user_image']          = filter_var($data->getPicture(), FILTER_SANITIZE_URL);

                if (!empty($_SESSION['user_email_address'])) {
                    $email     = strtolower(trim($_SESSION['user_email_address']));
                    $emailHash = hash('sha256', $email);
                    $_SESSION['user_email_hash'] = $emailHash;

                    $votante = $this->votanteModel->verificarVotante($emailHash);
                    if (!$votante) {
                        if (!$this->votanteModel->registrarVotante($emailHash)) {
                            throw new Exception('Error al registrar el usuario.');
                        }
                    }

                    $votante = $this->votanteModel->verificarVotante($emailHash);
                    $_SESSION['votante_id'] = $votante['id'];

                    // Fijar hora absoluta de expiración de sesión (4 h)
                    $_SESSION['LOGIN_TIME'] = time();

                    // Prevenir session fixation
                    session_regenerate_id(true);

                    header('Location: ' . APP_BASE . '/votacion');
                    exit();
                } else {
                    throw new Exception('Error: No se obtuvo un correo electrónico válido.');
                }
            } else {
                // Redirigir a Google para iniciar sesión
                header('Location: ' . $this->google_client->createAuthUrl());
                exit();
            }
        } catch (Exception $e) {
            die(htmlspecialchars($e->getMessage()));
        }
    }
}
