/* ===== Camera Barcode Scanner Component ===== */
/* Uses html5-qrcode library to scan 1D/2D barcodes via phone camera */

const CameraScanner = (() => {
  let scanner = null;
  let isScanning = false;
  let modalEl = null;

  /**
   * Open camera scanner modal
   * @param {Function} onScan - Callback when barcode detected: (barcodeText) => void
   * @param {Object} options - Optional settings
   */
  function open(onScan, options = {}) {
    if (isScanning) return;

    // Check if library is loaded
    if (typeof Html5Qrcode === 'undefined') {
      alert('Library scanner belum dimuat. Pastikan koneksi internet aktif.');
      return;
    }

    // Create modal overlay
    modalEl = document.createElement('div');
    modalEl.id = 'camera-scanner-modal';
    modalEl.innerHTML = `
      <div class="cam-scanner-overlay">
        <div class="cam-scanner-container">
          <div class="cam-scanner-header">
            <h3>📷 Scan Barcode</h3>
            <button class="cam-scanner-close" id="cam-close-btn">✕</button>
          </div>
          <div class="cam-scanner-hint">
            Arahkan kamera ke barcode batang / QR Code
          </div>
          <div id="cam-scanner-reader"></div>
          <div class="cam-scanner-status" id="cam-scanner-status">
            Memulai kamera...
          </div>
          <div class="cam-scanner-actions">
            <button class="btn btn-secondary" id="cam-switch-btn" style="display:none;">
              🔄 Ganti Kamera
            </button>
            <button class="btn btn-danger" id="cam-stop-btn">
              ❌ Tutup
            </button>
          </div>
        </div>
      </div>
    `;

    // Inject styles if not exist
    if (!document.getElementById('cam-scanner-styles')) {
      const style = document.createElement('style');
      style.id = 'cam-scanner-styles';
      style.textContent = `
        .cam-scanner-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease-out;
          padding: 16px;
        }
        .cam-scanner-container {
          background: var(--bg-primary, #0a0e17);
          border: 1px solid var(--glass-border, rgba(0,210,255,0.15));
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5), 0 0 40px rgba(0,210,255,0.1);
        }
        .cam-scanner-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .cam-scanner-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: #f8fafc;
        }
        .cam-scanner-close {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          color: #94a3b8;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cam-scanner-close:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        .cam-scanner-hint {
          padding: 8px 20px;
          font-size: 0.85rem;
          color: #94a3b8;
          text-align: center;
          background: rgba(0,210,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        #cam-scanner-reader {
          width: 100%;
          min-height: 280px;
          background: #000;
        }
        #cam-scanner-reader video {
          border-radius: 0 !important;
        }
        /* Override html5-qrcode internal styles */
        #cam-scanner-reader img[alt="Info icon"] { display: none !important; }
        #cam-scanner-reader > div:last-child { display: none !important; }
        .cam-scanner-status {
          padding: 12px 20px;
          font-size: 0.85rem;
          color: #64748b;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .cam-scanner-status.success {
          color: #00e0a3;
          font-weight: 700;
          background: rgba(0, 224, 163, 0.08);
          animation: pulse-success 0.5s;
        }
        @keyframes pulse-success {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        .cam-scanner-actions {
          display: flex;
          gap: 8px;
          padding: 12px 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .cam-scanner-actions button {
          flex: 1;
          padding: 10px;
          font-size: 0.9rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
        }

        /* Mobile optimization */
        @media (max-width: 767px) {
          .cam-scanner-overlay {
            padding: 0;
            align-items: stretch;
          }
          .cam-scanner-container {
            max-width: 100%;
            border-radius: 0;
            height: 100vh;
            display: flex;
            flex-direction: column;
          }
          #cam-scanner-reader {
            flex: 1;
            min-height: unset;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(modalEl);

    // Start scanner
    const readerEl = document.getElementById('cam-scanner-reader');
    const statusEl = document.getElementById('cam-scanner-status');
    
    scanner = new Html5Qrcode('cam-scanner-reader');
    isScanning = true;

    const scanConfig = {
      fps: 10,
      qrbox: { width: 280, height: 120 },
      aspectRatio: 1.5,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.CODABAR,
        Html5QrcodeSupportedFormats.QR_CODE,
      ]
    };

    let lastScannedCode = '';
    let lastScannedTime = 0;

    scanner.start(
      { facingMode: 'environment' }, // Rear camera
      scanConfig,
      (decodedText) => {
        // Debounce: prevent duplicate scans within 2 seconds
        const now = Date.now();
        if (decodedText === lastScannedCode && (now - lastScannedTime) < 2000) return;
        lastScannedCode = decodedText;
        lastScannedTime = now;

        // Vibrate feedback (if supported)
        if (navigator.vibrate) navigator.vibrate(200);

        // Show success
        statusEl.className = 'cam-scanner-status success';
        statusEl.textContent = `✅ Terdeteksi: ${decodedText}`;

        // Play beep sound
        playBeep();

        // Callback
        if (typeof onScan === 'function') {
          onScan(decodedText);
        }

        // Auto close after short delay
        setTimeout(() => {
          close();
        }, 800);
      },
      (errorMessage) => {
        // Scan error (normal, just means no barcode in frame yet)
        // Don't log this — it fires every frame
      }
    ).then(() => {
      statusEl.textContent = '🔍 Arahkan barcode ke area kotak hijau...';
      
      // Show switch camera button if multiple cameras
      Html5Qrcode.getCameras().then(cameras => {
        if (cameras.length > 1) {
          document.getElementById('cam-switch-btn').style.display = 'block';
        }
      });
    }).catch(err => {
      console.error('Camera error:', err);
      statusEl.textContent = `❌ Gagal akses kamera: ${err.message || err}`;
      statusEl.style.color = '#ef4444';
    });

    // Event handlers
    document.getElementById('cam-close-btn').addEventListener('click', close);
    document.getElementById('cam-stop-btn').addEventListener('click', close);
    
    document.getElementById('cam-switch-btn').addEventListener('click', async () => {
      try {
        await scanner.stop();
        // Toggle between front and back
        const currentFacing = scanner._currentFacingMode;
        const newFacing = currentFacing === 'environment' ? 'user' : 'environment';
        await scanner.start({ facingMode: newFacing }, scanConfig, 
          (text) => { if (typeof onScan === 'function') onScan(text); close(); },
          () => {}
        );
      } catch (e) {
        console.warn('Switch camera failed:', e);
      }
    });

    // Close on overlay click
    modalEl.querySelector('.cam-scanner-overlay').addEventListener('click', (e) => {
      if (e.target.classList.contains('cam-scanner-overlay')) close();
    });

    // Close on Escape
    const escHandler = (e) => {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); }
    };
    document.addEventListener('keydown', escHandler);
  }

  function close() {
    if (scanner && isScanning) {
      scanner.stop().then(() => {
        scanner.clear();
        scanner = null;
      }).catch(() => {
        scanner = null;
      });
    }
    isScanning = false;
    if (modalEl) {
      modalEl.remove();
      modalEl = null;
    }
  }

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1200;
      osc.type = 'sine';
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio not supported, ignore
    }
  }

  /**
   * Create a camera scan button to attach next to barcode input fields
   * @param {HTMLInputElement} inputEl - The barcode input element to fill
   * @returns {HTMLButtonElement} The camera button
   */
  function createScanButton(inputEl) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-accent cam-trigger-btn';
    btn.innerHTML = '📷';
    btn.title = 'Scan via Kamera HP';
    btn.style.cssText = `
      padding: 8px 14px;
      font-size: 1.2rem;
      border-radius: var(--radius-md, 8px);
      border: 1px solid rgba(0, 210, 255, 0.3);
      background: rgba(0, 210, 255, 0.1);
      color: #00d2ff;
      cursor: pointer;
      transition: all 0.15s;
      flex-shrink: 0;
      min-height: 44px;
      min-width: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(0, 210, 255, 0.2)';
      btn.style.borderColor = 'rgba(0, 210, 255, 0.5)';
      btn.style.transform = 'translateY(-1px)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'rgba(0, 210, 255, 0.1)';
      btn.style.borderColor = 'rgba(0, 210, 255, 0.3)';
      btn.style.transform = 'translateY(0)';
    });

    btn.addEventListener('click', () => {
      open((barcodeText) => {
        inputEl.value = barcodeText;
        // Trigger input event so auto-fill logic fires
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        inputEl.focus();
      });
    });

    return btn;
  }

  return { open, close, createScanButton };
})();

window.CameraScanner = CameraScanner;
export default CameraScanner;
