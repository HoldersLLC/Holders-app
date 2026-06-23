'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Upload, FileText, Trash2, ExternalLink } from 'lucide-react'
import { Firearm, DocType } from '@/types'

const DOC_TYPES: DocType[] = ['Purchase Receipt', 'Warranty', 'Photo', 'Insurance', 'Manual', 'Other']

export default function DocumentsPage() {
  const supabase = createClient()
  const [firearms, setFirearms] = useState<Firearm[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ firearm_id: '', doc_type: 'Purchase Receipt' as DocType, name: '' })
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [{ data: fa }, { data: docs }] = await Promise.all([
      supabase.from('firearms').select('id, manufacturer, model').eq('user_id', user.id),
      supabase.from('documents').select('*, firearms(manufacturer, model)').eq('user_id', user.id).order('created_at', { ascending: false }),
    ])
    if (fa) setFirearms(fa as Firearm[])
    if (docs) setDocuments(docs)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { toast.error('Select a file'); return }
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('documents').upload(path, file)
    if (uploadError) { toast.error(uploadError.message); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)

    const { error } = await supabase.from('documents').insert({
      user_id: user.id,
      firearm_id: form.firearm_id || null,
      doc_type: form.doc_type,
      name: form.name || file.name,
      file_url: publicUrl,
      file_size: file.size,
    })

    if (error) { toast.error(error.message) } else {
      toast.success('Document uploaded!')
      setShowForm(false)
      setFile(null)
      setForm({ firearm_id: '', doc_type: 'Purchase Receipt', name: '' })
      fetchData()
    }
    setUploading(false)
  }

  async function deleteDoc(id: string) {
    await supabase.from('documents').delete().eq('id', id)
    toast.success('Document deleted')
    fetchData()
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">Documents</h1>
          <p className="page-subheader">Store receipts, warranties, manuals, and insurance records</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 border-brand-500/30">
          <h2 className="font-semibold text-white mb-4">Upload Document</h2>
          <form onSubmit={handleUpload} className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Document Name</label>
              <input className="input" placeholder="Glock 19 Purchase Receipt" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Document Type</label>
              <select className="input" value={form.doc_type} onChange={e => setForm(p => ({ ...p, doc_type: e.target.value as DocType }))}>
                {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Related Firearm (optional)</label>
              <select className="input" value={form.firearm_id} onChange={e => setForm(p => ({ ...p, firearm_id: e.target.value }))}>
                <option value="">Not firearm-specific</option>
                {firearms.map(f => <option key={f.id} value={f.id}>{f.manufacturer} {f.model}</option>)}
              </select>
            </div>
            <div>
              <label className="label">File *</label>
              <input type="file" className="input py-1.5" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={e => setFile(e.target.files?.[0] || null)} required />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="btn-primary" disabled={uploading}>{uploading ? 'Uploading…' : 'Upload'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold text-white mb-4">All Documents</h2>
        {documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between py-3 border-b border-surface-border last:border-0">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{doc.name}</div>
                    <div className="text-xs text-slate-400">
                      {doc.doc_type}
                      {doc.firearms && ` · ${doc.firearms.manufacturer} ${doc.firearms.model}`}
                      {doc.file_size && ` · ${formatSize(doc.file_size)}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-400 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={() => deleteDoc(doc.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No documents uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
