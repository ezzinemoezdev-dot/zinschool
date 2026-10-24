'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { translations, Lang } from '@/lib/i18n'

export default function JoinPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<Lang>('ar')
  const t = translations[lang]

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Lang
    if (savedLang && (savedLang === 'ar' || savedLang === 'fr')) setLang(savedLang)
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErr('')
    const supabase = createClient()
    const { error } = await supabase.rpc('join_class', { code: code.trim().toUpperCase() })
    
    setLoading(false)
    if (error) { setErr(t.joinClassError); return }
    router.push('/student')
    router.refresh()
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 space-y-5 mt-10 border border-gray-100" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-bold text-center text-indigo-800">{t.joinClassTitle}</h1>
      <p className="text-sm text-gray-500 text-center">{t.joinClassSubtitle}</p>
      
      <form onSubmit={submit} className="space-y-4">
        <input 
          required 
          placeholder={t.joinClassPlaceholder} 
          value={code} 
          onChange={e => setCode(e.target.value)} 
          className="w-full border border-gray-300 rounded-lg p-3 font-mono text-center uppercase text-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
        />
        {err && <p className="text-red-600 text-sm text-center font-medium">{err}</p>}
        <button disabled={loading} className="w-full bg-indigo-600 text-white rounded-lg p-3 font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
          {loading ? '...' : t.joinClassBtn}
        </button>
      </form>
    </div>
  )
}