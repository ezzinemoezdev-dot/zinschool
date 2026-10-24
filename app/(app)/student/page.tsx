'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { translations, Lang } from '@/lib/i18n'

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [lang, setLang] = useState<Lang>('ar')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const t = translations[lang]

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Lang
    if (savedLang && (savedLang === 'ar' || savedLang === 'fr')) setLang(savedLang)
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('enrollments').select('classes(id, name, subject, level)')
      .eq('student_id', user.id).eq('status', 'active')
    setEnrollments(data ?? [])
    setLoading(false)
  }

  if (loading) return <div className="text-center mt-10">...</div>

  return (
    <div className="space-y-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h1 className="text-3xl font-bold text-gray-800">{t.studentDashboardTitle}</h1>
      
      <Link href="/student/join" className="block bg-indigo-600 text-white p-6 rounded-xl text-center hover:bg-indigo-700 font-semibold shadow transition">
        {t.joinNewClassBtn}
      </Link>
      
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">{t.myClassesSection}</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {enrollments?.map((e: any) => (
            <Link key={e.classes.id} href={`/student/classes/${e.classes.id}`} className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition border-r-4 border-indigo-500">
              <h3 className="font-bold text-xl text-indigo-800">{e.classes.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{e.classes.subject} • {e.classes.level}</p>
            </Link>
          ))}
          {!enrollments?.length && <p className="text-gray-500">{t.noEnrolledClasses}</p>}
        </div>
      </section>
    </div>
  )
}