import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-xl text-center bg-white rounded-2xl shadow-xl p-10">
        <h1 className="text-4xl font-bold text-indigo-700 mb-4">🦆 منصة الدروس الخصوصية</h1>
        <p className="text-gray-600 mb-8">مساحة للأستاذ، مساحة للتلميذ، وكل شيء منظّم.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">دخول</Link>
          <Link href="/register" className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50">تسجيل جديد</Link>
        </div>
      </div>
    </main>
  )
}