'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function FileUpload({
  bucket, path, accept = '.pdf', onUploaded,
}: {
  bucket: string
  path: string
  accept?: string
  onUploaded: (filePath: string, fileName: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState('')
  const [selectedName, setSelectedName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function sanitizeFileName(name: string) {
    const lastDot = name.lastIndexOf('.')
    const ext = lastDot !== -1 ? name.slice(lastDot) : ''
    const base = lastDot !== -1 ? name.slice(0, lastDot) : name
    const cleanBase = base.replace(/[^a-zA-Z0-9_-]/g, '_')
    return cleanBase + ext
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    setSelectedName(file.name) // نخزروا الاسم باش نوروه للمستخدم
    setUploading(true)
    setErr('')
    
    const supabase = createClient()
    const safeBase = sanitizeFileName(file.name)
    const finalName = `${Date.now()}-${safeBase}`
    const fullPath = `${path}/${finalName}`
    
    const { error } = await supabase.storage.from(bucket).upload(fullPath, file)
    
    setUploading(false)
    if (error) { 
      setErr(error.message)
      setSelectedName('') 
      return 
    }
    
    onUploaded(fullPath, file.name)
    
    // نفرغوا الـ input باش ينجم يختار ملف آخر إذا حب
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-2">
      {/* الـ input الأصلي مخبي */}
      <input 
        type="file" 
        accept={accept} 
        onChange={handleChange} 
        disabled={uploading} 
        className="hidden" 
        ref={fileInputRef}
      />
      
      {/* الزر المخصص اللي باش يبان */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
        >
          {uploading ? '⏳ جاري الرفع...' : '📁 اختيار ملف'}
        </button>
        
        {/* نرو اسم الملف كي يختارو */}
        {selectedName && !err && (
          <span className="text-xs text-gray-500 truncate max-w-[150px]" title={selectedName}>
            {selectedName}
          </span>
        )}
      </div>

      {err && <p className="text-red-600 text-xs">{err}</p>}
    </div>
  )
}