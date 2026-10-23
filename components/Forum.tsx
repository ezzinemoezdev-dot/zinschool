'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Forum({ classId, userId }: { classId: string, userId: string }) {
  const [posts, setPosts] = useState<any[]>([])
  const [newPost, setNewPost] = useState('')
  const supabase = createClient()

  async function loadPosts() {
    const { data } = await supabase
      .from('forum_posts')
      .select('*, profiles(full_name, role)')
      .eq('class_id', classId)
      .order('created_at', { ascending: true })
    setPosts(data ?? [])
  }

  useEffect(() => {
    loadPosts()
    // الاستماع للرسائل الجديدة لايف
    const channel = supabase.channel('forum-' + classId)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'forum_posts', filter: `class_id=eq.${classId}` }, 
        () => loadPosts()
      ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [classId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newPost.trim()) return

    const { error } = await supabase.from('forum_posts').insert({
      class_id: classId,
      user_id: userId,
      content: newPost
    })

    if (error) alert(error.message)
    else setNewPost('')
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8 border-t-4 border-teal-500">
      <h2 className="text-xl font-bold border-b pb-2 mb-4">💬 منتدى النقاش</h2>
      
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pl-2">
        {posts.map(p => (
          <div key={p.id} className={`p-3 rounded-lg ${p.profiles?.role === 'teacher' ? 'bg-indigo-50 border-r-4 border-indigo-500' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm text-gray-800">
                {p.profiles?.full_name} {p.profiles?.role === 'teacher' && '(أستاذ)'}
              </span>
              <span className="text-[10px] text-gray-400">
                {new Date(p.created_at).toLocaleString('fr-TN')}
              </span>
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{p.content}</p>
          </div>
        ))}
        {!posts.length && <p className="text-gray-500 text-center text-sm">ما فماش رسائل بعد. كن أول من يكتب!</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          value={newPost} 
          onChange={e => setNewPost(e.target.value)} 
          placeholder="اكتب سؤالك ولا تعليقك هنا..." 
          className="flex-1 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
        />
        <button type="submit" className="bg-teal-600 text-white px-6 rounded-lg font-semibold hover:bg-teal-700 transition">
          إرسال
        </button>
      </form>
    </div>
  )
}