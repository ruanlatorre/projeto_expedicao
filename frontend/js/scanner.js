// --- Elementos do Modal da Câmera ---
const cameraModal = document.getElementById('cameraModal');
const btnCloseCamera = document.getElementById('btnCloseCamera');
const btnSwitchCamera = document.getElementById('btnSwitchCamera');

// --- Estado Global do Scanner ---
let html5QrCode = null;
let currentFacingMode = "environment";
let currentScanMode = 'QR';
let isInitializing = false; // Trava para evitar múltiplas instâncias simultâneas

// --- Utilidades ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const btnModeQR = document.getElementById('btnModeQR');
const btnModeBarcode = document.getElementById('btnModeBarcode');
const modeSlider = document.getElementById('modeSlider');

function setScanMode(mode) {
    currentScanMode = mode;
    const scanArea = document.getElementById('scanArea');

    if (mode === 'QR') {
        if (btnModeQR) btnModeQR.classList.add('active');
        if (btnModeBarcode) btnModeBarcode.classList.remove('active');
        if (modeSlider) modeSlider.style.transform = 'translateX(0)';
        if (scanArea) scanArea.classList.remove('barcode-mode');
    } else {
        if (btnModeBarcode) btnModeBarcode.classList.add('active');
        if (btnModeQR) btnModeQR.classList.remove('active');
        if (modeSlider) modeSlider.style.transform = 'translateX(100%)';
        if (scanArea) scanArea.classList.add('barcode-mode');
    }

    // Se a câmera já estiver rodando, reiniciamos ela com os novos formatos
    if (html5QrCode && html5QrCode.isScanning) {
        startCamera();
    }
}

if (btnModeQR) btnModeQR.addEventListener('click', () => setScanMode('QR'));
if (btnModeBarcode) btnModeBarcode.addEventListener('click', () => setScanMode('Barcode'));

// --- Lógica da Câmera (html5-qrcode) ---
async function startCamera() {
    // 1. Limpeza total de instâncias anteriores
    if (html5QrCode) {
        try {
            if (html5QrCode.isScanning) await html5QrCode.stop();
            await html5QrCode.clear();
        } catch (e) {
            console.warn("Limpando instância anterior:", e);
        }
        html5QrCode = null;
    }

    const readerEl = document.getElementById('reader');
    if (readerEl) readerEl.innerHTML = '';

    // 2. Definir formatos baseado no modo (QR ou Barcode)
    const formats = currentScanMode === 'QR'
        ? [Html5QrcodeSupportedFormats.QR_CODE]
        : [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A
        ];

    // 3. Criar nova instância (formatsToSupport deve ir no construtor)
    html5QrCode = new Html5Qrcode("reader", {
        formatsToSupport: formats,
        verbose: false
    });

    const config = {
        fps: 10,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            if (currentScanMode === 'QR') {
                const size = Math.floor(Math.min(minEdge * 0.75, 280));
                return { width: size, height: size };
            } else {
                const width = Math.floor(Math.min(viewfinderWidth * 0.85, 450));
                const height = Math.floor(width / 2.5);
                return { width: width, height: height };
            }
        },
        aspectRatio: 1.0
    };

    const onSuccess = (decodedText) => {
        console.log("%c[SCANNER] Código detectado: " + decodedText, "color: green; font-weight: bold;");
        if (navigator.vibrate) navigator.vibrate(200);
        if (typeof addCode === 'function') addCode(decodedText);
        closeCamera();
    };

    const onError = (err) => {
        // Log para ver se o scanner está tentando ler, mas falhando na decodificação
        // Se este log aparecer repetidamente, significa que o motor está funcionando!
        console.debug("[SCANNER] Buscando código...");
    };

    // 4. Iniciar Câmera com Fallback Robusto
    if (isInitializing) return;
    isInitializing = true;

    try {
        // Verificação de Contexto Seguro (Exigência do Navegador para getUserMedia)
        if (!window.isSecureContext && window.location.hostname !== 'localhost') {
            console.error("Contexto Inseguro detectado.");
            if (typeof showToast === 'function') {
                showToast("A câmera exige HTTPS ou localhost para funcionar.", "error");
            }
            isInitializing = false;
            return;
        }

        // Aguarda um curto período para garantir que o hardware foi liberado
        await sleep(300);

        // Tenta listar câmeras primeiro
        const devices = await Html5Qrcode.getCameras();

        if (devices && devices.length > 0) {
            // Busca a câmera ideal (traseira se estiver no celular)
            let deviceId = devices[0].id;
            for (const device of devices) {
                const label = device.label.toLowerCase();
                if (label.includes('back') || label.includes('traseira') || label.includes('rear')) {
                    deviceId = device.id;
                    break;
                }
            }
            await html5QrCode.start(deviceId, config, onSuccess, onError);
        } else {
            // Fallback para facingMode se getCameras falhar ou retornar vazio
            await html5QrCode.start({ facingMode: currentFacingMode }, config, onSuccess, onError);
        }
    } catch (err) {
        console.error("Falha fatal ao iniciar câmera:", err);

        let errorMsg = "Não foi possível acessar a câmera.";

        if (err.name === 'NotReadableError' || err.message.includes('Device in use')) {
            errorMsg = "Câmera em uso por outro aplicativo ou aba. Feche-os e tente novamente.";
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            errorMsg = "Permissão da câmera negada pelo navegador.";
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            errorMsg = "Nenhuma câmera encontrada no dispositivo.";
        }

        if (typeof showToast === 'function') {
            showToast(errorMsg, "error");
        }
    } finally {
        isInitializing = false;
    }
}

async function stopCamera() {
    if (html5QrCode) {
        try {
            if (html5QrCode.isScanning) await html5QrCode.stop();
            html5QrCode.clear();
        } catch (err) {
            console.error("Erro ao parar câmera:", err);
        }
    }
}

function closeCamera() {
    if (cameraModal) cameraModal.style.display = 'none';
    stopCamera();
}

// Eventos
if (document.getElementById('btnSimulateScan')) {
    document.getElementById('btnSimulateScan').addEventListener('click', () => {
        if (cameraModal) cameraModal.style.display = 'flex';
        startCamera();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });
}

if (btnCloseCamera) btnCloseCamera.addEventListener('click', closeCamera);

if (btnSwitchCamera) {
    btnSwitchCamera.addEventListener('click', async () => {
        currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
        await startCamera();
    });
}

// Reinício em redimensionamento
let resizeTimer;
window.addEventListener('resize', () => {
    if (cameraModal && cameraModal.style.display === 'flex') {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(startCamera, 500);
    }
});
