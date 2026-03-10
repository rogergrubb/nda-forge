"use client";
import { useState } from "react";
import Script from "next/script";

// ─── CARBON ADS ────────────────────────────────────────────────────────────────
// Sign up at https://www.carbonads.net — replace these after approval
// The ad slot renders automatically once you set real values here.
const CARBON_ADS_SERVE     = "REPLACE_WITH_CARBON_ADS_SERVE_ID";      // e.g. "CW7DC2JI"
const CARBON_ADS_PLACEMENT = "REPLACE_WITH_CARBON_ADS_PLACEMENT";     // e.g. "ndaforgecom"
// ──────────────────────────────────────────────────────────────────────────────

const JURISDICTIONS = [
  "California, USA","New York, USA","Texas, USA","Florida, USA","Delaware, USA",
  "Federal (USA)","England & Wales","Canada","Australia","European Union","Other",
];

const DURATIONS = ["1 year","2 years","3 years","5 years","Indefinite"];

const CONFIDENTIAL_TYPES = [
  "Business plans & strategy",
  "Financial data & projections",
  "Technical information & source code",
  "Customer & client data",
  "Product roadmaps & designs",
  "Marketing & sales information",
  "Personnel & HR information",
  "Trade secrets",
];

const FAQ_ITEMS = [
  {
    q: "What is a Non-Disclosure Agreement (NDA)?",
    a: "An NDA is a legally binding contract that establishes a confidential relationship between two parties. It prevents the receiving party from sharing or using confidential information shared by the disclosing party without permission.",
  },
  {
    q: "What's the difference between a unilateral and mutual NDA?",
    a: "A unilateral (one-way) NDA protects information flowing in one direction — from the disclosing party to the receiving party. A mutual NDA protects information flowing both ways, which is common in partnership discussions where both sides share sensitive information.",
  },
  {
    q: "Is an AI-generated NDA legally enforceable?",
    a: "Yes. An AI-generated NDA contains all the standard legally required elements. For complex situations or high-value deals, we recommend having a lawyer review the document. For most standard business NDAs, our generated agreements are fully sufficient.",
  },
  {
    q: "What format is the download?",
    a: "You receive a clean, professionally formatted PDF ready to print or send for digital signature. You can also copy the text to use in your preferred document tool.",
  },
  {
    q: "How long does the NDA remain in effect?",
    a: "You choose the duration when generating your NDA — options range from 1 year to indefinite. The confidentiality obligation applies for your selected period, after which the receiving party is no longer bound (except for trade secrets, which may be protected indefinitely under applicable law).",
  },
];

interface FormData {
  disclosingName: string;
  disclosingType: "individual" | "company";
  receivingName: string;
  receivingType: "individual" | "company";
  contactEmail: string;
  ndaType: "unilateral" | "mutual";
  purpose: string;
  confTypes: string[];
  duration: string;
  jurisdiction: string;
}

const defaultForm: FormData = {
  disclosingName: "",
  disclosingType: "company",
  receivingName: "",
  receivingType: "company",
  contactEmail: "",
  ndaType: "unilateral",
  purpose: "",
  confTypes: [],
  duration: "2 years",
  jurisdiction: "California, USA",
};

interface GeneratedNDA {
  text: string;
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [nda, setNda] = useState<GeneratedNDA | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const set = (k: keyof FormData, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const toggleConfType = (t: string) => {
    set("confTypes", form.confTypes.includes(t)
      ? form.confTypes.filter(x => x !== t)
      : [...form.confTypes, t]);
  };

  const step1Valid = form.disclosingName && form.receivingName && form.contactEmail;
  const step2Valid = form.purpose && form.confTypes.length > 0;

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    setNda(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNda(data);
      localStorage.setItem("nf_nda", JSON.stringify(data));
      localStorage.setItem("nf_form", JSON.stringify(form));
      setTimeout(() => document.getElementById("preview")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setError("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ formData: form }),
      });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setError("Checkout failed. Please try again.");
      setCheckoutLoading(false);
    }
  };

