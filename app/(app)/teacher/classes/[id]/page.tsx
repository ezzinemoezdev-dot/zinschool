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
  const [sessions, setSessions] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [recordings, setRecordings] = useState<any[]>([])
  
  const [title, setTitle] = useState('')
  const [filePath, setFilePath] = useState('')
  const [fileName, setFileName] = useState('')
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [sessionUrl, setSessionUrl] = useState('')
  const [assignTitle, setAssignTitle] = useState('')
  const [assignPath, setAssignPath] = useState('')
  const [assignFileName, setAssignFileName] = useState('')
  const [recTitle, setRecTitle] = useState('')
  const [recUrl, setRecUrl] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    const { data: c } = await supabase.from('classes').select('*').eq('id', id).single()
    setCls(c)
    
    const { data: m } = await supabase.from('materials').select('*').eq('class_id', id).order('created_at', { ascending: false })
    setMaterials(m ?? [])

    const { data: s } = await supabase.from('live_sessions').select('*').eq('class_id', id).order('starts_at', { ascending: true })
    setSessions(s ?? [])

    const { data: a } = await supabase.from('assignments').select('*, corrections(*)').eq('class_id', id).order('created_at', { ascending: false })
    setAssignments(a ?? [])

    const { data: r } = await supabase.from('recordings').select('*').eq('class_id', id).order('created_at', { ascending: false })
    setRecordings(r ?? [])

    setLoading(false)
  }

  useEffect(() => { loadData() }, [id])

  // دالة الحذف
  async function handleDelete(table: string, rowId: string) {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return
    const { error } = await supabase.from(table).delete().eq('id', rowId)
    if (error) alert(error.message)
    else loadData()
  }

  async function addMaterial(e: React.FormEvent) {
    e.preventDefault()
    if (!filePath) return alert('ارفع الملف أولاً')
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('materials').insert({ class_id: id, teacher_id: user!.id, title, file_path: filePath, file_name: fileName })
    if (error) alert(error.message)
    else { setTitle(''); setFilePath(''); setFileName(''); loadData() }
  }

  async function addSession(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('live_sessions').insert({ class_id: id, teacher_id: user!.id, title: sessionTitle, starts_at: new Date(sessionDate).toISOString(), meeting_url: sessionUrl })
    if (error) alert(error.message)
    else { setSessionTitle(''); setSessionDate(''); setSessionUrl(''); loadData() }
  }

  async function addAssignment(e: React.FormEvent) {
    e.preventDefault()
    if (!assignPath) return alert('ارفع ملف العمل أولاً')
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('assignments').insert({ class_id: id, teacher_id: user!.id, title: assignTitle, file_path: assignPath })
    if (error) alert(error.message)
    else { setAssignTitle(''); setAssignPath(''); setAssignFileName(''); loadData() }
  }

  async function addCorrection(assignmentId: string, path: string) {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('corrections').insert({ assignment_id: assignmentId, teacher_id: user!.id, file_path: path })
    if (error) alert(error.message)
    else loadData()
  }

  async function addRecording(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('recordings').insert({ class_id: id, teacher_id: user!.id, title: recTitle, recording_url: recUrl })
    if (error) alert(error.message)
    else { setRecTitle(''); setRecUrl(''); loadData() }
  }

  if (loading) return <div className="text-center mt-10">جاري التحميل...</div>
  if (!cls) return <div className="text-center mt-10 text-red-600">القسم غير موجود</div>

  return (
    <div className="space-y-8" dir="rtl">
      <button onClick={() => router.push('/teacher/classes')} className="text-sm text-indigo-600 hover:underline">
        ← رجوع للأقسام
      </button>
      
      <div className="bg-white rounded-xl shadow p-6 border-r-4 border-indigo-600">
        <h1 className="text-2xl font-bold text-indigo-700">{cls.name}</h1>
        <p className="text-gray-500">{cls.subject} • {cls.level}</p>
      </div>

      {/* الدروس */}
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
              <div><div className="font-medium">{m.title}</div></div>
              <div className="flex gap-2">
                <OpenFileButton bucket="materials" path={m.file_path} />
                <button onClick={() => handleDelete('materials', m.id)} className="text-red-500 hover:text-red-700 text-sm font-bold">🗑️</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* الأعمال والإصلاحات */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4 border-t-4 border-orange-400">
        <h2 className="text-xl font-bold border-b pb-2">📝 الأعمال المطلوبة والإصلاح</h2>
        <form onSubmit={addAssignment} className="grid md:grid-cols-3 gap-3 items-center bg-orange-50 p-3 rounded">
          <input required placeholder="عنوان العمل" value={assignTitle} onChange={e => setAssignTitle(e.target.value)} className="border rounded p-2" />
          <FileUpload bucket="assignments" path={id as string} onUploaded={(p, n) => { setAssignPath(p); setAssignFileName(n) }} />
          <button disabled={!assignPath} className="bg-orange-500 text-white rounded p-2 disabled:opacity-50">+ إضافة عمل</button>
        </form>
        <ul className="space-y-4 mt-4">
          {assignments.map(a => (
            <li key={a.id} className="p-4 border rounded-lg bg-gray-50 relative">
              <button onClick={() => handleDelete('assignments', a.id)} className="absolute top-2 left-2 text-red-500 hover:text-red-700 font-bold">🗑️</button>
              <div className="flex justify-between items-center mb-3 pr-8">
                <div className="font-bold text-lg text-gray-800">{a.title}</div>
                <OpenFileButton bucket="assignments" path={a.file_path} label="تحميل الموضوع" />
              </div>
              <div className="pl-4 border-r-2 border-green-500 pr-3">
                <p className="text-sm font-semibold text-green-700 mb-2">الإصلاح (Correction):</p>
                {a.corrections && a.corrections.length > 0 ? (
                  a.corrections.map((c: any) => (
                    <div key={c.id} className="flex gap-2 items-center mb-2">
                      <OpenFileButton bucket="corrections" path={c.file_path} label="فتح الإصلاح" />
                      <button onClick={() => handleDelete('corrections', c.id)} className="text-red-500 text-xs font-bold">🗑️</button>
                    </div>
                  ))
                ) : <div className="text-xs text-gray-500 mb-2">لم يتم رفع الإصلاح بعد.</div>}
                <FileUpload bucket="corrections" path={id as string} onUploaded={(p) => addCorrection(a.id, p)} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* التسجيلات */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4 border-t-4 border-purple-500">
        <h2 className="text-xl font-bold border-b pb-2">🎬 إضافة تسجيل حصة</h2>
        <form onSubmit={addRecording} className="grid md:grid-cols-3 gap-3 items-center bg-purple-50 p-3 rounded">
          <input required placeholder="عنوان التسجيل" value={recTitle} onChange={e => setRecTitle(e.target.value)} className="border rounded p-2" />
          <input required placeholder="رابط التسجيل (YouTube/Drive)" value={recUrl} onChange={e => setRecUrl(e.target.value)} className="border rounded p-2" dir="ltr" />
          <button className="bg-purple-600 text-white rounded p-2 font-semibold">+ إضافة تسجيل</button>
        </form>
        <ul className="divide-y mt-4">
          {recordings.map(r => (
            <li key={r.id} className="py-3 flex justify-between items-center">
              <div className="font-medium text-gray-800">{r.title}</div>
              <div className="flex gap-2">
                <a href={r.recording_url} target="_blank" className="text-xs px-3 py-1 bg-purple-100 text-purple-700 font-semibold rounded">مشاهدة</a>
                <button onClick={() => handleDelete('recordings', r.id)} className="text-red-500 hover:text-red-700 text-sm font-bold">🗑️</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* الحصص المباشرة */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-xl font-bold border-b pb-2">🎥 إضافة حصة مباشرة</h2>
        <form onSubmit={addSession} className="grid md:grid-cols-4 gap-3 items-center">
          <input required placeholder="عنوان الحصة" value={sessionTitle} onChange={e => setSessionTitle(e.target.value)} className="border rounded p-2" />
          <input required type="datetime-local" value={sessionDate} onChange={e => setSessionDate(e.target.value)} className="border rounded p-2 text-sm" />
          <input required placeholder="رابط الحصة (Zoom/Jitsi)" value={sessionUrl} onChange={e => setSessionUrl(e.target.value)} className="border rounded p-2" dir="ltr" />
          <button className="bg-green-600 text-white rounded p-2 font-semibold">+ جدولة حصة</button>
        </form>
        <ul className="divide-y mt-4">
          {sessions.map(s => (
            <li key={s.id} className="py-3 flex justify-between items-center bg-gray-50/50 p-2 rounded mb-2">
              <div>
                <div className="font-medium text-indigo-700">{s.title}</div>
                <div className="text-xs text-gray-500 font-mono" dir="ltr">{new Date(s.starts_at).toLocaleString('fr-TN')}</div>
              </div>
              <div className="flex gap-2">
                <a href={s.meeting_url} target="_blank" className="text-xs px-3 py-1 bg-green-100 text-green-700 font-semibold rounded">فتح الرابط</a>
                <button onClick={() => handleDelete('live_sessions', s.id)} className="text-red-500 hover:text-red-700 text-sm font-bold">🗑️</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}