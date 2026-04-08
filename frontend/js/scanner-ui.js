/**
 * Lógica de UI do Scanner
 */

const form = document.getElementById('scanForm');
const input = document.getElementById('codeInput');
const btnSimulateScan = document.getElementById('btnSimulateScan');

// Evento: Submissão do formulário
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input && input.value.trim()) {
            if (typeof addCode === 'function') addCode(input.value);
        }
    });
}

// Evento: Abrir Modal de Câmera
if (btnSimulateScan) {
    btnSimulateScan.addEventListener('click', () => {
        const modal = document.getElementById('cameraModal');
        if (modal) modal.style.display = 'flex';
        if (typeof startCamera === 'function') startCamera();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });
}
