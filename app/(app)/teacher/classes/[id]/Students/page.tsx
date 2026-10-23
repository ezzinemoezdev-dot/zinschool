'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function StudentsListPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadStudents() {
    setLoading(true)
    // نجيبوا التلامذة المسجلين في القسم
    const { data } = await supabase
      .from('enrollments')
      .select('id, student_id, profiles(full_name, email)')
      .eq('class_id', id)
      .eq('status', 'active')
      
    setStudents(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadStudents() }, [id])

  // حذف تلميذ من القسم
  async function removeStudent(enrollmentId: string) {
    if (!confirm('هل أنت متأكد من إزالة هذا التلميذ من القسم؟')) return
    
    const { error } = await supabase
      .from('enrollments')
      .update({ status: 'removed' }) // نستعملوا update عوض delete (باش ما نمسحوش الحساب)
      .eq('id', enrollmentId)
      
    if (error) alert(error.message)
    else loadStudents()
  }

  if (loading) return <div className="text-center mt-10">جاري التحميل...</div>

  return (
    <div className="space-y-6" dir="rtl">
      <button onClick={() => router.push(`/teacher/classes/${id}`)} className="text-sm text-indigo-600 hover:underline">
        ← رجوع للقسم
      </button>
      
      <div className="bg-white rounded-xl shadow p-6 border-r-4 border-indigo-600">
        <h1 className="text-2xl font-bold text-indigo-700">قائمة التلامذة</h1>
        <p className="text-gray-500">التلامذة المسجلين في هذا القسم</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        {students.length === 0 ? (
          <p className="text-gray-500 text-center">ما فماش تلامذة مسجلين بعد.</p>
        ) : (
          <ul className="divide-y">
            {students.map((s) => (
              <li key={s.id} className="py-4 flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-800">{s.profiles?.full_name}</div>
                  <div className="text-sm text-gray-500" dir="ltr">{s.profiles?.email}</div>
                </div>
                <button 
                  onClick={() => removeStudent(s.id)} 
                  className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
                >
                  إزالة من القسم
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}