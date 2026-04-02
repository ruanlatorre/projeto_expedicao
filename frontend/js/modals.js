/**
 * Lógica dos Modais (Destino, Filiais, Pré-visualização, Limpeza)
 */

const destinationModal = document.getElementById('destinationModal');
const branchSelectionModal = document.getElementById('branchSelectionModal');
const destinationInput = document.getElementById('destinationInput');
const finalDestinationInput = document.getElementById('finalDestinationInput');
const previewModal = document.getElementById('previewModal');

let activeDestinationField = 'main';

// Função para abrir o modal de pré-visualização
window.openPreview = function(code) {
    if (!previewModal) return;
    previewModal.style.display = 'flex';
    previewModal.classList.add('show');

    const previewImage = document.getElementById('previewImage');
    const previewFallback = document.getElementById('previewFallback');
    const fallbackCode = document.getElementById('fallbackCode');

    if (isImageUrl(code)) {
        if (previewImage) {
            previewImage.src = code;
            previewImage.style.display = 'block';
        }
        if (previewFallback) previewFallback.style.display = 'none';
    } else {
        if (fallbackCode) fallbackCode.textContent = code;
        if (previewFallback) previewFallback.style.display = 'flex';
        if (previewImage) previewImage.style.display = 'none';
    }
};

function closePreview() {
    if (previewModal) {
        previewModal.classList.remove('show');
        setTimeout(() => previewModal.style.display = 'none', 300);
    }
}

const btnClosePreview = document.getElementById('btnClosePreview');
const btnContinuePreview = document.getElementById('btnContinuePreview');
if (btnClosePreview) btnClosePreview.addEventListener('click', closePreview);
if (btnContinuePreview) btnContinuePreview.addEventListener('click', closePreview);

// Seleção de Filial
window.selectBranch = (branchName) => {
    const branch = branches.find(b => b.name === branchName);
    if (activeDestinationField === 'final') {
        if (finalDestinationInput) finalDestinationInput.value = branchName;
        selectedFinalBranchEmail = branch ? branch.email : '';
    } else {
        if (destinationInput) destinationInput.value = branchName;
        selectedBranchEmail = branch ? branch.email : '';
    }
    if (branchSelectionModal) branchSelectionModal.style.display = 'none';
    checkConfirmButtonState();
};

function checkConfirmButtonState() {
    const btnConfirmSend = document.getElementById('btnConfirmSend');
    const mainFilled = destinationInput && destinationInput.value.trim() !== '';
    const finalFilled = finalDestinationInput && finalDestinationInput.value.trim() !== '';
    if (btnConfirmSend) {
        btnConfirmSend.disabled = !(mainFilled && finalFilled);
        btnConfirmSend.style.opacity = (mainFilled && finalFilled) ? '1' : '0.5';
    }
}

const fieldSelectBranch = document.getElementById('fieldSelectBranch');
const fieldSelectFinalBranch = document.getElementById('fieldSelectFinalBranch');

if (fieldSelectBranch) {
    fieldSelectBranch.addEventListener('click', () => {
        activeDestinationField = 'main';
        if (branchSelectionModal) branchSelectionModal.style.display = 'flex';
        if (typeof renderBranchList === 'function') renderBranchList();
    });
}

if (fieldSelectFinalBranch) {
    fieldSelectFinalBranch.addEventListener('click', () => {
        activeDestinationField = 'final';
        if (branchSelectionModal) branchSelectionModal.style.display = 'flex';
        if (typeof renderBranchList === 'function') renderBranchList();
    });
}

// Lógica de Limpeza Total
const btnClearAll = document.getElementById('btnClearAll');
const confirmModal = document.getElementById('confirmModal');
const btnConfirmClear = document.getElementById('btnConfirmClear');
const btnCancelClear = document.getElementById('btnCancelClear');

if (btnClearAll) {
    btnClearAll.addEventListener('click', () => {
        const modalItemCount = document.getElementById('modalItemCount');
        const itemCount = document.getElementById('itemCount');
        if (modalItemCount && itemCount) modalItemCount.textContent = itemCount.textContent;
        if (confirmModal) confirmModal.style.display = 'flex';
    });
}

if (btnCancelClear) btnCancelClear.addEventListener('click', () => { if (confirmModal) confirmModal.style.display = 'none'; });

if (btnConfirmClear) {
    btnConfirmClear.addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/items`, { method: 'DELETE' });
            if (response.ok) {
                showToast('Lista limpa!');
                if (typeof loadItems === 'function') loadItems();
            }
        } finally {
            if (confirmModal) confirmModal.style.display = 'none';
        }
    });
}
