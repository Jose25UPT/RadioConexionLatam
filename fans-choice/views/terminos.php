<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once __DIR__ . '/../config/app.php';
include __DIR__ . '/partials/header.php';
?>

<main class="terms-container">
    <section>
        <h2>Términos y Condiciones</h2>
        <p>Bienvenido a los LATAM Awards - Fans Choice. Al participar en este evento, aceptas los siguientes términos y condiciones:</p>

        <h3>1. Elegibilidad</h3>
        <p>La participación está abierta a todos los residentes de América Latina que cumplan con los requisitos de inscripción y que estén dispuestos a participar en el proceso de votación y/o premiación.</p>

        <h3>2. Proceso de Votación</h3>
        <ul>
            <li>Cada participante puede emitir un solo voto por categoría utilizando su cuenta de Google.</li>
            <li>Se prohíbe el uso de bots u otros métodos automatizados para alterar los resultados.</li>
            <li>El equipo organizador se reserva el derecho de descalificar votos sospechosos de manipulación.</li>
        </ul>

        <h3>3. Responsabilidades</h3>
        <p>El equipo organizador no se hace responsable de interrupciones técnicas, errores en el sistema de votación o cualquier otro problema fuera de su control razonable.</p>

        <h3>4. Cambios en los Términos</h3>
        <p>Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Las actualizaciones se publicarán en este sitio web.</p>

        <h3>5. Contacto</h3>
        <p>Si tienes preguntas sobre estos términos y condiciones, puedes contactarnos en radioconexion_latam@outlook.com.</p>
    </section>
</main>


<?php include __DIR__ . '/partials/footer.php'; ?>
