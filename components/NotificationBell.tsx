'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  async function load() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
    setItems(data ?? [])
  }

  useEffect(() => {
    if (!userId) return
    load()

    // نستنوا في إشعارات جديدة لايف (Realtime)
    const ch = supabase.channel('notif-' + userId)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        payload => setItems(prev => [payload.new, ...prev])
      ).subscribe()
      
    return () => { supabase.removeChannel(ch) }
  }, [userId])

  // نسكروا القائمة كي ناضغطو في بلاصة أخرى
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const unread = items.filter(n => !n.read).length

  async function markAllRead() {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
    setItems(prev => prev.map(n => ({ ...n, read: true })))
  }

  async function clickItem(n: any) {
    if (!n.read) {
      await supabase.from('notifications').update({ read: true }).eq('id', n.id)
      setItems(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
    }
    if (n.link) window.location.href = n.link
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} className="relative p-2 rounded hover:bg-gray-100 transition">
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>
      
      {open && (
        <div className="absolute left-0 mt-2 w-80 bg-white shadow-xl rounded-xl border z-50 max-h-96 overflow-auto" dir="rtl">
          <div className="flex justify-between items-center p-3 border-b bg-gray-50 rounded-t-xl">
            <span className="font-semibold text-sm">الإشعارات</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-indigo-600 hover:underline">تعليم الكل كمقروء</button>
            )}
          </div>
          {items.length === 0 && <div className="p-4 text-sm text-gray-500 text-center"> إشعارات</div>}
          {items.map(n => (
            <button key={n.id} onClick={() => clickItem(n)}
              className={`w-full text-right p-3 border-b hover:bg-gray-50 transition ${n.read ? 'opacity-70' : 'bg-indigo-50/40'}`}>
              <div className="text-sm font-medium">{n.title}</div>
              {n.body && <div className="text-xs text-gray-600 mt-1">{n.body}</div>}
              <div className="text-[10px] text-gray-400 mt-1">
                {new Date(n.created_at).toLocaleString('fr-TN')}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}