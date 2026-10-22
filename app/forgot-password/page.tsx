'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setMsg(''); setError('')
    const supabase = createClient()
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://zinschool.netlify.app/reset-password',
    })
    
    setLoading(false)
    if (error) { setError(error.message); return }
    setMsg('تم إرسال الرابط! يرجى التحقق من بريدك الإلكتروني.')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-5">
        <h1 className="text-2xl font-bold text-center text-indigo-800">نسيت كلمة السر</h1>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {msg && <p className="text-green-600 text-sm text-center">{msg}</p>}
        
        <input 
          type="email" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} required 
          className="w-full border rounded-lg p-3" dir="ltr" 
        />
        <button disabled={loading} className="w-full bg-indigo-600 text-white rounded-lg p-3 font-semibold disabled:opacity-50">
          {loading ? '...' : 'إرسال الرابط'}
        </button>
        <p className="text-sm text-center">
          <Link href="/login" className="text-indigo-600 hover:underline">رجوع للدخول</Link>
        </p>
      </form>
    </div>
  )
}