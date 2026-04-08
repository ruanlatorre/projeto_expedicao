/**
 * Lógica de Envio de Relatório e Animações de Finalização
 */

const btnConfirmSend = document.getElementById('btnFinalConfirmSend');
const sendConfirmModal = document.getElementById('sendConfirmModal');

if (btnConfirmSend) {
    btnConfirmSend.addEventListener('click', async () => {
        if (sendConfirmModal) sendConfirmModal.classList.remove('show');
        setTimeout(() => { if (sendConfirmModal) sendConfirmModal.style.display = 'none'; }, 300);

        const destinationModal = document.getElementById('destinationModal');
        if (destinationModal) destinationModal.style.display = 'none';

        // Iniciar Animação do Caminhão
        const truckIcon = document.querySelector('.truck-wrapper');
        const logoText = document.querySelector('.logo-text');

        if (truckIcon && logoText) {
            const header = truckIcon.closest('.header');
            const headerWidth = header ? header.clientWidth : window.innerWidth;
            const stopDistance = headerWidth - 100;
            truckIcon.style.setProperty('--drive-dist', `${stopDistance}px`);
            truckIcon.classList.add('truck-driving');
            logoText.classList.add('hide-logo');
        }

        showToast('Enviando relatório...', 'success');

        setTimeout(async () => {
            // Reset suave
            if (truckIcon && logoText) {
                truckIcon.classList.remove('truck-driving');
                truckIcon.style.transform = 'translateX(0)';
                logoText.classList.remove('hide-logo');
            }

            // Processar Envio Real
            try {
                const destination = document.getElementById('destinationInput').value;
                const finalDestination = document.getElementById('finalDestinationInput').value;
                const response = await fetch(`${API_BASE_URL}/report`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        destination,
                        finalDestination,
                        email: selectedBranchEmail,
                        finalEmail: selectedFinalBranchEmail
                    })
                });

                if (response.ok) {
                    showToast('Relatório enviado!');
                    await fetch(`${API_BASE_URL}/items`, { method: 'DELETE' });
                    if (typeof loadItems === 'function') loadItems();
                } else {
                    showToast('Erro ao enviar relatório', 'error');
                }
            } catch (error) {
                showToast('Erro de conexão ao enviar', 'error');
            }
        }, 2500);
    });
}

// Abrir confirmação de envio
const btnOpenConfirmSend = document.getElementById('btnConfirmSend');
if (btnOpenConfirmSend) {
    btnOpenConfirmSend.addEventListener('click', () => {
        const destName = document.getElementById('destinationInput').value;
        const confirmBranchName = document.getElementById('confirmBranchName');
        if (confirmBranchName) confirmBranchName.textContent = destName;

        const sendConfirmModal = document.getElementById('sendConfirmModal');
        if (sendConfirmModal) {
            sendConfirmModal.style.display = 'flex';
            setTimeout(() => sendConfirmModal.classList.add('show'), 10);
        }
    });
}
