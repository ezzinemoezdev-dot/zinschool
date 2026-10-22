import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    const { data, error } = await resend.emails.send({
      // ⚠️ Resend في الخطة المجانية كتسمحلك كان تبعث من onboarding@resend.dev
      from: 'ZinSchool <onboarding@resend.dev>', 
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}