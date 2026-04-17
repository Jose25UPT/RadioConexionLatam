<?php
require_once dirname(__DIR__, 2) . '/config/app.php';
?>
<footer class="site-footer">
    <div class="footer-inner">
        <div class="footer-logo">
            <img src="<?php echo APP_BASE; ?>/assets/img/favicon.ico" alt="Logo LATAM Awards">
            <span>LATAM Awards - Fans Choice</span>
        </div>
        <ul class="footer-links">
            <li><a href="<?php echo APP_BASE; ?>/terminos">Términos y Condiciones</a></li>
            <li><a href="<?php echo APP_BASE; ?>/politicas">Políticas de Privacidad</a></li>
        </ul>
        <p class="footer-copy">&copy; <?php echo date('Y'); ?> Radio Conexión LATAM. Todos los derechos reservados.</p>
    </div>
</footer>
</body>
</html>
