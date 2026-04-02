// --- Elementos do Modal da Câmera ---
const cameraModal = document.getElementById('cameraModal');
const btnCloseCamera = document.getElementById('btnCloseCamera');
const btnSwitchCamera = document.getElementById('btnSwitchCamera');

// --- Estado Global do Scanner ---
let html5QrCode = null;
let currentFacingMode = "environment";

// --- Modal da Câmera: Toggle QR / Código de Barras ---
const btnModeQR = document.getElementById('btnModeQR');
const btnModeBarcode = document.getElementById('btnModeBarcode');
const modeSlider = document.getElementById('modeSlider');
let currentScanMode = 'QR';

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

    // Se a câmera já estiver rodando, reiniciamos ela com as novas configurações
    if (html5QrCode && html5QrCode.isScanning) {
        startCamera();
    }
}

if (btnModeQR) btnModeQR.addEventListener('click', () => setScanMode('QR'));
if (btnModeBarcode) btnModeBarcode.addEventListener('click', () => setScanMode('Barcode'));

// --- Lógica da Câmera (html5-qrcode) ---
async function startCamera() {
    // Limpa instância anterior se existir
    if (html5QrCode) {
        try {
            if (html5QrCode.isScanning) {
                await html5QrCode.stop();
            }
        } catch (e) {
            console.warn("Erro ao parar câmera anterior:", e);
        }
        try {
            html5QrCode.clear();
        } catch (e) {
            // clear() pode falhar se o DOM foi alterado, ignorar
        }
        html5QrCode = null;
    }

    // Garante que o container reader está limpo
    const readerEl = document.getElementById('reader');
    if (readerEl) readerEl.innerHTML = '';

    html5QrCode = new Html5Qrcode("reader");

    // Configuração baseada no modo selecionado
    const isQRCode = currentScanMode === 'QR';
    const config = {
        fps: 25,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
            // Sincroniza com o CSS: min(75vw, 75vh, 280px) ou (85vw, 85vh, 500px)
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);

            if (isQRCode) {
                // QR: Quadrado perfeito (75% da menor borda, limitado a 280px)
                const size = Math.floor(Math.min(minEdge * 0.75, 280));
                return { width: size, height: size };
            } else {
                // Barcode: Retângulo horizontal (85% da menor borda ou até 450px)
                const width = Math.floor(Math.min(viewfinderWidth * 0.85, 450));
                const height = Math.floor(width / 2.5); // Segue o aspect-ratio 2.5 / 1 do CSS
                return { width: width, height: height };
            }
        },
        aspectRatio: undefined,
        disableFlip: false,
        formatsToSupport: isQRCode
            ? [Html5QrcodeSupportedFormats.QR_CODE]
            : [
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A
            ]
    };

    const onSuccess = (decodedText) => {
        console.log("Código lido:", decodedText);
        if (navigator.vibrate) navigator.vibrate(200);
        
        // Chama a função global addCode do app.js
        if (typeof addCode === 'function') {
            addCode(decodedText);
        }
        closeCamera();
    };

    const onError = () => { /* Silenciar erros de busca */ };

    // Tentativa 1: Usar facingMode
    try {
        await html5QrCode.start(
            { facingMode: currentFacingMode },
            config,
            onSuccess,
            onError
        );
        return;
    } catch (err) {
        console.warn("facingMode falhou, tentando listar câmeras...", err);
    }

    // Tentativa 2: Listar câmeras disponíveis
    try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
            let cameraId = cameras[0].id;
            for (const cam of cameras) {
                if (cam.label && (cam.label.toLowerCase().includes('back') || cam.label.toLowerCase().includes('traseira') || cam.label.toLowerCase().includes('rear'))) {
                    cameraId = cam.id;
                    break;
                }
            }
            await html5QrCode.start(
                cameraId,
                config,
                onSuccess,
                onError
            );
        } else {
            if (typeof showToast === 'function') showToast("Nenhuma câmera encontrada", "error");
        }
    } catch (err2) {
        console.error("Erro ao acessar câmera:", err2);
        if (typeof showToast === 'function') showToast("Erro ao acessar câmera. Verifique as permissões.", "error");
    }
}

async function stopCamera() {
    if (html5QrCode && html5QrCode.isScanning) {
        try {
            await html5QrCode.stop();
        } catch (err) {
            console.error("Erro ao parar câmera:", err);
        }
    }
}

function closeCamera() {
    if (cameraModal) cameraModal.style.display = 'none';
    stopCamera();
}

// Evento: Abrir Modal da Câmera
if (btnSimulateScan) {
    btnSimulateScan.addEventListener('click', () => {
        if (cameraModal) cameraModal.style.display = 'flex';
        startCamera();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });
}

// Evento: Fechar Modal da Câmera
if (btnCloseCamera) btnCloseCamera.addEventListener('click', closeCamera);

// Evento: Alternar Câmera
if (btnSwitchCamera) {
    btnSwitchCamera.addEventListener('click', async () => {
        currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
        await stopCamera();
        startCamera();
    });
}

// listener para redimensionamento e orientação - Garante que a "parte branca" volte
let resizeTimer;
const restartScanner = async () => {
    if (cameraModal && cameraModal.style.display === 'flex') {
        clearTimeout(resizeTimer);
        // Delay de 400ms para garantir que o navegador termine a transição de rotação
        resizeTimer = setTimeout(async () => {
            console.log("Limpando DOM e forçando reinício total do scanner...");
            if (html5QrCode) {
                try {
                    if (html5QrCode.isScanning) {
                        await html5QrCode.stop();
                    }
                } catch (e) {
                    console.warn("Erro ao parar scanner:", e);
                }
                html5QrCode = null;
            }
            // Limpa o container e qualquer estilo inline que a biblioteca tenha injetado
            const reader = document.getElementById('reader');
            if (reader) {
                reader.innerHTML = '';
                reader.removeAttribute('style');
                // Reaplica estilos base necessários
                reader.style.width = '100%';
                reader.style.position = 'relative';
                reader.style.flex = '1';
                reader.style.background = '#000';
            }
            await startCamera();
        }, 400);
    }
};

window.addEventListener('resize', restartScanner);
window.addEventListener('orientationchange', restartScanner);
