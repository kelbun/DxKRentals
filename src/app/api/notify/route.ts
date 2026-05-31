import { NextResponse } from "next/server";

// Email sending via Resend (free tier - 3000 emails/month)
// Install: npm install resend
// Get free API key at resend.com

export async function POST(request: Request) {
  try {
    const { type, customerEmail, customerName, carName, startDate, endDate, total } = await request.json();

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@dxkrentals.com";
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hello@dxkrentals.com";

    if (!RESEND_API_KEY) {
      // Silently skip if not configured yet
      return NextResponse.json({ success: true, skipped: true });
    }

    const emails = [];

    if (type === "booking_submitted") {
      // Email to customer
      emails.push({
        from: FROM_EMAIL,
        to: customerEmail,
        subject: "Booking Request Received — DxK Rentals",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;">
            <h1 style="color:#D4AF37;font-size:28px;margin-bottom:8px;">DxK Rentals</h1>
            <p style="color:#71717A;margin-bottom:32px;">Premium Luxury Car Rentals</p>
            <h2 style="color:#fff;font-size:20px;">Booking Request Received</h2>
            <p style="color:#a1a1aa;">Hi ${customerName},</p>
            <p style="color:#a1a1aa;">We've received your booking request. Our team will review it and get back to you shortly.</p>
            <div style="background:#161616;border:1px solid #27272a;border-radius:8px;padding:20px;margin:24px 0;">
              <p style="color:#71717A;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;">Booking Summary</p>
              <p style="color:#fff;font-size:16px;font-weight:bold;margin-bottom:4px;">${carName}</p>
              <p style="color:#a1a1aa;font-size:14px;">${startDate} → ${endDate}</p>
              <p style="color:#D4AF37;font-size:20px;font-weight:bold;margin-top:12px;">£${total}</p>
              <p style="color:#71717A;font-size:12px;margin-top:4px;">+ £100 security deposit required</p>
            </div>
            <p style="color:#a1a1aa;">We'll contact you on WhatsApp or email once your booking is reviewed. Questions? Reply to this email or message us on WhatsApp.</p>
            <p style="color:#71717A;font-size:12px;margin-top:32px;">DxK Rentals — Premium Luxury Car Rentals</p>
          </div>
        `
      });

      // Email to admin
      emails.push({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `New Booking Request — ${carName}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;">
            <h2 style="color:#D4AF37;">New Booking Request</h2>
            <div style="background:#161616;border:1px solid #27272a;border-radius:8px;padding:20px;margin:16px 0;">
              <p><strong style="color:#71717A;">Customer:</strong> <span style="color:#fff;">${customerName}</span></p>
              <p><strong style="color:#71717A;">Email:</strong> <span style="color:#fff;">${customerEmail}</span></p>
              <p><strong style="color:#71717A;">Vehicle:</strong> <span style="color:#fff;">${carName}</span></p>
              <p><strong style="color:#71717A;">Dates:</strong> <span style="color:#fff;">${startDate} → ${endDate}</span></p>
              <p><strong style="color:#71717A;">Total:</strong> <span style="color:#D4AF37;font-weight:bold;">£${total}</span></p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/bookings" 
               style="background:#D4AF37;color:#000;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:16px;">
              View in Dashboard
            </a>
          </div>
        `
      });
    }

    if (type === "booking_approved") {
      emails.push({
        from: FROM_EMAIL,
        to: customerEmail,
        subject: "Booking Approved — DxK Rentals",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;">
            <h1 style="color:#D4AF37;">DxK Rentals</h1>
            <h2 style="color:#22C55E;">✓ Booking Approved!</h2>
            <p style="color:#a1a1aa;">Hi ${customerName}, great news — your booking has been approved!</p>
            <div style="background:#161616;border:1px solid #27272a;border-radius:8px;padding:20px;margin:24px 0;">
              <p style="color:#fff;font-weight:bold;font-size:16px;">${carName}</p>
              <p style="color:#a1a1aa;">${startDate} → ${endDate}</p>
              <p style="color:#D4AF37;font-weight:bold;font-size:18px;margin-top:8px;">£${total}</p>
            </div>
            <p style="color:#a1a1aa;">Please ensure your £100 security deposit is paid before your rental begins. We will be in touch with final details.</p>
            <p style="color:#71717A;font-size:12px;margin-top:32px;">DxK Rentals — Premium Luxury Car Rentals</p>
          </div>
        `
      });
    }

    if (type === "booking_rejected") {
      emails.push({
        from: FROM_EMAIL,
        to: customerEmail,
        subject: "Booking Update — DxK Rentals",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;">
            <h1 style="color:#D4AF37;">DxK Rentals</h1>
            <h2 style="color:#fff;">Booking Update</h2>
            <p style="color:#a1a1aa;">Hi ${customerName},</p>
            <p style="color:#a1a1aa;">Unfortunately we're unable to fulfil your booking request for the ${carName} on those dates. This may be due to availability or eligibility requirements.</p>
            <p style="color:#a1a1aa;">Please browse our fleet for other available vehicles or contact us to discuss alternatives.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/cars"
               style="background:#D4AF37;color:#000;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:16px;">
              Browse Fleet
            </a>
            <p style="color:#71717A;font-size:12px;margin-top:32px;">DxK Rentals — Premium Luxury Car Rentals</p>
          </div>
        `
      });
    }

    // Send all emails via Resend
    for (const email of emails) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(email),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Email error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
