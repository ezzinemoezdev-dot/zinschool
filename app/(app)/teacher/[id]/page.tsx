'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '@/components/FileUpload'
import OpenFileButton from '@/components/OpenFileButton'

export default function TeacherClassPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [cls, setCls] = useState<any>(null)
  const [materials, setMaterials] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [filePath, setFilePath] = useState('')
  const [fileName, setFileName] = useState('')

  async function loadData() {
    const { data: c } = await supabase.from('classes').select('*').eq('id', id).single()
    setCls(c)
    const { data: m } = await supabase.from('materials').select('*').eq('class_id', id).order('created_at', { ascending: false })
    setMaterials(m ?? [])
  }

  useEffect(() => { loadData() }, [id])

  async function addMaterial(e: React.FormEvent) {
    e.preventDefault()
    if (!filePath) return alert('ارفع الملف أولاً')
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase.from('materials').insert({
      class_id: id, teacher_id: user!.id, title, file_path: filePath, file_name: fileName
    })
    
    if (error) alert(error.message)
    else {
      setTitle(''); setFilePath(''); setFileName('')
      loadData()
    }
  }

  if (!cls) return <div className="text-center mt-10">جاري التحميل...</div>

  return (
    <div className="space-y-6">
      <button onClick={() => router.push('/teacher/classes')} className="text-sm text-indigo-600 hover:underline">
        ← رجوع للأقسام
      </button>
      
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-indigo-700">{cls.name}</h1>
        <p className="text-gray-500">{cls.subject} • {cls.level}</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-xl font-bold border-b pb-2">📄 إضافة درس (PDF)</h2>
        <form onSubmit={addMaterial} className="grid md:grid-cols-3 gap-3 items-center">
          <input required placeholder="عنوان الدرس" value={title} onChange={e => setTitle(e.target.value)} className="border rounded p-2" />
          <FileUpload bucket="materials" path={id as string} onUploaded={(p, n) => { setFilePath(p); setFileName(n) }} />
          <button disabled={!filePath} className="bg-indigo-600 text-white rounded p-2 disabled:opacity-50">+ رفع الدرس</button>
        </form>

        <ul className="divide-y mt-4">
          {materials.map(m => (
            <li key={m.id} className="py-3 flex justify-between items-center">
              <div>
                <div className="font-medium">{m.title}</div>
                <div className="text-xs text-gray-500">{m.file_name}</div>
              </div>
              <OpenFileButton bucket="materials" path={m.file_path} />
            </li>
          ))}
          {!materials.length && <li className="text-gray-500 py-2">ما فماش دروس بعد.</li>}
        </ul>
      </div>
    </div>
  )
}