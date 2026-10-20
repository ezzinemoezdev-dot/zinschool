'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    })
    if (error) { 
      setError(error.message)
      setLoading(false)
      return 
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 relative">
      
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-5 border border-gray-100">
        
        {/* اللوغو */}
        <div className="flex flex-col items-center mb-2">
          <img src="/logo.png" alt="ZinSchool Logo" className="h-24 w-auto object-contain mb-2" />
          <h1 className="text-2xl font-bold text-indigo-800">ZinSchool</h1>
          <p className="text-sm text-gray-500 mt-1">إنشاء حساب جديد</p>
        </div>

        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
        
        <div className="space-y-3">
          <input 
            placeholder="الاسم الكامل (Nom complet)" 
            value={form.full_name} 
            onChange={e => setForm({ ...form, full_name: e.target.value })} 
            required 
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
          />
          <input 
            type="email" 
            placeholder="البريد الإلكتروني (Email)" 
            value={form.email} 
            onChange={e => setForm({ ...form, email: e.target.value })} 
            required 
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            dir="ltr" 
          />
          <input 
            type="password" 
            placeholder="كلمة السر (Mot de passe)" 
            minLength={6} 
            value={form.password} 
            onChange={e => setForm({ ...form, password: e.target.value })} 
            required 
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            dir="ltr" 
          />
        </div>

        <button disabled={loading} className="w-full bg-indigo-600 text-white rounded-lg p-3 font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
          {loading ? '...' : 'تسجيل (S\'inscrire)'}
        </button>

        <p className="text-sm text-center text-gray-600">
          عندك حساب؟ <Link href="/login" className="text-indigo-600 font-semibold hover:underline">دخول</Link>
        </p>
      </form>

      {/* الاسم في الأسفل */}
      <p className="absolute bottom-6 text-xs text-gray-400 font-medium">
        Developed by Ezzine Moez
      </p>
    </div>
  )
}