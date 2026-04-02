/**
 * Lógica de Gerenciamento da Lista de Itens
 */

const listContainer = document.getElementById('dataList');
const emptyState = document.getElementById('emptyState');
const itemCountBadge = document.getElementById('itemCount');
const btnSendEmail = document.getElementById('btnSendEmail');

let itemToDelete = null;

// Função para carregar itens da API
async function loadItems() {
    try {
        const response = await fetch(`${API_BASE_URL}/items`);
        const items = await response.json();
        renderList(items);
    } catch (error) {
        console.error('Erro ao carregar itens: ', error);
        showToast('Erro ao carregar dados do servidor', 'error');
    }
}

// Função para renderizar a lista
function renderList(items) {
    if (!listContainer) return;
    listContainer.innerHTML = '';
    if (itemCountBadge) itemCountBadge.textContent = items.length;

    if (items.length === 0) {
        if (emptyState) emptyState.style.display = 'flex';
        if (btnSendEmail) {
            btnSendEmail.disabled = true;
            btnSendEmail.style.opacity = '0.5';
        }
    } else {
        if (emptyState) emptyState.style.display = 'none';
        if (btnSendEmail) {
            btnSendEmail.disabled = false;
            btnSendEmail.style.opacity = '1';
        }

        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'data-item';
            const scanBadge = item.scan_count > 1
                ? `<span class="scan-count-badge" title="Escaneado ${item.scan_count} vezes"><i data-lucide="repeat" width="11" height="11"></i> ${item.scan_count}x</span>`
                : '';
            li.innerHTML = `
                <div class="item-info">
                    <span class="item-code" onclick="openPreview('${item.code}')">${item.code} ${scanBadge}</span>
                    <span class="item-time"><i data-lucide="clock" width="10" height="10" style="display:inline; margin-right:3px;"></i>${formatDateTime(item.timestamp)}</span>
                </div>
                <button class="btn-delete-item" onclick="deleteItemById(${item.id})">
                    <i data-lucide="trash-2" width="16" height="16"></i>
                </button>
            `;
            listContainer.appendChild(li);
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// Adicionar novo código à API
async function addCode(code) {
    if (!code.trim()) return;
    try {
        const response = await fetch(`${API_BASE_URL}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code.trim() })
        });
        const result = await response.json();
        if (response.ok) {
            showToast('Código registrado!');
            const input = document.getElementById('codeInput');
            if (input) input.value = '';
            loadItems();
            if (isImageUrl(code) || code.startsWith('http')) {
                if (typeof openPreview === 'function') openPreview(code);
            }
        } else {
            showToast(result.error || 'Erro ao registrar', 'error');
        }
    } catch (error) {
        showToast('Erro de conexão', 'error');
    }
}

// Abrir o modal de exclusão
window.deleteItemById = function (id) {
    itemToDelete = id;
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) modal.style.display = 'flex';
};

// Lógica de exclusão confirmada
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', async () => {
        if (!itemToDelete) return;
        try {
            const response = await fetch(`${API_BASE_URL}/items/${itemToDelete}`, { method: 'DELETE' });
            if (response.ok) {
                showToast('Item removido!');
                loadItems();
            }
        } finally {
            const modal = document.getElementById('deleteConfirmModal');
            if (modal) modal.style.display = 'none';
            itemToDelete = null;
        }
    });
}

const btnCancelDelete = document.getElementById('btnCancelDelete');
if (btnCancelDelete) {
    btnCancelDelete.addEventListener('click', () => {
        const modal = document.getElementById('deleteConfirmModal');
        if (modal) modal.style.display = 'none';
        itemToDelete = null;
    });
}
