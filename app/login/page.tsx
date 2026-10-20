'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) { 
      setError(error.message)
      setLoading(false)
      return 
    }

    // نستنوا شوية (نص ثانية) باش نضمنوا أن Supabase حفظت الكوكي في المتصفح
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // نعملوا ريفريش قوي ونروحوا للوحة (هذا يحل مشكلة الطرد)
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 relative">
      
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-5 border border-gray-100">
        
        {/* اللوغو */}
        <div className="flex flex-col items-center mb-2">
          <img src="/logo.png" alt="ZinSchool Logo" className="h-24 w-auto object-contain mb-2" />
          <h1 className="text-2xl font-bold text-indigo-800">ZinSchool</h1>
          <p className="text-sm text-gray-500 mt-1">تسجيل الدخول</p>
        </div>

        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
        
        <div className="space-y-3">
          <input 
            type="email" 
            placeholder="البريد الإلكتروني (Email)" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            dir="ltr" 
          />
          <input 
            type="password" 
            placeholder="كلمة السر (Mot de passe)" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            dir="ltr" 
          />
        </div>

        <button disabled={loading} className="w-full bg-indigo-600 text-white rounded-lg p-3 font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
          {loading ? '...' : 'دخول (Connexion)'}
        </button>

        <p className="text-sm text-center text-gray-600">
          ما عندكش حساب؟ <Link href="/register" className="text-indigo-600 font-semibold hover:underline">سجّل</Link>
        </p>
      </form>

      {/* الاسم في الأسفل */}
      <p className="absolute bottom-6 text-xs text-gray-400 font-medium">
        Developed by Ezzine Moez
      </p>
    </div>
  )
}