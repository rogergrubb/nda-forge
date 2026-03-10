"use client";
import { useState } from "react";
import Script from "next/script";

// ─── AFFILIATE LINKS ──────────────────────────────────────────────────────────
// Replace these with your affiliate URLs after signing up:
//   DocuSign:    https://partners.docusign.com
//   PandaDoc:    https://www.pandadoc.com/affiliate-program
//   Carbon Ads:  https://www.carbonads.net (for the ad slot below)
const DOCUSIGN_LINK   = "https://www.docusign.com/products/electronic-signature?utm_source=ndaforge&utm_medium=referral";
const PANDADOC_LINK   = "https://www.pandadoc.com/?utm_source=ndaforge&utm_medium=referral";
const CARBON_ADS_SERVE = "REPLACE_WITH_CARBON_ADS_SERVE_ID";     // e.g. "CW7DC2JI"
const CARBON_ADS_PLACEMENT = "REPLACE_WITH_CARBON_ADS_PLACEMENT"; // e.g. "ndaforgecom"
// ─────────────────────────────────────────────────────────────────────────────

interface Props { ndaText: string; disclosingName: string; receivingName: string; }

export default function NDAViewer({ ndaText, disclosingName, receivingName }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ndaText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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

  const showCarbonAds = CARBON_ADS_SERVE !== "REPLACE_WITH_CARBON_ADS_SERVE_ID";

  return (
    <div className="min-h-screen bg-white">

      {/* ── Header ── */}
      <header className="border-b border-[#e3e8ee] bg-white">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center">
          <a href="/" className="font-semibold text-[#1a1f36] tracking-tight hover:opacity-70 transition-opacity">
            NDAForge
          </a>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">

        {/* ── Confirmation ── */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-full mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1a1f36] mb-1">Your NDA is ready</h1>
          <p className="text-[#697386] text-sm">
            {disclosingName} &amp; {receivingName}
          </p>
        </div>

        {/* ── NDA Document ── */}
        <div className="bg-white border border-[#e3e8ee] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex gap-3 px-5 py-3 bg-[#f6f9fc] border-b border-[#e3e8ee]">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 text-sm font-medium bg-[#635bff] hover:bg-[#5851e6] text-white px-4 py-2 rounded-lg transition-colors"
            >
              Download PDF
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-sm font-medium bg-white border border-[#e3e8ee] hover:border-[#c1c5ce] text-[#697386] hover:text-[#1a1f36] px-4 py-2 rounded-lg transition-colors"
            >
              {copied ? "Copied" : "Copy text"}
            </button>
          </div>
          <div className="p-6 max-h-[55vh] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-[#1a1f36] font-sans leading-relaxed">{ndaText}</pre>
          </div>
        </div>

        {/* ── GET IT SIGNED — Affiliate CTA ── */}
        <div className="border border-[#e3e8ee] rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-[#f6f9fc] border-b border-[#e3e8ee]">
            <p className="text-sm font-semibold text-[#1a1f36]">Next step: get it signed</p>
            <p className="text-xs text-[#697386] mt-0.5">
              Your NDA needs signatures from both parties to be enforceable.
            </p>
          </div>
          <div className="p-5 grid sm:grid-cols-2 gap-4">

            {/* DocuSign */}
            <a
              href={DOCUSIGN_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-2 border border-[#e3e8ee] hover:border-[#635bff] rounded-lg p-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1a1f36]">DocuSign</span>
                <span className="text-xs bg-[#f5f4ff] text-[#635bff] px-2 py-0.5 rounded font-medium">
                  Free trial
                </span>
              </div>
              <p className="text-xs text-[#697386]">
                Industry-standard e-signature. Send your NDA for signature in minutes.
              </p>
              <span className="text-xs text-[#635bff] group-hover:underline font-medium mt-auto">
                Start free trial &rarr;
              </span>
            </a>

            {/* PandaDoc */}
            <a
              href={PANDADOC_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-2 border border-[#e3e8ee] hover:border-[#635bff] rounded-lg p-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1a1f36]">PandaDoc</span>
                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium">
                  Free plan
                </span>
              </div>
              <p className="text-xs text-[#697386]">
                Free e-signatures with no limits. Upload your PDF and send in seconds.
              </p>
              <span className="text-xs text-[#635bff] group-hover:underline font-medium mt-auto">
                Sign for free &rarr;
              </span>
            </a>

          </div>
        </div>

        {/* ── Carbon Ads slot (only renders after you get a Carbon Ads account) ── */}
        {showCarbonAds && (
          <div className="flex justify-center py-2">
            <Script
              src={`//cdn.carbonads.com/carbon.js?serve=${CARBON_ADS_SERVE}&placement=${CARBON_ADS_PLACEMENT}`}
              id="_carbonads_js"
              strategy="lazyOnload"
            />
            <div id="carbonads" />
          </div>
        )}

        {/* ── Footer links ── */}
        <div className="flex flex-col items-center gap-3 text-center pt-2">
          <a
            href="https://getpolicyforge.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#635bff] hover:underline"
          >
            Also need a Privacy Policy or Terms of Service? Try PolicyForge &rarr;
          </a>
          <a href="/" className="text-xs text-[#697386] hover:text-[#1a1f36]">
            Generate another NDA
          </a>
        </div>

      </div>
    </div>
  );
}
