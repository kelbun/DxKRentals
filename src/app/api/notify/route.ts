import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      type, customerEmail, customerName,
      carName, startDate, endDate, total
    } = await request.json();

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hello@dxkrentals.com";
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    if (!RESEND_API_KEY) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const emails: any[] = [];

    const baseStyle = `font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;`;
    const header = `<h1 style="color:#D4AF37;font-size:24px;margin-bottom:4px;">DxK Rentals</h1><p style="color:#71717A;font-size:12px;margin-bottom:32px;text-transform:uppercase;letter-spacing:2px;">Premium Luxury Car Rentals</p>`;
    const bookingSummary = `
      <div style="background:#161616;border:1px solid #27272a;border-radius:8px;padding:20px;margin:20px 0;">
        <p style="color:#71717A;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">Booking Summary</p>
        <p style="color:#fff;font-size:16px;font-weight:bold;margin-bottom:4px;">${carName}</p>
        <p style="color:#a1a1aa;font-size:13px;">${startDate} → ${endDate}</p>
        <p style="color:#D4AF37;font-size:20px;font-weight:bold;margin-top:12px;">£${total?.toLocaleString()}</p>
      </div>`;

    if (type === "booking_submitted") {
      // To customer
      emails.push({
        from: FROM_EMAIL, to: customerEmail,
        subject: "Booking Request Received — DxK Rentals",
        html: `<div style="${baseStyle}">${header}
          <h2 style="color:#fff;">Booking Request Received</h2>
          <p style="color:#a1a1aa;">Hi ${customerName}, we've received your booking request and will review it shortly.</p>
          ${bookingSummary}
          <p style="color:#a1a1aa;font-size:13px;">We'll contact you via email or WhatsApp once reviewed. A £100 refundable security deposit will be required to confirm.</p>
          <p style="color:#71717A;font-size:11px;margin-top:32px;">DxK Rentals · United Kingdom</p>
        </div>`
      });
      // To admin
      emails.push({
        from: FROM_EMAIL, to: ADMIN_EMAIL,
        subject: `🚗 New Booking — ${carName}`,
        html: `<div style="${baseStyle}">${header}
          <h2 style="color:#D4AF37;">New Booking Request</h2>
          <div style="background:#161616;border:1px solid #27272a;border-radius:8px;padding:20px;margin:16px 0;">
            <p><strong style="color:#71717A;">Customer:</strong> <span style="color:#fff;">${customerName}</span></p>
            <p><strong style="color:#71717A;">Email:</strong> <span style="color:#fff;">${customerEmail}</span></p>
            <p><strong style="color:#71717A;">Vehicle:</strong> <span style="color:#fff;">${carName}</span></p>
            <p><strong style="color:#71717A;">Dates:</strong> <span style="color:#fff;">${startDate} → ${endDate}</span></p>
            <p><strong style="color:#71717A;">Total:</strong> <span style="color:#D4AF37;font-weight:bold;">£${total?.toLocaleString()}</span></p>
          </div>
          <a href="${SITE_URL}/dashboard/bookings" style="background:#D4AF37;color:#000;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:8px;">View in Dashboard →</a>
        </div>`
      });
    }

    if (type === "booking_approved") {
      emails.push({
        from: FROM_EMAIL, to: customerEmail,
        subject: "✅ Booking Approved — DxK Rentals",
        html: `<div style="${baseStyle}">${header}
          <h2 style="color:#22C55E;">Booking Approved!</h2>
          <p style="color:#a1a1aa;">Hi ${customerName}, great news — your booking has been approved.</p>
          ${bookingSummary}
          <div style="background:#D4AF37;border-radius:8px;padding:16px;margin:20px 0;">
            <p style="color:#000;font-weight:bold;margin:0;">Next Step: Pay £100 Security Deposit</p>
            <p style="color:#000;font-size:13px;margin-top:4px;">A refundable deposit is required to confirm your rental. Log in to your dashboard to pay.</p>
          </div>
          <a href="${SITE_URL}/dashboard" style="background:#D4AF37;color:#000;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block;">Go to Dashboard →</a>
          <p style="color:#71717A;font-size:11px;margin-top:32px;">DxK Rentals · United Kingdom</p>
        </div>`
      });
    }

    if (type === "booking_rejected") {
      emails.push({
        from: FROM_EMAIL, to: customerEmail,
        subject: "Booking Update — DxK Rentals",
        html: `<div style="${baseStyle}">${header}
          <h2 style="color:#fff;">Booking Update</h2>
          <p style="color:#a1a1aa;">Hi ${customerName}, unfortunately we're unable to fulfil your request for the ${carName} on those dates.</p>
          <p style="color:#a1a1aa;">This may be due to availability or eligibility. Please browse our fleet or contact us to discuss alternatives.</p>
          <a href="${SITE_URL}/cars" style="background:#D4AF37;color:#000;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:16px;">Browse Fleet →</a>
          <p style="color:#71717A;font-size:11px;margin-top:32px;">DxK Rentals · United Kingdom</p>
        </div>`
      });
    }

    if (type === "booking_cancelled") {
      emails.push({
        from: FROM_EMAIL, to: customerEmail,
        subject: "Booking Cancelled — DxK Rentals",
        html: `<div style="${baseStyle}">${header}
          <h2 style="color:#F97316;">Booking Cancelled</h2>
          <p style="color:#a1a1aa;">Hi ${customerName}, your booking has been cancelled.</p>
          ${bookingSummary}
          <p style="color:#a1a1aa;">If you paid a security deposit, a full refund will be processed within 5–10 business days back to your original payment method.</p>
          <p style="color:#a1a1aa;">We're sorry for any inconvenience. Please don't hesitate to rebook or contact us.</p>
          <a href="${SITE_URL}/cars" style="background:#D4AF37;color:#000;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:16px;">Browse Fleet →</a>
          <p style="color:#71717A;font-size:11px;margin-top:32px;">DxK Rentals · United Kingdom</p>
        </div>`
      });
    }

    for (const email of emails) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(email),
      });
      const data = await res.json();
      if (!res.ok) console.error("Resend error:", data);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Notify error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
