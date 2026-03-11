import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://nda-forge.vercel.app",
    "X-Title": "NDAForge",
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { disclosingName, disclosingType, receivingName, receivingType,
            contactEmail, ndaType, purpose, confTypes, duration, jurisdiction } = body;

    if (!disclosingName || !receivingName || !contactEmail || !purpose) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const prompt = `Generate a professional, comprehensive Non-Disclosure Agreement (NDA) based on the following details.

Agreement Details:
- Type: ${ndaType === "mutual" ? "Mutual (Bilateral) NDA — both parties are bound" : "Unilateral (One-Way) NDA — only the receiving party is bound"}
- Disclosing Party: ${disclosingName} (${disclosingType})
- Receiving Party: ${receivingName} (${receivingType})
- Purpose: ${purpose}
- Types of Confidential Information: ${confTypes.join(", ")}
- Duration of Confidentiality: ${duration}
- Governing Law: ${jurisdiction}
- Contact / Notice Email: ${contactEmail}
- Effective Date: ${today}

Write a complete, professional NDA with proper legal language. Include all standard sections:
1. Parties and Recitals
2. Definition of Confidential Information (tailored to the specific types listed above)
3. Obligations of Receiving Party
4. Permitted Disclosures and Exceptions (standard: public domain, independently developed, legally required disclosure)
5. ${ndaType === "mutual" ? "Mutual obligations (both parties)" : "Term and Duration"}
6. Return or Destruction of Confidential Information
7. No License Granted
8. No Warranty
9. Injunctive Relief
10. General Provisions (severability, waiver, entire agreement, amendments)
11. Governing Law and Dispute Resolution
12. Signature Blocks (with placeholders for name, title, date, signature)

Make the language clear, professional, and appropriate for the ${jurisdiction} jurisdiction. Tailor the confidential information definition specifically to: ${confTypes.join(", ")}.

Output ONLY the NDA document text — no explanations, no preamble outside the document itself.`;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000,
      temperature: 0.2,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
