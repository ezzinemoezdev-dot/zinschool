import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import OpenFileButton from '@/components/OpenFileButton'
import { connection } from 'next/server'

export default async function StudentClassPage({ params }: { params: Promise<{ id: string }> }) {
  await connection()
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: enrollment } = await supabase.from('enrollments').select('id').eq('class_id', id).eq('student_id', user!.id).eq('status', 'active').single()
  if (!enrollment) return notFound()

  const { data: cls } = await supabase.from('classes').select('*').eq('id', id).single()
  const { data: materials } = await supabase.from('materials').select('*').eq('class_id', id).lte('visible_from', new Date().toISOString()).order('created_at', { ascending: false })
  const { data: sessions } = await supabase.from('live_sessions').select('*').eq('class_id', id).order('starts_at', { ascending: true })
  const { data: assignments } = await supabase.from('assignments').select('*, corrections(*)').eq('class_id', id).order('created_at', { ascending: false })
  
  // جلب التسجيلات للتلميذ
  const { data: recordings } = await supabase.from('recordings').select('*').eq('class_id', id).order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <Link href="/student" className="text-sm text-indigo-600 hover:underline inline-block">
        ← رجوع للوحة التلميذ
      </Link>
      
      <div className="bg-white rounded-xl shadow p-6 border-r-4 border-indigo-600">
        <h1 className="text-2xl font-bold text-indigo-700">{cls?.name}</h1>
        <p className="text-gray-500">{cls?.subject} • {cls?.level}</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold border-b pb-2 mb-4">📄 الدروس والملفات</h2>
        <ul className="divide-y">
          {materials?.map(m => (
            <li key={m.id} className="py-3 flex justify-between items-center">
              <div><div className="font-medium">{m.title}</div></div>
              <OpenFileButton bucket="materials" path={m.file_path} label="فتح PDF" />
            </li>
          ))}
          {!materials?.length && <li className="text-gray-500 py-2">لا توجد دروس بعد.</li>}
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold border-b pb-2 mb-4">📝 الأعمال والإصلاحات</h2>
        <ul className="space-y-4">
          {assignments?.map(a => (
            <li key={a.id} className="p-4 border rounded-lg bg-orange-50/50">
              <div className="flex justify-between items-center mb-3">
                <div className="font-bold text-gray-800">{a.title}</div>
                {a.file_path && <OpenFileButton bucket="assignments" path={a.file_path} label="فتح الموضوع" />}
              </div>
              {a.corrections && a.corrections.length > 0 ? (
                <div className="pl-4 border-r-2 border-green-500 pr-3 mt-2">
                  <p className="text-sm font-semibold text-green-700 mb-2">✅ الإصلاح متاح:</p>
                  {a.corrections.map((c: any) => <OpenFileButton key={c.id} bucket="corrections" path={c.file_path} label="تحميل الإصلاح" />)}
                </div>
              ) : <div className="text-xs text-gray-500 mt-2">الإصلاح مازال ما نزلش.</div>}
            </li>
          ))}
        </ul>
      </div>

      {/* قسم التسجيلات للتلميذ */}
      <div className="bg-white rounded-xl shadow p-6 border-t-4 border-purple-500">
        <h2 className="text-xl font-bold border-b pb-2 mb-4">🎬 التسجيلات</h2>
        <ul className="divide-y">
          {recordings?.map(r => (
            <li key={r.id} className="py-3 flex justify-between items-center">
              <div className="font-medium text-gray-800">{r.title}</div>
              <a href={r.recording_url} target="_blank" className="text-xs px-3 py-1 bg-purple-100 text-purple-700 font-semibold rounded">مشاهدة</a>
            </li>
          ))}
          {!recordings?.length && <li className="text-gray-500 py-2">ما فماش تسجيلات.</li>}
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold border-b pb-2 mb-4">🎥 الحصص المباشرة</h2>
        <ul className="divide-y">
          {sessions?.map(s => (
            <li key={s.id} className="py-3 flex justify-between items-center bg-gray-50/50 p-2 rounded mb-2">
              <div>
                <div className="font-medium text-indigo-700">{s.title}</div>
                <div className="text-xs text-gray-500 font-mono" dir="ltr">{new Date(s.starts_at).toLocaleString('fr-TN')}</div>
              </div>
              <a href={s.meeting_url} target="_blank" className="text-xs px-3 py-1 bg-indigo-600 text-white rounded">دخول</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}