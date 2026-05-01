'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';

interface ScannerViewProps {
  eventId: string;
  onScanSuccess: (ticketId: string) => Promise<void>;
}

export default function ScannerView({ eventId, onScanSuccess }: ScannerViewProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<'idle' | 'success' | 'error' | 'processing'>('idle');
  const processingRef = useRef(false);

  const startScanning = async () => {
    try {
      if (scannerRef.current) { try { await scannerRef.current.stop(); } catch {} }
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 };

      const qrCodeSuccessCallback = async (decodedText: string) => {
        if (processingRef.current) return;
        processingRef.current = true;
        setScanResult('processing'); setLastScanned(decodedText);
        try {
          await onScanSuccess(decodedText); setScanResult('success');
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        } catch (err: any) { setScanResult('error'); toast.error(err.message || 'Check-in failed'); }
        finally { setTimeout(() => { processingRef.current = false; setScanResult('idle'); }, 2500); }
      };

      try { await scanner.start({ facingMode: 'environment' }, config, qrCodeSuccessCallback, () => {}); }
      catch { try { await scanner.start({ facingMode: 'user' }, config, qrCodeSuccessCallback, () => {}); } catch { await scanner.start({}, config, qrCodeSuccessCallback, () => {}); } }
      setIsScanning(true);
    } catch (err: any) {
      console.error('Camera error:', err);
      toast.error(err?.toString().includes('NotFoundError') ? 'No camera found on this device.' : 'Unable to access camera. Please check permissions.');
    }
  };

  const stopScanning = async () => { if (scannerRef.current) { try { await scannerRef.current.stop(); } catch {} scannerRef.current = null; } setIsScanning(false); };

  useEffect(() => { return () => { stopScanning(); }; }, []);

  const statusBg = scanResult === 'success' ? 'var(--color-primary-container-base)' : scanResult === 'error' ? 'var(--color-error-container-base)' : scanResult === 'processing' ? 'var(--color-tertiary-container-base)' : 'var(--color-surface-container-base)';

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all" style={{ borderColor: scanResult === 'success' ? '#16a34a' : scanResult === 'error' ? '#dc2626' : scanResult === 'processing' ? '#ca8a04' : 'black' }}>
        <div id="qr-reader" className="w-full" style={{ minHeight: '300px', background: 'var(--color-surface-container-base)' }} />
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" style={{ background: 'var(--color-surface-container-base)' }}>
            <div className="w-20 h-20 flex items-center justify-center border-4 border-black" style={{ background: 'var(--color-primary-container-base)' }}>
              <span className="material-symbols-outlined text-4xl">qr_code_scanner</span>
            </div>
            <p className="text-on-surface-variant text-sm font-label font-bold uppercase tracking-wider text-center max-w-[200px]">Tap below to start scanning tickets</p>
          </div>
        )}
      </div>

      {lastScanned && (
        <div className="p-4 flex items-center gap-4 border-4 border-black" style={{ background: statusBg }}>
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {scanResult === 'success' ? 'check_circle' : scanResult === 'error' ? 'error' : 'pending'}
          </span>
          <div>
            <p className="font-label font-black text-sm uppercase text-on-surface">{scanResult === 'success' ? 'Check-in Successful!' : scanResult === 'error' ? 'Check-in Failed' : 'Processing...'}</p>
            <p className="text-xs text-on-surface-variant font-mono tracking-wider">Ticket: {lastScanned}</p>
          </div>
        </div>
      )}

      <button onClick={isScanning ? stopScanning : startScanning}
        className="w-full py-4 font-label font-black text-base uppercase tracking-wider flex items-center justify-center gap-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:scale-[0.98]"
        style={isScanning ? { background: 'var(--color-surface-container-base)', color: 'var(--color-on-surface-base)' } : { background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{isScanning ? 'stop_circle' : 'qr_code_scanner'}</span>
        {isScanning ? 'Stop Scanner' : 'Start Scanner'}
      </button>
    </div>
  );
}
