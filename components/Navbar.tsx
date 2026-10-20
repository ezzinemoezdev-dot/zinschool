'use client'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from './NotificationBell'

export default function Navbar({ profile }: { profile: any }) {
  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin'

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
    window.location.reload() 
  }

  return (
    <nav className="bg-white shadow px-6 py-3 flex items-center justify-between" dir="rtl">
      <div className="flex gap-6 items-center">
        {/* اللوغو */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-indigo-700 text-lg">
          <img src="/logo.png" alt="ZinSchool Logo" className="h-10 w-auto object-contain" />
          <span>ZinSchool</span>
        </Link>
        
        {/* الروابط */}
        {isTeacher ? (
          <>
            <Link href="/teacher" className="text-gray-700 hover:text-indigo-600 font-medium">لوحة الأستاذ</Link>
            <Link href="/teacher/classes" className="text-gray-700 hover:text-indigo-600 font-medium">أقسامي</Link>
          </>
        ) : (
          <>
            <Link href="/student" className="text-gray-700 hover:text-indigo-600 font-medium">لوحة التلميذ</Link>
            <Link href="/student/join" className="text-gray-700 hover:text-indigo-600 font-medium">انضم لقسم</Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell userId={profile?.id} />
        
        <div className="flex flex-col items-end border-l pl-4 border-gray-200">
          <span className="text-sm text-gray-800 font-bold">{profile?.full_name}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">
            {isTeacher ? 'أستاذ' : 'تلميذ'}
          </span>
          <span className="text-[10px] text-indigo-400 font-semibold">Developed by Ezzine Moez</span>
        </div>

        <button 
          onClick={logout} 
          className="text-sm px-4 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-semibold"
        >
          خروج
        </button>
      </div>
    </nav>
  )
}