'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { translations, Lang } from '@/lib/i18n'

export default function Forum({ classId, userId }: { classId: string, userId: string }) {
  const [posts, setPosts] = useState<any[]>([])
  const [newPost, setNewPost] = useState('')
  const [userRole, setUserRole] = useState<string | null>(null)
  const [lang, setLang] = useState<Lang>('ar')
  const supabase = createClient()
  const t = translations[lang]

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Lang
    if (savedLang && (savedLang === 'ar' || savedLang === 'fr')) setLang(savedLang)
    
    fetchUserRole()
    loadPosts()

    const channel = supabase.channel('forum-' + classId)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'forum_posts', filter: `class_id=eq.${classId}` }, 
        () => loadPosts()
      ).subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [classId])

  async function loadPosts() {
    const { data } = await supabase
      .from('forum_posts')
      .select('*, profiles(full_name, role)')
      .eq('class_id', classId)
      .order('created_at', { ascending: true })
    setPosts(data ?? [])
  }

  async function fetchUserRole() {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
    if (data) setUserRole(data.role)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newPost.trim()) return
    const { error } = await supabase.from('forum_posts').insert({ class_id: classId, user_id: userId, content: newPost })
    if (error) alert(error.message)
    else setNewPost('')
  }

  async function handleDelete(postId: string) {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return
    const { error } = await supabase.from('forum_posts').delete().eq('id', postId)
    if (error) alert(error.message)
    else loadPosts()
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8 border-t-4 border-teal-500" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="text-xl font-bold border-b pb-2 mb-4">{t.forumTitle}</h2>
      
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pl-2">
        {posts.map(p => (
          <div key={p.id} className={`p-3 rounded-lg relative ${p.profiles?.role === 'teacher' ? 'bg-indigo-50 border-r-4 border-indigo-500' : 'bg-gray-50'}`}>
            {userRole === 'teacher' && (
              <button onClick={() => handleDelete(p.id)} className="absolute top-2 left-2 text-red-500 hover:text-red-700 text-xs" title="حذف الرسالة">🗑️</button>
            )}
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm text-gray-800">
                {p.profiles?.full_name} {p.profiles?.role === 'teacher' && '(أستاذ)'}
              </span>
              <span className="text-[10px] text-gray-400">{new Date(p.created_at).toLocaleString('fr-TN')}</span>
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{p.content}</p>
          </div>
        ))}
        {!posts.length && <p className="text-gray-500 text-center text-sm">{t.forumEmpty}</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          value={newPost} 
          onChange={e => setNewPost(e.target.value)} 
          placeholder={t.forumPlaceholder} 
          className="flex-1 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
        />
        <button type="submit" className="bg-teal-600 text-white px-6 rounded-lg font-semibold hover:bg-teal-700 transition">
          {t.sendBtn}
        </button>
      </form>
    </div>
  )
}