<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../config/app.php';

// ── Códigos de error que indican fallo del SERVICIO de Google (no bot detectado)
// En estos casos se falla abierto para no bloquear votaciones legítimas.
// Referencia: https://developers.google.com/recaptcha/docs/verify#error_code_reference
const RECAPTCHA_SERVICE_ERRORS = [
    'invalid-input-secret',   // secret key mal configurada
    'bad-request',            // solicitud malformada del servidor
    'timeout-or-duplicate',   // token expirado o ya usado (puede ser cuota agotada)
];

// ── Procesar POST antes de cualquier output (patrón PRG) ──────────────────────
// Esto evita el diálogo "¿Reenviar formulario?" al pulsar Atrás en el navegador.
if (empty($_SESSION['captcha_ok']) && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['g-recaptcha-response'])) {
    $secretKey   = getenv('FC_RECAPTCHA_SECRET_KEY');
    $responseKey = $_POST['g-recaptcha-response'];
    $userIP      = $_SERVER['REMOTE_ADDR'];

    // Timeout de 5 s: si Google no responde, no bloqueamos al usuario
    $ctx = stream_context_create(['http' => ['timeout' => 5]]);
    $raw = @file_get_contents(
        'https://www.google.com/recaptcha/api/siteverify'
            . '?secret='   . urlencode($secretKey)
            . '&response=' . urlencode($responseKey)
            . '&remoteip=' . urlencode($userIP),
        false, $ctx
    );

    if ($raw === false) {
        // Google no respondió (red, timeout, servicio caído) → fail open
        $_SESSION['captcha_ok']       = true;
        $_SESSION['captcha_fallback'] = true;
    } else {
        $result     = json_decode($raw, true) ?? [];
        $errorCodes = $result['error-codes'] ?? [];

        $isServiceError = !empty(
            array_intersect($errorCodes, RECAPTCHA_SERVICE_ERRORS)
        );

        if ($result['success'] ?? false) {
            // Captcha resuelto correctamente
            $_SESSION['captcha_ok'] = true;
            unset($_SESSION['captcha_fallback']);

        } elseif ($isServiceError) {
            // Error del lado del servicio (no del usuario) → fail open
            $_SESSION['captcha_ok']       = true;
            $_SESSION['captcha_fallback'] = true;
        }
        // Si success=false sin error de servicio → bot detectado → no se setea nada
    }

    // PRG: redirigir siempre después del POST para que el botón Atrás
    // del navegador no genere el diálogo de "reenvío de formulario"
    header('Location: ' . APP_BASE . '/');
    exit();
}

$recaptcha_success = !empty($_SESSION['captcha_ok']);

include __DIR__ . '/partials/header.php';
?>

<style>
/* ── Fondo de la landing ── */
.inicio-bg {
    min-height: calc(100vh - 70px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 1rem;
    background:
        linear-gradient(160deg, rgba(91,44,111,0.08) 0%, rgba(142,68,173,0.06) 50%, rgba(76,175,80,0.05) 100%),
        url('<?php echo APP_BASE; ?>/assets/img/FONDO-CREMA.jpg') center/cover no-repeat;
}

/* ── Tarjeta principal ── */
.card-inicio {
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 12px 48px rgba(91,44,111,0.18);
    overflow: hidden;
    max-width: 1100px;
    width: 100%;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.5s ease;
}
@keyframes slideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
}

@media (min-width: 768px) {
    .card-inicio { flex-direction: row; min-height: 480px; }
}

/* ── Columna imagen ── */
.col-imagen {
    flex: 1;
    background: url('<?php echo APP_BASE; ?>/assets/img/IMAGEN_PRUEBA.png') center/cover no-repeat;
    min-height: 280px;
    position: relative;
}
.col-imagen::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(91,44,111,0.35) 0%, transparent 60%);
}

/* ── Columna formulario ── */
.col-form {
    flex: 1;
    padding: 3rem 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1.2rem;
}

.col-form h2 {
    font-size: 2rem;
    font-weight: 900;
    color: #5B2C6F;
    margin: 0;
    position: relative;
    padding-bottom: 0.6rem;
}
.col-form h2::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0;
    width: 60px; height: 4px;
    background: linear-gradient(90deg, #8E44AD, #ffd700);
    border-radius: 2px;
}

.terms-text {
    font-size: 1rem;
    line-height: 1.7;
    color: #555;
}
.terms-text strong { color: #5B2C6F; }
.terms-text a { color: #8E44AD; text-decoration: underline; font-weight: 600; }
.terms-text a:hover { color: #5B2C6F; text-decoration: none; }

/* ── reCAPTCHA + botón Aceptar ── */
.recaptcha-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
}
.btn-aceptar {
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, #8E44AD, #5B2C6F);
    border: none;
    border-radius: 30px;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(91,44,111,0.4);
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
    letter-spacing: 0.3px;
}
.btn-aceptar:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
}
.btn-aceptar:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(91,44,111,0.5);
}

