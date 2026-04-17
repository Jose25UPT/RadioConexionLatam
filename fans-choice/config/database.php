<?php
class Database {
    private $host;
    private $dbname;
    private $user;
    private $password;
    public $conn;

    public function __construct() {
        $this->host     = getenv('FC_DB_HOST');
        $this->dbname   = getenv('FC_DB_NAME');
        $this->user     = getenv('FC_DB_USER');
        $this->password = getenv('FC_DB_PASSWORD');
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $dsn = "mysql:host={$this->host};port=3306;dbname={$this->dbname};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $this->conn = new PDO($dsn, $this->user, $this->password, $options);
        } catch (PDOException $exception) {
            die("Error de conexión a la base de datos: " . $exception->getMessage());
        }
        return $this->conn;
    }
}
?>
