'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';
import { QrCode, StopCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

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

  const statusBorder = scanResult === 'success' ? 'hsl(140 70% 45%)' : scanResult === 'error' ? 'hsl(0 80% 55%)' : scanResult === 'processing' ? 'hsl(45 90% 50%)' : 'var(--cp-border)';
  const statusBg = scanResult === 'success' ? 'hsl(140 70% 45% / 0.1)' : scanResult === 'error' ? 'hsl(0 80% 55% / 0.1)' : scanResult === 'processing' ? 'hsl(45 90% 50% / 0.1)' : 'var(--cp-surface)';

  return (
    <div className="space-y-4">
      <div
        className="relative overflow-hidden transition-all"
        style={{ borderRadius: 'var(--r-xl)', border: `2px solid ${statusBorder}`, boxShadow: 'var(--shadow-md)' }}
      >
        <div id="qr-reader" className="w-full" style={{ minHeight: '300px', background: 'var(--cp-surface-dim)' }} />
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" style={{ background: 'var(--cp-surface)' }}>
            <div
              className="w-20 h-20 flex items-center justify-center rounded-2xl"
              style={{ background: 'linear-gradient(135deg, hsl(258 90% 63% / 0.15), hsl(280 80% 60% / 0.1))', border: '1.5px solid var(--cp-border)' }}
            >
              <QrCode size={36} style={{ color: 'var(--cp-primary)' }} />
            </div>
            <p className="text-sm font-semibold text-center max-w-[200px]" style={{ color: 'var(--cp-text-2)' }}>Tap below to start scanning tickets</p>
          </div>
        )}
      </div>

      {lastScanned && (
        <div
          className="p-4 flex items-center gap-4 rounded-xl"
          style={{ background: statusBg, border: `1.5px solid ${statusBorder}` }}
        >
          {scanResult === 'success' ? <CheckCircle size={28} style={{ color: 'hsl(140 70% 45%)' }} /> : scanResult === 'error' ? <XCircle size={28} style={{ color: 'hsl(0 80% 55%)' }} /> : <Loader2 size={28} className="animate-spin" style={{ color: 'hsl(45 90% 50%)' }} />}
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--cp-text-1)' }}>{scanResult === 'success' ? 'Check-in Successful!' : scanResult === 'error' ? 'Check-in Failed' : 'Processing...'}</p>
            <p className="text-xs font-mono tracking-wider" style={{ color: 'var(--cp-text-3)' }}>Ticket: {lastScanned}</p>
          </div>
        </div>
      )}

      <button onClick={isScanning ? stopScanning : startScanning}
        className={isScanning ? 'btn-secondary w-full flex items-center justify-center gap-3' : 'btn-primary w-full flex items-center justify-center gap-3'}
      >
        {isScanning ? <StopCircle size={18} /> : <QrCode size={18} />}
        {isScanning ? 'Stop Scanner' : 'Start Scanner'}
      </button>
    </div>
  );
}
