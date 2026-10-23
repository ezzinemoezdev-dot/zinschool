import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received body:", body); // باش نشوفوا شنوّة قاعد يجي

    // نحاولوا نلقاو الـ user_id في أي بلاصة (باش نتفاداو الغلطة)
    const notification = body.record || body;
    const userId = notification.user_id || notification.record?.user_id;

    if (!userId) {
      return NextResponse.json({ error: 'No user_id', body }, { status: 400 });
    }

    // نجيبوا الإيميل من profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (profileError || !profile || !profile.email) {
      return NextResponse.json({ error: 'User email not found', profileError }, { status: 404 });
    }

    // نبعثوا الإيميل
    const { data, error } = await resend.emails.send({
      from: 'ZinSchool <onboarding@resend.dev>', 
      to: [profile.email],
      subject: notification.title || 'إشعار جديد',
      html: `<p>${notification.body || 'لديك إشعار جديد في منصة ZinSchool'}</p>
             <a href="https://zinschool.netlify.app${notification.link || ''}">اضغط هنا للمشاهدة</a>`,
    });

    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email', details: error }, { status: 500 });
  }
}