import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookingId, carName, startDate, endDate } = await request.json();

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Create Stripe Checkout session for £100 deposit
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "payment_method_types[]": "card",
        "line_items[0][price_data][currency]": "gbp",
        "line_items[0][price_data][product_data][name]": `Security Deposit — ${carName}`,
        "line_items[0][price_data][product_data][description]": `Refundable deposit for ${startDate} to ${endDate}`,
        "line_items[0][price_data][unit_amount]": "10000",
        "line_items[0][quantity]": "1",
        "mode": "payment",
        "success_url": `${siteUrl}/dashboard?deposit=success&booking=${bookingId}`,
        "cancel_url": `${siteUrl}/cars`,
        "metadata[booking_id]": bookingId,
        "metadata[type]": "security_deposit",
      }),
    });

    const session_data = await response.json();
    if (session_data.error) throw new Error(session_data.error.message);

    // Save checkout session ID to booking
    await supabase
      .from("bookings")
      .update({ payment_notes: `Deposit checkout: ${session_data.id}` })
      .eq("id", bookingId);

    return NextResponse.json({ url: session_data.url });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
