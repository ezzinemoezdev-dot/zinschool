import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// نستعملوا service_role باش ننجموا نقرأوا الإيميل من جدول profiles
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ هذا المفتاح السري (ممنوع يطلع للمتصفح)
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Supabase Webhook كيبعث البيانات في record
    const notification = body.record; 
    if (!notification || !notification.user_id) {
      return NextResponse.json({ error: 'No user_id' }, { status: 400 });
    }

    // نجيبوا إيميل المستخدم من جدول profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', notification.user_id)
      .single();

    if (!profile || !profile.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 404 });
    }

    // نبعثوا الإيميل
    const { data, error } = await resend.emails.send({
      from: 'ZinSchool <onboarding@resend.dev>', 
      to: [profile.email],
      subject: notification.title,
      html: `<p>${notification.body || 'لديك إشعار جديد في منصة ZinSchool'}</p>
             <a href="https://zinschool.netlify.app${notification.link || ''}">اضغط هنا للمشاهدة</a>`,
    });

    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}