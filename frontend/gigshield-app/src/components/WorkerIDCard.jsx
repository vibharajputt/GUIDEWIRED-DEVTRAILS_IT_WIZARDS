import React, { useRef } from 'react';
import { Download, Shield } from 'lucide-react';

export default function WorkerIDCard({ worker }) {
  const canvasRef = useRef(null);

  const generateCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const w = 600, h = 340;
    canvas.width = w;
    canvas.height = h;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e1b4b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.roundRect(0, 0, w, h, 20);
    ctx.fill();

    // Top accent bar
    const accentGrad = ctx.createLinearGradient(0, 0, w, 0);
    accentGrad.addColorStop(0, '#3b82f6');
    accentGrad.addColorStop(0.5, '#6366f1');
    accentGrad.addColorStop(1, '#22c55e');
    ctx.fillStyle = accentGrad;
    ctx.fillRect(0, 0, w, 5);

    // Logo area
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(45, 45, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GS', 45, 51);

    // Title
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('RahatPay', 75, 42);
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText('VERIFIED WORKER IDENTITY CARD', 75, 58);

    // Worker name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(worker.name || 'Worker', 30, 110);

    // Details
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#94a3b8';
    const details = [
      [`Token ID: ${worker.token || 'N/A'}`, 145],
      [`Platform: ${(worker.platform || 'N/A').toUpperCase()}`, 170],
      [`Zone: ${worker.zone || 'N/A'}`, 195],
      [`Pincode: ${worker.pincode || 'N/A'}`, 220],
    ];
    details.forEach(([text, y]) => ctx.fillText(text, 30, y));

    // Trust Score Circle
    const cx = 500, cy = 160, r = 55;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    const score = worker.trust_score || 50;
    const tierColors = { PLATINUM: '#a855f7', GOLD: '#eab308', SILVER: '#9ca3af', BRONZE: '#f97316' };
    ctx.strokeStyle = tierColors[worker.trust_tier] || '#3b82f6';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * score / 100));
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(score, cx, cy + 5);
    ctx.fillStyle = tierColors[worker.trust_tier] || '#3b82f6';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(worker.trust_tier || 'SILVER', cx, cy + 25);

    // Footer
    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, h - 50, w, 50);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.fillText(`Issued: ${new Date().toLocaleDateString()}  |  Valid: 1 Year  |  Powered by RahatPay InsurTech`, 30, h - 22);

    // Download
    const link = document.createElement('a');
    link.download = `RahatPay_ID_${worker.token || 'worker'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <button
        onClick={generateCard}
        className="glass-panel px-4 py-2.5 rounded-xl text-sm font-bold text-brand-300 border border-brand-500/20 hover:bg-brand-500/10 transition flex items-center space-x-2 group"
      >
        <Download size={16} className="group-hover:animate-bounce" />
        <span>Download ID Card</span>
      </button>
    </>
  );
}
