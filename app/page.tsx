import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 relative">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
        
        {/* اللوغو الجديد */}
        <img 
          src="/logo.png" 
          alt="ZinSchool Logo" 
          className="h-32 w-auto object-contain mx-auto mb-4" 
        />
        
        {/* الاسم */}
        <h1 className="text-4xl font-bold text-indigo-800 mb-2">ZinSchool</h1>
        <p className="text-gray-500 mb-8 font-medium">منصة الدروس الخصوصية</p>
        
        {/* الأزرار */}
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow">
            دخول
          </Link>
          <Link href="/register" className="px-8 py-3 border border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition">
            تسجيل جديد
          </Link>
        </div>
      </div>

      {/* اسم المطور */}
      <p className="absolute bottom-6 text-xs text-gray-400 font-medium">
        Developed by Ezzine Moez
      </p>
    </main>
  )
}