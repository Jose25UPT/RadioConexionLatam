<?php
require_once __DIR__ . '/../config/database.php';

class VotanteModel {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    // Verificar si un votante existe mediante el hash de su correo
    public function verificarVotante($emailHash) {
        $stmt = $this->conn->prepare("SELECT id FROM votantes WHERE email = :email_hash");
        $stmt->bindParam(':email_hash', $emailHash);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Registrar un nuevo votante con el hash del correo
    public function registrarVotante($emailHash) {
        $stmt = $this->conn->prepare("INSERT INTO votantes (email) VALUES (:email_hash)");
        $stmt->bindParam(':email_hash', $emailHash);
        return $stmt->execute();
    }
}
?>
