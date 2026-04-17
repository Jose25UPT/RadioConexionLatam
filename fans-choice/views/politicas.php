<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once __DIR__ . '/../config/app.php';
include __DIR__ . '/partials/header.php';
?>

<main class="terms-container">
    <section>
        <h2>Políticas de Privacidad</h2>
        <p>En LATAM Awards - Fans Choice, nos comprometemos a proteger tu privacidad y garantizar que tus datos sean manejados de manera segura.</p>

        <h3>1. Recolección de Datos</h3>
        <p>Recopilamos información como tu correo electrónico a través de tu cuenta de Google con el único propósito de facilitar el proceso de votación y mantener la integridad de los resultados.</p>

        <h3>2. Uso de la Información</h3>
        <p>Los datos recolectados serán utilizados únicamente para:</p>
        <ul>
            <li>Identificar a los participantes durante el proceso de votación.</li>
            <li>Garantizar la validez de los votos emitidos.</li>
        </ul>

        <h3>3. Protección de Datos</h3>
        <p>Implementamos medidas técnicas y organizativas adecuadas para proteger tus datos contra alteraciones o divulgaciones indebidas.</p>

        <h3>4. Retención de Datos</h3>
        <p>Tus datos serán almacenados durante el tiempo necesario para cumplir con los propósitos establecidos en estas políticas y se eliminarán de forma segura al finalizar el evento.</p>

        <h3>5. Actualizaciones</h3>
        <p>Nos reservamos el derecho de actualizar esta política de privacidad en cualquier momento. Los cambios se reflejarán en esta página.</p>
    </section>
</main>


<?php include __DIR__ . '/partials/footer.php'; ?>
