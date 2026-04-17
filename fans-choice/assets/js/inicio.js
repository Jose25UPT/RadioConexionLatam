// Esperar a que el DOM se cargue completamente
document.addEventListener("DOMContentLoaded", function() {
    console.log("Script cargado correctamente");

    const acceptButton = document.getElementById("accept-terms");
    const termsSection = document.getElementById("terms-section");
    const googleLoginSection = document.getElementById("google-login-section");

    // Verificar si los elementos se están seleccionando correctamente
    if (!acceptButton || !termsSection || !googleLoginSection) {
        console.error("Uno o más elementos no fueron encontrados en el DOM.");
        return;
    }

    // Evento de clic en el botón de aceptación de términos
    acceptButton.addEventListener("click", function() {
        termsSection.style.display = "none"; // Ocultar términos
        googleLoginSection.style.display = "block"; // Mostrar el botón de Google
        console.log("Botón Aceptar clicado. Se muestra el inicio de sesión.");
    });
});
