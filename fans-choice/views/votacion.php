<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../config/database.php';

// Expiración absoluta de sesión: 4 horas desde el login
$session_max_lifetime = 4 * 3600;
if (isset($_SESSION['LOGIN_TIME']) && (time() - $_SESSION['LOGIN_TIME']) > $session_max_lifetime) {
    session_unset();
    session_destroy();
    header('Location: ' . APP_BASE . '/');
    exit();
}

// Expiración por inactividad: 20 minutos
$session_idle = 1200;
if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY']) > $session_idle) {
    session_unset();
    session_destroy();
    header('Location: ' . APP_BASE . '/');
    exit();
}
$_SESSION['LAST_ACTIVITY'] = time();

// Verificar autenticación
if (!isset($_SESSION['access_token'])) {
    header('Location: ' . APP_BASE . '/');
    exit();
}

// Asegurar que la variable votante_id esté definida
if (!isset($_SESSION['votante_id'])) {
    die("Error: No se ha identificado al votante.");
}

$votante_id = $_SESSION['votante_id'];

// Obtener conexión a la base de datos
$db = new Database();
$conn = $db->getConnection();

// Consultar votos anteriores
$query = "SELECT categoria, opcion FROM votos WHERE votante_id = :votante_id";
$stmt = $conn->prepare($query);
$stmt->bindParam(':votante_id', $votante_id, PDO::PARAM_INT);
$stmt->execute();
$votosPrevios = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Inicializar la variable para almacenar los votos previos
$votados = [];
foreach ($votosPrevios as $voto) {
    $votados[$voto['categoria']] = $voto['opcion'];
}

// Formato: id => ['Nombre mostrado', 'carpeta en assets/img', ['imagen1', ...]]
$categorias_con_candidatos = [
    1  => ['Cosplayer',              'Cosplayer',              [
        '1 milcarastacna.jpg',
        'Arthur.jpg',
        'BrutuS.jpg',
        'Tora 7.jpg',
    ]],
    2  => ['Evento viral',           'EventoViral',            [
        'Coches locos.jpg',
        'Día del rock tacneño 2025.jpg',
        'FestiGAL otaku.jpg',
        'Juegos del calamar.jpg',
        'Natsukoi III.jpg',
    ]],
    3  => ['Tienda favorita',        'Tienda favorita',        [
        'Asia novedades Tacna.jpg',
        'Meraki.jpg',
        'TACNA_CELL.jpg',
        'Yume Sekai.jpg',
        'mijo_store.jpg',
    ]],
    4  => ['Creador de contenido',   'Creador de contenido',   [
        'CONEXIÓN TACNA.jpg',
        'DESCONECTADOS.jpg',
        'El Tío Moneda.jpg',
        'IritaGamer.jpg',
        'Somos Tacna.jpg',
    ]],
    5  => ['Animador de eventos geek','Animador de eventos geek',[
        'Aceitunita.jpg',
        'Kirara Neko Chan.jpg',
        'Lumaru chan.jpg',
        'Pollosor.jpg',
    ]],
    6  => ['Banda musical',          'Banda musical',          [
        'Bleseé.jpg',
        'Fuego artificial.jpg',
        'Gato traumado.jpg',
        'Isla nagori.jpg',
    ]],
    7  => ['Streamer',               'Streamer',               [
        'DHAYANA PALMEIRA “La loba”.jpg',
        "Retr'OS - Tacna.jpg",
        'leaosggg.jpg',
        'yapecausita.jpg',
    ]],
    8  => ['Influencer',             'Influencer',             [
        'Elmero_Loco.jpg',
        'La Nona.jpg',
        'Polett.jpeg',
        'Tocache - Colors.jpg',
        'olitacna.jpeg',
    ]],
    9  => ['Medio informativo geek', 'Medio informativo geek', [
        'Estudio Geek.jpg',
        'LUAN TV.jpg',
        'La Hora Friki Oficial.jpg',
        'Shinsekai Tacna.jpg',
    ]],
    10 => ['Reportero geek',         'Reportero geek',         [
        'Alnold Smith Tongo.jpg',
        'Bruno Ghersi.jpg',
        'Jordan Flores.jpg',
        'Luizito Garcia Flores.jpg',
    ]],
];

// CSRF token de sesión (generado una sola vez por sesión)
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
$csrf_token = $_SESSION['csrf_token'];

// Verificar si el usuario ha votado en todas las categorías
$haVotadoEnTodas = count($votados) === count($categorias_con_candidatos);
?>

