/* global cv, lucide, showToast, addCode */
// --- Elementos do Modal da Câmera ---
const cameraModal = document.getElementById('cameraModal');
const btnCloseCamera = document.getElementById('btnCloseCamera');
const btnSwitchCamera = document.getElementById('btnSwitchCamera');
const readerEl = document.getElementById('reader');

// --- Estado Global do Scanner ---
let currentFacingMode = "environment";
let currentScanMode = 'QR';
let isScanning = false;
let stream = null;

let video = null;
let canvas = null;
let ctx = null;
let src = null;
let qrDecoder = null;

let cvReady = false;

window.onOpenCvReady = function() {
    cvReady = true;
    console.log("[SCANNER] OpenCV.js está pronto!");
    if (typeof showToast === 'function') {
        showToast("Leitor inicializado (OpenCV)", "success");
    }
};

// --- Modal da Câmera: Toggle QR / Código de Barras ---
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
}

if (btnModeQR) btnModeQR.addEventListener('click', () => setScanMode('QR'));
if (btnModeBarcode) btnModeBarcode.addEventListener('click', () => setScanMode('Barcode'));


// --- Lógica da Câmera (OpenCV.js) ---
async function startCamera() {
    if (!cvReady) {
        if (typeof showToast === 'function') {
            showToast("OpenCV ainda carregando, aguarde...", "error");
        }
        return;
    }

    if (isScanning) {
        stopCamera();
    }

    if (readerEl) {
        readerEl.innerHTML = '';
        
        video = document.createElement('video');
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        
        canvas = document.createElement('canvas');
        canvas.style.display = 'none';
        
        readerEl.appendChild(video);
        readerEl.appendChild(canvas);
        ctx = canvas.getContext('2d', { willReadFrequently: true });
    }

    try {
        const constraints = {
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;

        video.addEventListener('loadedmetadata', () => {
            video.play();
            
            if (!qrDecoder) {
                qrDecoder = new cv.QRCodeDetector();
            }

            isScanning = true;
            requestAnimationFrame(processVideo);
        });

    } catch (err) {
        console.error("Falha ao iniciar câmera:", err);

        let errorMsg = "Não foi possível acessar a câmera.";
        if (err.name === 'NotReadableError') {
            errorMsg = "Câmera em uso por outro app. Feche-o e tente novamente.";
        } else if (err.name === 'NotAllowedError') {
            errorMsg = "Permissão da câmera negada pelo navegador.";
        } else if (err.name === 'NotFoundError') {
            errorMsg = "Nenhuma câmera encontrada no dispositivo.";
        }

        if (typeof showToast === 'function') {
            showToast(errorMsg, "error");
        }
    }
}

function processVideo() {
    if (!isScanning || !video || video.readyState < video.HAVE_CURRENT_DATA) {
        if (isScanning) requestAnimationFrame(processVideo);
        return;
    }

    try {
        // Captura o frame via canvas (evita o erro de "Bad size of input mat" do cv.VideoCapture)
        const vw = video.videoWidth;
        const vh = video.videoHeight;

        if (vw === 0 || vh === 0) {
            requestAnimationFrame(processVideo);
            return;
        }

        // Ajusta o canvas se a resolução do vídeo mudou
        if (canvas.width !== vw || canvas.height !== vh) {
            canvas.width = vw;
            canvas.height = vh;
        }

        ctx.drawImage(video, 0, 0, vw, vh);
        const imageData = ctx.getImageData(0, 0, vw, vh);
        src = cv.matFromImageData(imageData);

        // Detecção de QR Code (usado para ambos os modos, pois o módulo barcode não está disponível no OpenCV.js padrão)
        let points = new cv.Mat();
        let straight_qrcode = new cv.Mat();
        
        let decodedText = qrDecoder.detectAndDecode(src, points, straight_qrcode);
        
        if (decodedText && decodedText.length > 0) {
            console.log("%c[SCANNER] Código detectado: " + decodedText, "color: green; font-weight: bold;");
            if (navigator.vibrate) navigator.vibrate(200);
            if (typeof addCode === 'function') addCode(decodedText);
            closeCamera();
            points.delete();
            straight_qrcode.delete();
            src.delete();
            return;
        }
        
        points.delete();
        straight_qrcode.delete();
        src.delete();
        src = null;

        // Schedule next frame processing
        requestAnimationFrame(processVideo);
    } catch (err) {
        console.error("Erro no processamento de vídeo:", err);
        // Limpar Mat se existir para evitar memory leak
        if (src) { try { src.delete(); } catch(e) {} src = null; }
        // Continue mesmo com erro no frame
        requestAnimationFrame(processVideo);
    }
}

function stopCamera() {
    isScanning = false;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    if (src) {
        try { src.delete(); } catch(e) {}
        src = null;
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
