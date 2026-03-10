"use client";
import { useState, useEffect } from "react";

interface Props { ndaText: string; disclosingName: string; receivingName: string; }

export default function NDAViewer({ ndaText, disclosingName, receivingName }: Props) {
  const [copied, setCopied] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: string; color: string; delay: string }>>([]);

  useEffect(() => {
    const pieces = Array.from({ length: 40 }, (_, i) => ({
      id: i, left: `${Math.random() * 100}%`,
      color: ["#334155","#475569","#64748b","#0ea5e9","#6366f1"][Math.floor(Math.random() * 5)],
      delay: `${Math.random() * 2}s`,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 4000);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(ndaText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const handleDownloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const usableWidth = pageWidth - margin * 2;
    const lineHeight = 6;
    const fontSize = 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);

    const lines = doc.splitTextToSize(ndaText, usableWidth);
    let y = margin;

    for (const line of lines) {
      if (y + lineHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }

    const fileName = `NDA-${disclosingName.replace(/\s+/g, "-")}-${receivingName.replace(/\s+/g, "-")}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="min-h-screen bg-white">
      {confetti.map(p => (
        <div key={p.id} className="confetti-piece" style={{ left: p.left, top: "-20px", backgroundColor: p.color, animationDelay: p.delay }} />
      ))}

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your NDA is ready!</h1>
          <p className="text-gray-500">
            Non-Disclosure Agreement — <strong>{disclosingName}</strong> &amp; <strong>{receivingName}</strong>
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex gap-3 p-4 bg-gray-50 border-b border-gray-100">
            <button onClick={handleCopy}
              className="flex items-center gap-2 text-sm font-medium bg-white border border-gray-200 hover:border-slate-400 text-gray-700 hover:text-slate-700 px-4 py-2 rounded-lg transition-colors">
              {copied ? "✓ Copied!" : "Copy to clipboard"}
            </button>
            <button onClick={handleDownloadPDF}
              className="flex items-center gap-2 text-sm font-medium bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg transition-colors">
              ↓ Download PDF
            </button>
          </div>
          <div className="p-6 max-h-[65vh] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{ndaText}</pre>
          </div>
        </div>

        <div className="mt-8 bg-slate-50 rounded-xl p-6">
          <h3 className="font-semibold text-slate-900 mb-3">Next steps</h3>
          <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
            <li>Download the PDF using the button above</li>
            <li>Review and fill in any signature fields</li>
            <li>Send to the other party for review and signature</li>
            <li>Both parties sign — consider using DocuSign or HelloSign for e-signatures</li>
            <li>Keep a signed copy on file for your records</li>
          </ol>
        </div>

        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-gray-500">Also need a Privacy Policy or Terms of Service?</p>
          <a href="https://getpolicyforge.com" target="_blank" rel="noopener noreferrer"
            className="text-slate-700 font-medium text-sm hover:underline">Generate them at PolicyForge →</a>
        </div>

        <div className="text-center mt-4">
          <a href="/" className="text-sm text-gray-400 hover:text-gray-600">Generate another NDA</a>
        </div>
      </div>
    </div>
  );
}
