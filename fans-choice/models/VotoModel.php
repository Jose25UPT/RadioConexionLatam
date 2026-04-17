<?php
require_once __DIR__ . '/../config/database.php';

class VotoModel {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function obtenerCategorias() {
        $query = "SELECT * FROM categorias";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function obtenerVotosPorVotante($votante_id) {
        $query = "SELECT categoria, opcion FROM votos WHERE votante_id = :votante_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':votante_id', $votante_id, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
        if (!$result) {
            return [];
        }
    
        return $result;
    }
    
    
    public function obtenerVotoPorCategoria($votante_id, $categoria) {
        $query = "SELECT * FROM votos WHERE votante_id = :votante_id AND categoria = :categoria";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':votante_id', $votante_id, PDO::PARAM_INT);
        $stmt->bindParam(':categoria', $categoria, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function registrarVoto($votante_id, $categoria, $opcion) {
        $query = "INSERT INTO votos (votante_id, categoria, opcion) VALUES (:votante_id, :categoria, :opcion)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':votante_id', $votante_id, PDO::PARAM_INT);
        $stmt->bindParam(':categoria', $categoria, PDO::PARAM_INT);
        $stmt->bindParam(':opcion', $opcion, PDO::PARAM_INT);
        if ($stmt->execute()) {
            return ['status' => 'success', 'message' => 'Voto registrado correctamente.'];
        } else {
            return ['status' => 'error', 'message' => 'Error al registrar el voto.'];
        }
    }
    
}
?>
