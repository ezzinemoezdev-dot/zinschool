'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { translations, Lang } from '@/lib/i18n'

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
  const [lang, setLang] = useState<Lang>('ar')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = translations[lang]

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Lang
    if (savedLang && (savedLang === 'ar' || savedLang === 'fr')) setLang(savedLang)
  }, [])

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
    
    setSelectedName(file.name)
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
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="file" accept={accept} onChange={handleChange} disabled={uploading} className="hidden" ref={fileInputRef} />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
        >
          {uploading ? t.uploading : t.chooseFile}
        </button>
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