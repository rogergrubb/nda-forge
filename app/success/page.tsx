import { redirect } from "next/navigation";
import Stripe from "stripe";
import OpenAI from "openai";
import NDAViewer from "./NDAViewer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateNDA(meta: Stripe.Metadata): Promise<string> {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const confTypes = (meta.confTypes || "").split("|").filter(Boolean);

  const prompt = `Generate a professional, comprehensive Non-Disclosure Agreement (NDA) based on the following details.

Agreement Details:
- Type: ${meta.ndaType === "mutual" ? "Mutual (Bilateral) NDA — both parties are bound" : "Unilateral (One-Way) NDA — only the receiving party is bound"}
- Disclosing Party: ${meta.disclosingName} (${meta.disclosingType})
- Receiving Party: ${meta.receivingName} (${meta.receivingType})
- Purpose: ${meta.purpose}
- Types of Confidential Information: ${confTypes.join(", ")}
- Duration of Confidentiality: ${meta.duration}
- Governing Law: ${meta.jurisdiction}
- Contact / Notice Email: ${meta.contactEmail}
- Effective Date: ${today}

Write a complete, professional NDA with proper legal language including all standard sections: parties and recitals, definition of confidential information, obligations, permitted disclosures, term and duration, return of materials, no license, injunctive relief, general provisions, governing law, and signature blocks.

Output ONLY the NDA document text.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 3000,
    temperature: 0.2,
  });

  return completion.choices[0]?.message?.content?.trim() || "";
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  if (!sessionId) redirect("/");

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    redirect("/");
  }

  if (session.payment_status !== "paid") redirect("/");

  const meta = session.metadata || {};
  if (!meta.disclosingName) redirect("/");

  const ndaText = await generateNDA(meta);

  return (
    <NDAViewer
      ndaText={ndaText}
      disclosingName={meta.disclosingName}
      receivingName={meta.receivingName}
    />
  );
}
