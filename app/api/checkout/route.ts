import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

export async function POST(req: NextRequest) {
  try {
    const { formData } = await req.json();
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#preview`,
      metadata: {
        disclosingName: (formData?.disclosingName || "").slice(0, 100),
        disclosingType: formData?.disclosingType || "company",
        receivingName: (formData?.receivingName || "").slice(0, 100),
        receivingType: formData?.receivingType || "company",
        contactEmail: (formData?.contactEmail || "").slice(0, 100),
        ndaType: formData?.ndaType || "unilateral",
        purpose: (formData?.purpose || "").slice(0, 400),
        confTypes: (formData?.confTypes || []).join("|").slice(0, 400),
        duration: (formData?.duration || "2 years").slice(0, 50),
        jurisdiction: (formData?.jurisdiction || "").slice(0, 100),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
