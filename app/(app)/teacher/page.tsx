import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: classes } = await supabase.from('classes').select('*').eq('teacher_id', user!.id)

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-800">لوحة الأستاذ</h1>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl shadow border-r-4 border-indigo-600">
          <div className="text-4xl font-bold text-indigo-600">{classes?.length ?? 0}</div>
          <div className="text-gray-600 font-medium mt-1">أقسامي</div>
        </div>
        
        <Link href="/teacher/classes" className="block bg-indigo-600 text-white p-6 rounded-xl text-center hover:bg-indigo-700 shadow transition">
          <div className="text-4xl mb-2">📚</div>
          <div className="font-semibold text-lg">إدارة الأقسام</div>
        </Link>
      </div>
    </div>
  )
}