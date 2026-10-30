'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { translations, Lang } from '@/lib/i18n'

export default function StudentsListPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<Lang>('ar')
  const t = translations[lang]

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Lang
    if (savedLang && (savedLang === 'ar' || savedLang === 'fr')) setLang(savedLang)
    loadStudents()
  }, [id])

  async function loadStudents() {
    setLoading(true)
    const { data } = await supabase
      .from('enrollments')
      .select('id, student_id, profiles(full_name, email)')
      .eq('class_id', id)
      .eq('status', 'active')
      
    setStudents(data ?? [])
    setLoading(false)
  }

  async function removeStudent(enrollmentId: string) {
    if (!confirm(t.removeFromClass + ' ?')) return
    const { error } = await supabase.from('enrollments').update({ status: 'removed' }).eq('id', enrollmentId)
    if (error) alert(error.message)
    else loadStudents()
  }

  if (loading) return <div className="text-center mt-10">...</div>

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <button onClick={() => router.push(`/teacher/classes/${id}`)} className="text-sm text-indigo-600 hover:underline">
        {t.backToClass}
      </button>
      
      <div className="bg-white rounded-xl shadow p-6 border-r-4 border-indigo-600">
        <h1 className="text-2xl font-bold text-indigo-700">{t.studentsTitle}</h1>
        <p className="text-gray-500">{t.studentsSubtitle}</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        {students.length === 0 ? (
          <p className="text-gray-500 text-center">{t.noStudents}</p>
        ) : (
          <ul className="divide-y">
            {students.map((s) => (
              <li key={s.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="w-full">
                  <div className="font-bold text-gray-800">{s.profiles?.full_name}</div>
                  <div className="text-sm text-gray-500 truncate" dir="ltr">{s.profiles?.email}</div>
                </div>
                <button 
                  onClick={() => removeStudent(s.id)} 
                  className="w-full sm:w-auto text-xs px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-semibold whitespace-nowrap"
                >
                  {t.removeFromClass}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}