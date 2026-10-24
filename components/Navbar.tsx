'use client'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from './NotificationBell'
import { translations, Lang } from '@/lib/i18n'
import { useState, useEffect } from 'react'

export default function Navbar({ profile }: { profile: any }) {
  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin'
  const [lang, setLang] = useState<Lang>('ar')
  const t = translations[lang]

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Lang
    if (savedLang && (savedLang === 'ar' || savedLang === 'fr')) {
      setLang(savedLang)
    }
  }, [])

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'fr' : 'ar'
    setLang(newLang)
    localStorage.setItem('lang', newLang)
    window.location.reload()
  }

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
    window.location.reload() 
  }

  return (
    <nav className="bg-white shadow px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* القسم الأول: اللوغو والروابط */}
      <div className="flex items-center justify-between w-full md:w-auto gap-4">
        
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-indigo-700 text-lg">
          <img src="/logo.png" alt="ZinSchool Logo" className="h-8 w-auto object-contain md:h-10" />
          <span className="hidden sm:block">{t.appName}</span>
        </Link>
        
        {isTeacher ? (
          <div className="flex gap-4 text-sm md:text-base">
            <Link href="/teacher" className="text-gray-700 hover:text-indigo-600 font-medium">{t.teacherDashboard}</Link>
            <Link href="/teacher/classes" className="text-gray-700 hover:text-indigo-600 font-medium">{t.myClasses}</Link>
          </div>
        ) : (
          <div className="flex gap-4 text-sm md:text-base">
            <Link href="/student" className="text-gray-700 hover:text-indigo-600 font-medium">{t.studentDashboard}</Link>
            <Link href="/student/join" className="text-gray-700 hover:text-indigo-600 font-medium">{t.joinClass}</Link>
          </div>
        )}
      </div>

      {/* القسم الثاني: الإشعارات، الاسم، والخروج */}
      <div className="flex items-center justify-between w-full md:w-auto gap-3 border-t pt-2 md:border-t-0 md:pt-0 border-gray-100">
        
        <div className="flex items-center gap-3">
          <button onClick={toggleLang} className="text-sm font-bold text-indigo-600 border border-indigo-200 px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 transition">
            {lang === 'ar' ? 'FR' : 'AR'}
          </button>
          
          <NotificationBell userId={profile?.id} />
          
          <div className="flex flex-col items-start md:items-end">
            <span className="text-sm text-gray-800 font-bold">{profile?.full_name}</span>
            <span className="text-[10px] text-gray-500">{isTeacher ? t.teacher : t.student}</span>
            <span className="text-[9px] text-indigo-400 font-semibold">Developed by Ezzine Moez</span>
          </div>
        </div>

        <button onClick={logout} className="text-xs md:text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-semibold">
          {t.logout}
        </button>
      </div>
    </nav>
  )
}