<?php include __DIR__ . '/partials/header_votacion.php'; ?>
<main>
    <h2>VOTACIÓN</h2>
    <form id="votingForm">
        <?php 
        foreach ($categorias_con_candidatos as $categoria_id => [$nombre_categoria, $carpeta, $candidatos]):
            $yaVotado = isset($votados[$categoria_id]);
        ?>
        <section id="categoria-<?php echo $categoria_id; ?>" class="reportero-container <?php echo $yaVotado ? 'votado' : ''; ?>">
            <h3><?php echo htmlspecialchars($nombre_categoria); ?></h3>
            <div class="candidatos">
                <?php foreach ($candidatos as $indice => $candidato):
                    $imagen_candidato = APP_BASE . "/assets/img/" . rawurlencode($carpeta) . "/" . rawurlencode($candidato);
                    $nombre_candidato = pathinfo($candidato, PATHINFO_FILENAME);
                    $seleccionado = ($yaVotado && $votados[$categoria_id] == $indice + 1) ? 'selected' : '';
                    $deshabilitado = $yaVotado ? 'disabled' : '';
                ?>
                <label class="candidato <?php echo $seleccionado ? 'votado-candidato' : ''; ?>">
                    <input type="radio" name="categoria_<?php echo $categoria_id; ?>" 
                           value="<?php echo $indice + 1; ?>" 
                           class="hidden-radio" 
                           <?php echo $deshabilitado; ?>
                           <?php echo $seleccionado ? 'checked' : ''; ?>>
                    <img src="<?php echo $imagen_candidato; ?>" 
                         alt="<?php echo $nombre_candidato; ?>" 
                         class="<?php echo $seleccionado ? 'selected' : ''; ?>">
                    <p><?php echo $nombre_candidato; ?></p>
                    <?php if ($seleccionado): ?>
                        <span class="vote-result"></span>
                    <?php endif; ?>
                </label>
                <?php endforeach; ?>
            </div>
            <?php if (!$yaVotado): ?>
                <button type="button" class="btn-votar" onclick="votar('<?php echo $categoria_id; ?>')">Votar</button>
            <?php else: ?>
                <p class="votado-text">Resultados registrados</p>
            <?php endif; ?>
        </section>
        <?php endforeach; ?>

    </form>

    <!-- Resumen de votación como popup si se ha votado en todas las categorías -->
    <?php if ($haVotadoEnTodas): ?>
    <div id="popup" class="popup active">
        <div class="popup-content">
            <div class="popup-banner">
                <span class="close-btn" onclick="cerrarPopup()" title="Cerrar">&times;</span>
                <h2>¡Votación Completa!</h2>
                <p>Gracias por participar en LATAM Awards - Fans Choice</p>
            </div>
            <div class="popup-body">
                <ul>
                    <?php foreach ($votados as $categoria_id => $opcion): ?>
                        <li>
                            <strong><?php echo htmlspecialchars($categorias_con_candidatos[$categoria_id][0]); ?>:</strong>
                            <?php echo htmlspecialchars(pathinfo($categorias_con_candidatos[$categoria_id][2][$opcion - 1], PATHINFO_FILENAME)); ?>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
            <div class="popup-footer">
                <a href="https://www.radioconexionlatam.net.pe/" target="_blank" class="popup-footer a btn-visit">
                    🌐 Visítanos en Radio Conexión LATAM
                </a>
            </div>
        </div>
    </div>
    <script>
    function cerrarPopup() {
        document.getElementById('popup').classList.remove('active');
    }
    </script>
    <?php endif; ?>

</main>

<script>
window.APP_BASE  = '<?php echo addslashes(APP_BASE); ?>';
window.CSRF_TOKEN = '<?php echo $csrf_token; ?>';
</script>
<script src="<?php echo APP_BASE; ?>/assets/js/body.js"></script>
<?php include __DIR__ . '/partials/footer.php'; ?>

<style>
/* ── POPUP RESUMEN ── */
.popup {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(30, 10, 50, 0.7);
    backdrop-filter: blur(4px);
    z-index: 9999;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}
.popup.active { display: flex; }

.popup-content {
    background: #fff;
    width: 100%;
    max-width: 580px;
    max-height: 88vh;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(91,44,111,0.35);
    display: flex;
    flex-direction: column;
    animation: popIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes popIn {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
}

/* Franja superior degradada */
.popup-banner {
    background: linear-gradient(135deg, #5B2C6F, #8E44AD);
    padding: 1.5rem 1.5rem 1.2rem;
    text-align: center;
    position: relative;
}
.popup-banner h2 {
    color: #fff;
    font-size: 1.5rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 0 0 0.3rem;
}
.popup-banner p {
    color: rgba(255,255,255,0.75);
    font-size: 0.9rem;
    margin: 0;
}
.close-btn {
    position: absolute;
    top: 0.8rem;
    right: 1rem;
    font-size: 1.5rem;
    color: rgba(255,255,255,0.7);
    cursor: pointer;
    line-height: 1;
    transition: color 0.2s ease, transform 0.2s ease;
}
.close-btn:hover { color: #fff; transform: rotate(90deg); }

/* Cuerpo scrollable */
.popup-body {
    overflow-y: auto;
    flex: 1;
    padding: 0;
}
.popup-body ul {
    list-style: none;
    margin: 0;
    padding: 0;
}
.popup-body li {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.85rem 1.5rem;
    border-bottom: 1px solid #f0e8f8;
    font-size: 0.95rem;
    color: #333;
}
.popup-body li:last-child { border-bottom: none; }
.popup-body li::before {
    content: '✓';
    color: #4CAF50;
    font-weight: 900;
    font-size: 1rem;
    flex-shrink: 0;
}
.popup-body li strong { color: #5B2C6F; font-weight: 700; }

/* Footer del popup */
.popup-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #f0e8f8;
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
}
.popup-footer a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0.6rem 1.5rem;
    border-radius: 30px;
    font-weight: 700;
    font-size: 0.9rem;
    text-decoration: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.btn-visit {
    background: linear-gradient(135deg, #2ecc71, #27ae60);
    color: #fff;
    box-shadow: 0 4px 12px rgba(46,204,113,0.4);
}
.btn-visit:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(46,204,113,0.5); }

@media (max-width: 480px) {
    .popup-banner h2 { font-size: 1.2rem; }
    .popup-body li { font-size: 0.88rem; padding: 0.7rem 1rem; }
}
</style>