  const previewText = nda ? nda.text.slice(0, 900) : "";
  const hiddenText = nda ? nda.text.slice(900) : "";

  return (
    <main className="min-h-screen bg-white">

      {/* ── Header ── */}
      <header className="border-b border-[#e3e8ee] bg-white">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center">
          <span className="font-semibold text-[#1a1f36] tracking-tight">NDAForge</span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl font-bold text-[#1a1f36] leading-tight mb-3">
          Generate a Professional NDA in Minutes
        </h1>
        <p className="text-lg text-[#697386] max-w-xl mx-auto">
          Answer a few questions. Get a legally structured Non-Disclosure Agreement. Download as PDF for $9.
        </p>
      </section>

      {/* ── Form Card ── */}
      <div className="max-w-2xl mx-auto px-4 pb-10">
        <div className="bg-white border border-[#e3e8ee] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">

          {/* Progress */}
          <div className="px-8 pt-6 pb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#697386] font-medium">Step {step} of 3</span>
              <span className="text-xs text-[#697386]">
                {step === 1 ? "The Parties" : step === 2 ? "Agreement Details" : "Generating"}
              </span>
            </div>
            <div className="h-0.5 bg-[#e3e8ee] rounded-full">
              <div
                className="h-0.5 bg-[#635bff] rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-8 pt-6">

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-base font-semibold text-[#1a1f36]">Who is involved?</h2>

                {/* Disclosing Party */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1f36] mb-0.5">
                      Disclosing Party
                    </label>
                    <p className="text-xs text-[#697386] mb-2">The party sharing confidential information</p>
                    <input
                      type="text"
                      placeholder="Full name or company name"
                      value={form.disclosingName}
                      onChange={e => set("disclosingName", e.target.value)}
                      className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1a1f36] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#635bff]/30 focus:border-[#635bff] transition-colors"
                    />
                  </div>
                  <div className="flex gap-4">
                    {(["individual", "company"] as const).map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={form.disclosingType === t}
                          onChange={() => set("disclosingType", t)}
                          className="accent-[#635bff]"
                        />
                        <span className="text-sm text-[#697386] capitalize">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#e3e8ee]" />

                {/* Receiving Party */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1f36] mb-0.5">
                      Receiving Party
                    </label>
                    <p className="text-xs text-[#697386] mb-2">The party receiving confidential information</p>
                    <input
                      type="text"
                      placeholder="Full name or company name"
                      value={form.receivingName}
                      onChange={e => set("receivingName", e.target.value)}
                      className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1a1f36] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#635bff]/30 focus:border-[#635bff] transition-colors"
                    />
                  </div>
                  <div className="flex gap-4">
                    {(["individual", "company"] as const).map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={form.receivingType === t}
                          onChange={() => set("receivingType", t)}
                          className="accent-[#635bff]"
                        />
                        <span className="text-sm text-[#697386] capitalize">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#e3e8ee]" />

                {/* Contact Email */}
                <div>
                  <label className="block text-sm font-medium text-[#1a1f36] mb-1">
                    Contact Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={form.contactEmail}
                    onChange={e => set("contactEmail", e.target.value)}
                    className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1a1f36] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#635bff]/30 focus:border-[#635bff] transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  onClick={() => {
                    if (step1Valid) { setError(""); setStep(2); }
                    else setError("Please fill in all required fields.");
                  }}
                  className="w-full bg-[#635bff] hover:bg-[#5851e6] text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
                >
                  Continue
                </button>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-base font-semibold text-[#1a1f36]">Agreement details</h2>

                {/* NDA Type */}
                <div>
                  <label className="block text-sm font-medium text-[#1a1f36] mb-2">NDA Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { value: "unilateral", label: "One-Way (Unilateral)", desc: "Only the receiving party is bound" },
                      { value: "mutual", label: "Mutual (Bilateral)", desc: "Both parties are bound" },
                    ] as const).map(({ value, label, desc }) => (
                      <button
                        key={value}
                        onClick={() => set("ndaType", value)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          form.ndaType === value
                            ? "border-[#635bff] bg-[#f5f4ff]"
                            : "border-[#e3e8ee] hover:border-[#c1c5ce]"
                        }`}
                      >
                        <p className="text-sm font-medium text-[#1a1f36]">{label}</p>
                        <p className="text-xs text-[#697386] mt-0.5">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-[#1a1f36] mb-1">
                    Purpose of disclosure <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Evaluating a potential business partnership to develop a SaaS product together"
                    value={form.purpose}
                    onChange={e => set("purpose", e.target.value)}
                    className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1a1f36] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#635bff]/30 focus:border-[#635bff] transition-colors resize-none"
                  />
                </div>

                {/* Confidential Info Types */}
                <div>
                  <label className="block text-sm font-medium text-[#1a1f36] mb-2">
                    Types of confidential information <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONFIDENTIAL_TYPES.map(t => (
                      <label key={t} className="flex items-start gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={form.confTypes.includes(t)}
                          onChange={() => toggleConfType(t)}
                          className="accent-[#635bff] mt-0.5"
                        />
                        <span className="text-sm text-[#697386] group-hover:text-[#1a1f36] transition-colors">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1f36] mb-1">Duration</label>
                    <select
                      value={form.duration}
                      onChange={e => set("duration", e.target.value)}
                      className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1a1f36] focus:outline-none focus:ring-2 focus:ring-[#635bff]/30 focus:border-[#635bff] bg-white transition-colors"
                    >
                      {DURATIONS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1f36] mb-1">Governing Law</label>
                    <select
                      value={form.jurisdiction}
                      onChange={e => set("jurisdiction", e.target.value)}
                      className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1a1f36] focus:outline-none focus:ring-2 focus:ring-[#635bff]/30 focus:border-[#635bff] bg-white transition-colors"
                    >
                      {JURISDICTIONS.map(j => <option key={j}>{j}</option>)}
                    </select>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep(1); setError(""); }}
                    className="flex-1 border border-[#e3e8ee] hover:border-[#c1c5ce] text-[#697386] hover:text-[#1a1f36] font-medium py-2.5 rounded-lg transition-colors text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (step2Valid) { setError(""); setStep(3); handleGenerate(); }
                      else setError("Please fill in the purpose and select at least one type of confidential information.");
                    }}
                    disabled={loading}
                    className="flex-grow bg-[#635bff] hover:bg-[#5851e6] disabled:bg-[#a5a0ff] text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
                  >
                    Generate NDA
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3 — Loading ── */}
            {step === 3 && loading && (
              <div className="py-16 flex flex-col items-center text-center">
                <svg className="animate-spin h-8 w-8 text-[#635bff] mb-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <p className="text-[#1a1f36] font-medium">Generating your NDA</p>
                <p className="text-[#697386] text-sm mt-1">This takes about 20 seconds</p>
              </div>
            )}

            {/* ── STEP 3 — Error ── */}
            {step === 3 && !loading && error && (
              <div className="py-8 text-center">
                <p className="text-red-600 mb-4 text-sm">{error}</p>
                <button
                  onClick={() => { setStep(2); setError(""); }}
                  className="text-[#635bff] hover:underline text-sm font-medium"
                >
                  Go back
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Preview Section ── */}
      {nda && !loading && (
        <div id="preview" className="max-w-2xl mx-auto px-4 pb-16">
          <div className="bg-white border border-[#e3e8ee] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="bg-[#f6f9fc] border-b border-[#e3e8ee] px-6 py-4">
              <p className="font-semibold text-[#1a1f36] text-sm">Your NDA is ready</p>
              <p className="text-xs text-[#697386] mt-0.5">
                {form.ndaType === "mutual" ? "Mutual" : "Unilateral"} NDA — {form.disclosingName} / {form.receivingName}
              </p>
            </div>

            <div className="p-6">
              <div className="relative">
                <pre className="whitespace-pre-wrap text-sm text-[#1a1f36] font-sans leading-relaxed">{previewText}</pre>
                {hiddenText && (
                  <div className="relative">
                    <pre className="whitespace-pre-wrap text-sm text-[#1a1f36] font-sans leading-relaxed blurred-text select-none">{hiddenText}</pre>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-6 pt-24 bg-gradient-to-t from-white to-transparent">
                  <p className="text-[#1a1f36] font-semibold text-base mb-1">Full NDA ready for download</p>
                  <p className="text-[#697386] text-sm mb-5">One-time payment — $9</p>
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="bg-[#635bff] hover:bg-[#5851e6] disabled:bg-[#a5a0ff] text-white font-medium py-2.5 px-8 rounded-lg shadow-sm transition-colors text-sm"
                  >
                    {checkoutLoading ? "Redirecting to checkout..." : "Unlock & Download PDF — $9"}
                  </button>
                  <p className="text-xs text-[#697386] mt-3">Secure payment via Stripe. Instant PDF delivery.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── What's Included ── */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-sm font-semibold text-[#1a1f36] uppercase tracking-wide mb-4">What&apos;s included</h2>
            <ul className="space-y-2">
              {[
                "Definition of confidential information",
                "Obligations of the receiving party",
                "Permitted disclosures and exceptions",
                "Term and duration of confidentiality",
                "Return or destruction of materials",
                "Remedies for breach",
                "Governing law and jurisdiction",
              ].map(item => (
                <li key={item} className="text-sm text-[#697386] flex items-start gap-2">
                  <span className="text-[#635bff] mt-0.5 shrink-0">&#8212;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#1a1f36] uppercase tracking-wide mb-4">Why NDAForge</h2>
            <ul className="space-y-2">
              {[
                "AI writes custom clauses, not template swaps",
                "Supports mutual and unilateral NDAs",
                "Any jurisdiction: US states, UK, Canada, EU",
                "One-time $9 — no subscription",
                "Clean PDF ready for signature",
                "No account or signup required",
              ].map(item => (
                <li key={item} className="text-sm text-[#697386] flex items-start gap-2">
                  <span className="text-[#635bff] mt-0.5 shrink-0">&#8212;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Carbon Ads (renders only after Carbon Ads account is configured) ── */}
      {CARBON_ADS_SERVE !== "REPLACE_WITH_CARBON_ADS_SERVE_ID" && (
        <div className="max-w-2xl mx-auto px-6 pb-8 flex justify-center">
          <Script
            src={`//cdn.carbonads.com/carbon.js?serve=${CARBON_ADS_SERVE}&placement=${CARBON_ADS_PLACEMENT}`}
            id="_carbonads_js_main"
            strategy="lazyOnload"
          />
          <div id="carbonads" />
        </div>
      )}

      {/* ── FAQ ── */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <h2 className="text-sm font-semibold text-[#1a1f36] uppercase tracking-wide mb-6">Frequently Asked Questions</h2>
        <div className="divide-y divide-[#e3e8ee]">
          {FAQ_ITEMS.map(({ q, a }, i) => (
            <div key={q}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between py-4 text-left gap-4 group"
              >
                <span className="text-sm font-medium text-[#1a1f36] group-hover:text-[#635bff] transition-colors">{q}</span>
                <span className="text-[#697386] shrink-0 text-lg leading-none">
                  {openFaq === i ? "−" : "+"}
                </span>
              </button>
              {openFaq === i && (
                <p className="text-sm text-[#697386] leading-relaxed pb-4">{a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#e3e8ee] py-8">
        <div className="max-w-2xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm font-semibold text-[#1a1f36]">NDAForge</span>
          <p className="text-xs text-[#697386] text-center">
            Not a law firm. Generated documents are not legal advice. Consult a lawyer for high-stakes agreements.
          </p>
          <a
            href="https://getpolicyforge.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#635bff] hover:underline whitespace-nowrap"
          >
            PolicyForge
          </a>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is a Non-Disclosure Agreement (NDA)?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "An NDA is a legally binding contract that establishes a confidential relationship between two parties, preventing disclosure of confidential information.",
                },
              },
              {
                "@type": "Question",
                name: "Is an AI-generated NDA legally enforceable?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. AI-generated NDAs contain all standard legally required elements and are suitable for most standard business situations.",
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
