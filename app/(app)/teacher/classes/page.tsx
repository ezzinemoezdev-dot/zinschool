'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ClassesPage() {
  const supabase = createClient()
  const [classes, setClasses] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', subject: '', level: '' })
  const [creating, setCreating] = useState(false)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('classes').select('*').eq('teacher_id', user.id).order('created_at', { ascending: false })
    setClasses(data ?? [])
  }

  useEffect(() => { load() }, [])

  async function createClass(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    const { error } = await supabase.from('classes').insert({
      teacher_id: user.id, name: form.name, subject: form.subject, level: form.level, invite_code: code,
    })
    
    if (error) alert(error.message)
    else { setForm({ name: '', subject: '', level: '' }); load() }
    setCreating(false)
  }

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-800">أقسامي</h1>
      
      <form onSubmit={createClass} className="bg-white p-5 rounded-xl shadow grid md:grid-cols-4 gap-4 border border-gray-100">
        <input required placeholder="اسم القسم (مثال: رياضيات باك)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
        <input placeholder="المادة" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
        <input placeholder="المستوى" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
        <button disabled={creating} className="bg-indigo-600 text-white rounded-lg p-2.5 font-semibold disabled:opacity-50 hover:bg-indigo-700 transition">
          {creating ? '...' : '+ إنشاء قسم'}
        </button>
      </form>

      <div className="grid md:grid-cols-2 gap-5">
        {classes.map(c => (
          <Link key={c.id} href={`/teacher/classes/${c.id}`} className="bg-white p-5 rounded-xl shadow flex flex-col justify-between hover:shadow-lg transition border-r-4 border-indigo-500">
            <div>
              <h3 className="font-bold text-xl text-indigo-800">{c.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{c.subject} • {c.level}</p>
            </div>
            <div className="mt-5 flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-xs font-semibold text-gray-500">كود الدعوة:</span>
              <span className="text-sm bg-indigo-100 text-indigo-800 px-4 py-1.5 rounded-md font-mono font-bold tracking-widest">{c.invite_code}</span>
            </div>
          </Link>
        ))}
        {!classes.length && <p className="text-gray-500 col-span-2">ما عندكش أقسام بعد. أضف قسم من الفورم فوق.</p>}
      </div>
    </div>
  )
}