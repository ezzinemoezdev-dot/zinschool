'use client'
import { createClient } from '@/lib/supabase/client'

export default function OpenFileButton({ bucket, path, label = 'فتح' }: { bucket: string; path: string; label?: string }) {
  async function open() {
    const supabase = createClient()
    // نعملوا رابط مؤقت صالح لمدة ساعة
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600)
    if (error) { alert(error.message); return }
    window.open(data.signedUrl, '_blank')
  }
  return <button onClick={open} className="text-xs px-3 py-1 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 transition">{label}</button>
}