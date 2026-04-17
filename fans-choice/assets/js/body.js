document.addEventListener('DOMContentLoaded', () => {
    const allCategories = document.querySelectorAll('.reportero-container');

    allCategories.forEach((section) => {
        const voteButton = section.querySelector('.btn-votar');
        const candidateLabels = section.querySelectorAll('.candidato');
        const selectedOption = section.querySelector('input[type="radio"]:checked');

        // Ocultar el botón si la sección tiene la clase 'votado'
        if (section.classList.contains('votado')) {
            if (voteButton) {
                voteButton.style.display = 'none'; // Ocultar el botón si ya se ha votado
            }
        }

        // Marcar visualmente la opción votada si existe
        if (selectedOption) {
            selectedOption.closest('.candidato').querySelector('img').classList.add('selected');
            selectedOption.closest('.candidato').classList.add('votado-candidato');
        }

        // Evento de selección de candidato
        candidateLabels.forEach((label) => {
            const img = label.querySelector('img');
            const radioInput = label.querySelector('input[type="radio"]');

            label.addEventListener('click', () => {
                if (section.classList.contains('votado')) return;

                candidateLabels.forEach((otherLabel) => {
                    otherLabel.querySelector('img').classList.remove('selected');
                    otherLabel.querySelector('input[type="radio"]').checked = false;
                });

                img.classList.add('selected');
                radioInput.checked = true;
            });
        });

        if (voteButton) {
            voteButton.addEventListener('click', (e) => {
                e.preventDefault();

                const selectedOption = section.querySelector('input[type="radio"]:checked');
                if (!selectedOption) {
                    alert('Por favor, selecciona una opción antes de votar.');
                    return;
                }

                const categoryId = section.getAttribute('id').split('-')[1];
                const opcion = selectedOption.value;

                fetch((window.APP_BASE || '') + '/procesar_voto', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ categoria: categoryId, opcion: opcion, csrf_token: window.CSRF_TOKEN || '' })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        alert(data.message);
                        section.classList.add('votado');
                        voteButton.style.display = 'none';

                        // Marcar la opción seleccionada con borde dorado
                        selectedOption.closest('.candidato').querySelector('img').classList.add('selected');
                        selectedOption.closest('.candidato').classList.add('votado-candidato');

                        // Mostrar mensaje de resultado registrado
                        section.insertAdjacentHTML('beforeend', '<p class="votado-text">Resultados registrados</p>');
                    } else {
                        alert(`Error: ${data.message}`);
                    }
                })
                .catch(error => console.error('Error:', error));
            });
        }
    });
});