/* ── Botón Google OAuth ── */
.btn-google {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 0.85rem 2rem;
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, #ea4335, #c0392b);
    border-radius: 30px;
    text-decoration: none;
    box-shadow: 0 4px 14px rgba(234,67,53,0.4);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    width: fit-content;
}
.btn-google::before {
    content: '';
    display: inline-block;
    width: 22px; height: 22px;
    background: url('https://www.google.com/favicon.ico') center/contain no-repeat;
    background-color: #fff;
    border-radius: 50%;
    flex-shrink: 0;
}
.btn-google:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 22px rgba(234,67,53,0.5);
}

@media (max-width: 767px) {
    .col-form { padding: 2rem 1.5rem; }
    .col-form h2 { font-size: 1.6rem; }
    .col-imagen { min-height: 220px; }
}
</style>

<div class="inicio-bg">
<?php if (VOTACION_CERRADA): ?>
    <section class="card-inicio">
        <div class="col-imagen"></div>
        <div class="col-form" style="align-items:center; text-align:center;">
            <span style="font-size:3rem;">🏆</span>
            <h2 style="color:#5B2C6F;">¡Votaciones finalizadas!</h2>
            <div class="terms-text">
                <p>Las votaciones de <strong>LATAM Awards - Fans Choice 2025</strong> han concluido.</p>
                <p>Gracias a todos los que participaron. Los resultados serán anunciados próximamente.</p>
            </div>
            <a href="https://www.radioconexionlatam.net.pe/" class="btn-aceptar" style="text-decoration:none; text-align:center;">
                Volver al inicio
            </a>
        </div>
    </section>
<?php else: ?>
    <!-- PASO 1: Términos + reCAPTCHA (se oculta si captcha ya fue superado) -->
    <section id="terms-section" class="card-inicio" <?php echo $recaptcha_success ? 'style="display:none"' : ''; ?>>
        <div class="col-imagen"></div>
        <div class="col-form">
            <h2>Términos y Condiciones</h2>
            <div class="terms-text">
                <p>Para participar en la votación de <strong>LATAM Awards - Fans Choice</strong>, debes aceptar los términos y condiciones.</p>
                <p>Al hacer clic en <strong>"Aceptar y continuar"</strong>, confirmas que has leído nuestros
                   <a href="<?php echo APP_BASE; ?>/terminos" target="_blank">términos de uso</a> y nuestra
                   <a href="<?php echo APP_BASE; ?>/politicas" target="_blank">política de privacidad</a>.
                </p>
            </div>
            <form id="recaptcha-form" method="POST" class="recaptcha-wrap">
                <div class="g-recaptcha"
                     data-sitekey="<?php echo htmlspecialchars(getenv('FC_RECAPTCHA_SITE_KEY')); ?>"
                     data-callback="onCaptchaResolved"></div>
                <p id="captcha-timeout-msg" style="display:none;color:#e67e22;font-size:0.9rem;">
                    ⚠️ El captcha no cargó. Intenta recargar la página o desactiva bloqueadores de anuncios.
                </p>
                <button id="accept-terms" class="btn-aceptar" type="submit" disabled>
                    Aceptar y continuar
                </button>
            </form>
        </div>
    </section>

    <!-- PASO 2: Login con Google (visible si captcha ya superado) -->
    <section id="google-login-section" class="card-inicio" <?php echo $recaptcha_success ? '' : 'style="display:none"'; ?>>
        <div class="col-imagen"></div>
        <div class="col-form">
            <h2>¡Bienvenido!</h2>
            <div class="terms-text">
                <p>Para participar en la votación de <strong>LATAM Awards - Fans Choice</strong>, inicia sesión con tu cuenta de Google.</p>
                <p>Tu voto es único e irrepetible por categoría.</p>
            </div>
            <a href="<?php echo APP_BASE; ?>/auth.php" class="btn-google">
                Iniciar sesión con Google
            </a>
        </div>
    </section>

    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
    <script>
    function onCaptchaResolved() {
        const btn = document.getElementById('accept-terms');
        if (btn) btn.disabled = false;
    }
    setTimeout(() => {
        const iframe = document.querySelector('.g-recaptcha iframe');
        const section = document.getElementById('terms-section');
        if (!iframe && section && section.style.display !== 'none') {
            document.getElementById('captcha-timeout-msg').style.display = 'block';
            const btn = document.getElementById('accept-terms');
            if (btn) btn.disabled = false;
        }
    }, 6000);
    </script>
<?php endif; ?>
</div>

<?php include __DIR__ . '/partials/footer.php'; ?>
