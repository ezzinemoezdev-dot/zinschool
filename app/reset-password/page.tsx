'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setMsg(''); setError('')
    
    const { error } = await supabase.auth.updateUser({ password })
    
    setLoading(false)
    if (error) { setError(error.message); return }
    setMsg('تم تغيير كلمة السر! جاري تحويلك...')
    setTimeout(() => router.push('/login'), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-5">
        <h1 className="text-2xl font-bold text-center text-indigo-800">كلمة سر جديدة</h1>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {msg && <p className="text-green-600 text-sm text-center">{msg}</p>}
        
        <input 
          type="password" placeholder="كلمة السر الجديدة (6+)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
          className="w-full border rounded-lg p-3" dir="ltr" 
        />
        <button disabled={loading} className="w-full bg-indigo-600 text-white rounded-lg p-3 font-semibold disabled:opacity-50">
          {loading ? '...' : 'تغيير كلمة السر'}
        </button>
      </form>
    </div>
  )
}