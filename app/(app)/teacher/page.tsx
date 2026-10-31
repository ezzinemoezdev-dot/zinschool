'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { translations, Lang } from '@/lib/i18n'

export default function TeacherDashboard() {
  const [classesCount, setClassesCount] = useState(0)
  const [lang, setLang] = useState<Lang>('ar')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const t = translations[lang]

  useEffect(() => {
    // نجيبوا اللغة من localStorage
    const savedLang = localStorage.getItem('lang') as Lang
    if (savedLang && (savedLang === 'ar' || savedLang === 'fr')) setLang(savedLang)

    // نجيبوا عدد الأقسام
    async function fetchCount() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { count } = await supabase.from('classes').select('*', { count: 'exact', head: true }).eq('teacher_id', user.id)
      setClassesCount(count ?? 0)
      setLoading(false)
    }
    fetchCount()
  }, [])

  if (loading) return <div className="text-center mt-10">جاري التحميل...</div>

  return (
    <div className="space-y-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h1 className="text-3xl font-bold text-gray-800">{t.teacherDashboard}</h1>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-indigo-600">
          <div className="text-4xl font-bold text-indigo-600">{classesCount}</div>
          {/* @ts-ignore */}
          <div className="text-gray-600 font-medium mt-1">{t.myClassesCount}</div>
          
        </div>
        
        <Link href="/teacher/classes" className="block bg-indigo-600 text-white p-6 rounded-xl text-center hover:bg-indigo-700 shadow transition">
          <div className="text-4xl mb-2">📚</div>
          {/* @ts-ignore */}
          <div className="font-semibold text-lg">{t.manageClasses}</div>
        </Link>
      </div>
    </div>
  )
}