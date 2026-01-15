import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, service, message } = body;

    // 💡 Logic: Identify if the contact info provided is a Phone Number or Email
    const isPhone = /^\+?[\d\s\-]{10,}$/.test(email); 
    const contactLabel = isPhone ? "Phone Number" : "Email Address";

    const { data, error } = await resend.emails.send({
      from: 'Risa Interior <onboarding@resend.dev>',
      to: ['risainteriorsandcontractors@gmail.com'],
      subject: `New Lead: ${name} - ${service}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #B89B5E; text-transform: uppercase; letter-spacing: 0.2em;">New Enquiry Received</h2>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p><strong>Client Name:</strong> ${name}</p>
          <p><strong>${contactLabel}:</strong> ${email}</p>
          <p><strong>Service Interest:</strong> ${service}</p>
          <div style="background: #f9f9f9; padding: 15px; margin-top: 20px; border-left: 4px solid #B89B5E;">
            <p><strong>Message Detail:</strong></p>
            <p style="font-style: italic;">${message}</p>
          </div>
          <p style="font-size: 10px; color: #aaa; margin-top: 30px; text-transform: uppercase;">Sent via Risa Interior Engine</p>
        </div>
      `,
    });

    if (error) {
      console.error("RESEND ERROR:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}