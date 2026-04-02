/**
 * Lógica do Motor de Escaneamento (html5-qrcode)
 */

let html5QrCode = null;
let currentFacingMode = "environment";
let currentScanMode = 'QR';

const cameraModal = document.getElementById('cameraModal');
const btnCloseCamera = document.getElementById('btnCloseCamera');
const btnSwitchCamera = document.getElementById('btnSwitchCamera');
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

    if (html5QrCode && html5QrCode.isScanning) {
        startCamera();
    }
}

async function startCamera() {
    if (html5QrCode) {
        try {
            if (html5QrCode.isScanning) await html5QrCode.stop();
        } catch (e) { }
        try { html5QrCode.clear(); } catch (e) { }
        html5QrCode = null;
    }

    const readerEl = document.getElementById('reader');
    if (readerEl) readerEl.innerHTML = '';

    html5QrCode = new Html5Qrcode("reader");

    const isQRCode = currentScanMode === 'QR';
    const config = {
        fps: 25,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            if (isQRCode) {
                const size = Math.floor(Math.min(minEdge * 0.75, 280));
                return { width: size, height: size };
            } else {
                const width = Math.floor(Math.min(viewfinderWidth * 0.85, 450));
                const height = Math.floor(width / 2.5);
                return { width: width, height: height };
            }
        },
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
        if (navigator.vibrate) navigator.vibrate(200);
        if (typeof addCode === 'function') addCode(decodedText);
        closeCamera();
    };

    try {
        await html5QrCode.start({ facingMode: currentFacingMode }, config, onSuccess, () => { });
    } catch (err) {
        try {
            const cameras = await Html5Qrcode.getCameras();
            if (cameras.length > 0) {
                await html5QrCode.start(cameras[0].id, config, onSuccess, () => { });
            }
        } catch (err2) {
            if (typeof showToast === 'function') showToast("Erro ao acessar câmera", "error");
        }
    }
}

async function stopCamera() {
    if (html5QrCode && html5QrCode.isScanning) {
        try { await html5QrCode.stop(); } catch (err) { }
    }
}

function closeCamera() {
    if (cameraModal) cameraModal.style.display = 'none';
    stopCamera();
}

if (btnModeQR) btnModeQR.addEventListener('click', () => setScanMode('QR'));
if (btnModeBarcode) btnModeBarcode.addEventListener('click', () => setScanMode('Barcode'));
if (btnCloseCamera) btnCloseCamera.addEventListener('click', closeCamera);
if (btnSwitchCamera) {
    btnSwitchCamera.addEventListener('click', async () => {
        currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
        await stopCamera();
        startCamera();
    });
}
