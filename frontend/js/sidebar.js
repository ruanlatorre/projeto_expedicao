/**
 * Lógica da Sidebar Lateral
 */

const btnMenu = document.getElementById('btnMenu');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const btnCloseSidebar = document.getElementById('btnCloseSidebar');

function openSidebar() {
    if (sidebar && sidebarOverlay) {
        sidebar.style.right = '0';
        sidebarOverlay.style.visibility = 'visible';
        sidebarOverlay.style.opacity = '1';
    }
}

function closeSidebar() {
    if (sidebar && sidebarOverlay) {
        sidebar.style.right = '-270px';
        sidebarOverlay.style.opacity = '0';
        setTimeout(() => {
            if (sidebarOverlay.style.opacity === '0') {
                sidebarOverlay.style.visibility = 'hidden';
            }
        }, 300);
    }
}

if (btnMenu) btnMenu.addEventListener('click', openSidebar);
if (btnCloseSidebar) btnCloseSidebar.addEventListener('click', closeSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
