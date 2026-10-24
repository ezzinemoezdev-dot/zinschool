'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { translations, Lang } from '@/lib/i18n'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<Lang>('ar')
  const t = translations[lang]

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Lang
    if (savedLang && (savedLang === 'ar' || savedLang === 'fr')) setLang(savedLang)
  }, [])

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

    await new Promise(resolve => setTimeout(resolve, 500))
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-5 border border-gray-100">
        
        <div className="flex flex-col items-center mb-2">
          <img src="/logo.png" alt="ZinSchool Logo" className="h-24 w-auto object-contain mb-2" />
          <h1 className="text-2xl font-bold text-indigo-800">ZinSchool</h1>
          <p className="text-sm text-gray-500 mt-1">{t.loginTitle}</p>
        </div>

        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
        
        <div className="space-y-3">
          <input 
            type="email" 
            placeholder={t.emailPlaceholder} 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            dir="ltr" 
          />
          <input 
            type="password" 
            placeholder={t.passwordPlaceholder} 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            dir="ltr" 
          />
        </div>

        <button disabled={loading} className="w-full bg-indigo-600 text-white rounded-lg p-3 font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
          {loading ? '...' : t.loginBtn}
        </button>

        <div className="text-sm text-center text-gray-600 space-y-2">
          <p>
            <Link href="/forgot-password" className="text-indigo-600 font-semibold hover:underline">{t.forgotPasswordLink}</Link>
          </p>
          <p>
            {t.noAccountLink} <Link href="/register" className="text-indigo-600 font-semibold hover:underline">{t.registerLink}</Link>
          </p>
        </div>

      </form>

      <p className="absolute bottom-6 text-xs text-gray-400 font-medium">
        Developed by Ezzine Moez
      </p>
    </div>
  )
}