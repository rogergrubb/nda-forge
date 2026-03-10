"use client";
import { useState } from "react";

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

interface FormData {
  // Step 1 — Parties
  disclosingName: string;
  disclosingType: "individual" | "company";
  receivingName: string;
  receivingType: "individual" | "company";
  contactEmail: string;
  // Step 2 — Agreement
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
      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-50 to-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-sm font-medium px-3 py-1 rounded-full mb-6">
            No signup required
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Free AI NDA Generator
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Generate a professional Non-Disclosure Agreement in 30 seconds. Free preview — download as PDF for $9.
          </p>
          <p className="text-sm text-gray-400">Mutual &amp; unilateral NDAs. Any jurisdiction. Used by 500+ businesses.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Step Indicator */}
          <div className="flex border-b border-gray-100">
            {[
              { n: 1, label: "The Parties" },
              { n: 2, label: "The Agreement" },
              { n: 3, label: "Generate" },
            ].map(({ n, label }) => (
              <div key={n} className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                step === n ? "text-slate-700 border-b-2 border-slate-700 bg-slate-50" :
                step > n ? "text-green-600 bg-green-50" : "text-gray-400"
              }`}>
                {step > n ? "✓ " : `${n}. `}{label}
              </div>
            ))}
          </div>

          <div className="p-8">
            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900">Who is involved?</h2>

                {/* Disclosing Party */}
                <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700">Disclosing Party <span className="text-gray-400 font-normal">(sharing the confidential info)</span></p>
                  <input type="text" placeholder="Full name or company name" value={form.disclosingName}
                    onChange={e => set("disclosingName", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                  <div className="flex gap-3">
                    {(["individual","company"] as const).map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={form.disclosingType === t} onChange={() => set("disclosingType", t)}
                          className="accent-slate-700" />
                        <span className="text-sm text-gray-600 capitalize">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Receiving Party */}
                <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700">Receiving Party <span className="text-gray-400 font-normal">(receiving the confidential info)</span></p>
                  <input type="text" placeholder="Full name or company name" value={form.receivingName}
                    onChange={e => set("receivingName", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                  <div className="flex gap-3">
                    {(["individual","company"] as const).map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={form.receivingType === t} onChange={() => set("receivingType", t)}
                          className="accent-slate-700" />
                        <span className="text-sm text-gray-600 capitalize">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email <span className="text-red-500">*</span></label>
                  <input type="email" placeholder="you@company.com" value={form.contactEmail}
                    onChange={e => set("contactEmail", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                </div>

                <button onClick={() => { if (step1Valid) setStep(2); else setError("Please fill in all required fields."); }}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-xl transition-colors">
                  Next: The Agreement →
                </button>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900">Agreement details</h2>

                {/* NDA Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NDA Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { value: "unilateral", label: "One-Way (Unilateral)", desc: "Only the receiving party is bound" },
                      { value: "mutual", label: "Mutual (Bilateral)", desc: "Both parties are bound" },
                    ] as const).map(({ value, label, desc }) => (
                      <button key={value} onClick={() => set("ndaType", value)}
                        className={`p-3 rounded-xl border-2 text-left transition-colors ${
                          form.ndaType === value ? "border-slate-700 bg-slate-50" : "border-gray-200 hover:border-gray-300"
                        }`}>
                        <p className="text-sm font-medium text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500 mt-1">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of disclosure <span className="text-red-500">*</span></label>
                  <textarea rows={3} placeholder="e.g. Evaluating a potential business partnership to develop a SaaS product together"
                    value={form.purpose} onChange={e => set("purpose", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none" />
                </div>

                {/* Confidential Info Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Types of confidential information <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONFIDENTIAL_TYPES.map(t => (
                      <label key={t} className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.confTypes.includes(t)} onChange={() => toggleConfType(t)}
                          className="accent-slate-700 mt-0.5" />
                        <span className="text-sm text-gray-600">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <select value={form.duration} onChange={e => set("duration", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white">
                      {DURATIONS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Governing Law</label>
                    <select value={form.jurisdiction} onChange={e => set("jurisdiction", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white">
                      {JURISDICTIONS.map(j => <option key={j}>{j}</option>)}
                    </select>
                  </div>
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

                <div className="flex gap-3">
                  <button onClick={() => { setStep(1); setError(""); }}
                    className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 font-medium py-3 rounded-xl transition-colors">
                    ← Back
                  </button>
                  <button onClick={() => { if (step2Valid) { setStep(3); setError(""); handleGenerate(); } else setError("Please fill in the purpose and select at least one type of confidential information."); }}
                    disabled={loading}
                    className="flex-2 flex-grow bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-semibold py-3 rounded-xl transition-colors">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Generating NDA...
                      </span>
                    ) : "Generate My NDA →"}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3 — LOADING STATE ── */}
            {step === 3 && loading && (
              <div className="py-16 flex flex-col items-center text-center">
                <svg className="animate-spin h-10 w-10 text-slate-600 mb-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <p className="text-gray-600 font-medium">Generating your NDA...</p>
                <p className="text-gray-400 text-sm mt-1">This takes about 20 seconds</p>
              </div>
            )}

            {/* ── STEP 3 — ERROR ── */}
            {step === 3 && !loading && error && (
              <div className="py-8 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button onClick={() => { setStep(2); setError(""); }} className="text-slate-700 underline text-sm">← Go back</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── PREVIEW SECTION ── */}
      {nda && !loading && (
        <div id="preview" className="max-w-2xl mx-auto px-4 pb-16">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Your NDA is ready</p>
                <p className="text-xs text-gray-500 mt-0.5">{form.ndaType === "mutual" ? "Mutual" : "Unilateral"} NDA — {form.disclosingName} / {form.receivingName}</p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">Preview</span>
            </div>

            <div className="p-6">
              <div className="relative">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{previewText}</pre>
                {hiddenText && (
                  <div className="relative">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed blurred-text select-none">{hiddenText}</pre>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white"/>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-4 pt-20 bg-gradient-to-t from-white to-transparent">
                  <div className="text-center mb-4">
                    <div className="text-2xl mb-1">🔒</div>
                    <p className="text-gray-900 font-semibold">Full NDA ready for download</p>
                    <p className="text-gray-500 text-sm mt-1">PDF download — one-time $9</p>
                  </div>
                  <button onClick={handleCheckout} disabled={checkoutLoading}
                    className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-colors">
                    {checkoutLoading ? "Redirecting to checkout..." : "Unlock & Download PDF — $9"}
                  </button>
                  <p className="text-xs text-gray-400 mt-2">Secure payment via Stripe. Instant PDF after payment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO Content */}
      <div className="max-w-2xl mx-auto px-4 pb-16 space-y-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">What&apos;s included in your NDA?</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              {["Definition of confidential information","Obligations of the receiving party","Permitted disclosures and exceptions","Term and duration of confidentiality","Return or destruction of materials","Remedies for breach","Governing law and jurisdiction"].map(item => (
                <li key={item} className="flex items-start gap-2"><span className="text-slate-600 mt-0.5">✓</span>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Why NDAForge?</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              {["AI writes custom clauses — not a template swap","Mutual and unilateral NDA support","Any jurisdiction: US states, UK, Canada, EU","$9 one-time — no subscription","Clean PDF ready for signature","No account or signup required"].map(item => (
                <li key={item} className="flex items-start gap-2"><span className="text-slate-600 mt-0.5">✓</span>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {["No Signup Required","Instant Generation","Any Jurisdiction","One-Time $9","Clean PDF Output","Mutual & Unilateral"].map(badge => (
            <span key={badge} className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">{badge}</span>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {[
              { q: "What is a Non-Disclosure Agreement (NDA)?", a: "An NDA is a legally binding contract that establishes a confidential relationship between two parties. It prevents the receiving party from sharing or using confidential information shared by the disclosing party without permission." },
              { q: "What's the difference between a unilateral and mutual NDA?", a: "A unilateral (one-way) NDA protects information flowing in one direction — from the disclosing party to the receiving party. A mutual NDA protects information flowing both ways, which is common in partnership discussions where both sides share sensitive information." },
              { q: "Is an AI-generated NDA legally enforceable?", a: "Yes. An AI-generated NDA contains all the standard legally required elements. For complex situations or high-value deals, we recommend having a lawyer review the document. For most standard business NDAs, our generated agreements are fully sufficient." },
              { q: "What format is the download?", a: "You receive a clean, professionally formatted PDF ready to print or send for digital signature. You can also copy the text to use in your preferred document tool." },
              { q: "How long does the NDA remain in effect?", a: "You choose the duration when generating your NDA — options range from 1 year to indefinite. The default confidentiality obligation period is set to your selected duration, after which the receiving party is no longer bound (except for trade secrets, which may be protected indefinitely under applicable law)." },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-gray-100 pb-5">
                <h3 className="font-medium text-gray-900 mb-2">{q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-600">Also need a Privacy Policy or Terms of Service?</p>
          <a href="https://getpolicyforge.com" target="_blank" rel="noopener noreferrer"
            className="text-slate-700 font-medium text-sm hover:underline mt-1 inline-block">
            Generate them free at PolicyForge →
          </a>
        </div>
      </div>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>NDAForge — AI-powered NDA generator</p>
        <p className="mt-1 text-xs">Not a law firm. Generated documents are templates — consult a lawyer for high-stakes agreements.</p>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "What is a Non-Disclosure Agreement (NDA)?",
            acceptedAnswer: { "@type": "Answer", text: "An NDA is a legally binding contract that establishes a confidential relationship between two parties, preventing disclosure of confidential information." } },
          { "@type": "Question", name: "Is an AI-generated NDA legally enforceable?",
            acceptedAnswer: { "@type": "Answer", text: "Yes. AI-generated NDAs contain all standard legally required elements and are suitable for most standard business situations." } },
        ]
      }) }} />
    </main>
  );
}
