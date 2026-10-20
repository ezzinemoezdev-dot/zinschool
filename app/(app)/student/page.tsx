import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: enrollments } = await supabase
    .from('enrollments').select('classes(id, name, subject, level)').eq('student_id', user!.id).eq('status', 'active')

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-800">لوحة التلميذ</h1>
      
      <Link href="/student/join" className="block bg-indigo-600 text-white p-6 rounded-xl text-center hover:bg-indigo-700 font-semibold shadow transition">
        + انضم لقسم جديد بكود الدعوة
      </Link>
      
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">أقسامي</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {enrollments?.map((e: any) => (
            <Link key={e.classes.id} href={`/student/classes/${e.classes.id}`} className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition border-r-4 border-indigo-500">
              <h3 className="font-bold text-xl text-indigo-800">{e.classes.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{e.classes.subject} • {e.classes.level}</p>
            </Link>
          ))}
          {!enrollments?.length && <p className="text-gray-500">ما انت مسجل في أي قسم توّة.</p>}
        </div>
      </section>
    </div>
  )
}