'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { FirearmCategory } from '@/types'

const CATEGORIES: FirearmCategory[] = ['Handgun', 'Rifle', 'Shotgun', 'NFA Item', 'Other']
const TAGS = ['Carry Gun', 'Duty Gun', 'Hunting Rifle', 'Competition', 'Training', 'Home Defense']

export default function AddFirearmPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const [form, setForm] = useState({
    manufacturer: '', model: '', caliber: '', barrel_length: '',
    serial_number: '', purchase_date: '', purchase_price: '',
    current_value: '', insurance_value: '', notes: '',
    category: '' as FirearmCategory | '',
  })

  function toggleTag(tag: string) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Not signed in'); setLoading(false); return }

    const { error } = await supabase.from('firearms').insert({
      user_id: user.id,
      manufacturer: form.manufacturer,
      model: form.model,
      caliber: form.caliber || null,
      barrel_length: form.barrel_length || null,
      serial_number: form.serial_number || null,
      purchase_date: form.purchase_date || null,
      purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
      current_value: form.current_value ? parseFloat(form.current_value) : null,
      insurance_value: form.insurance_value ? parseFloat(form.insurance_value) : null,
      notes: form.notes || null,
      category: form.category || null,
      tags: selectedTags,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Firearm added!')
      router.push('/firearms')
    }
    setLoading(false)
  }

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/firearms" className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="page-header mb-0">Add Firearm</h1>
          <p className="text-slate-400 text-sm">Add a new firearm to your collection</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="card mb-4">
          <h2 className="font-semibold text-white mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Manufacturer *</label>
              <input className="input" placeholder="Glock" value={form.manufacturer} onChange={e => set('manufacturer', e.target.value)} required />
            </div>
            <div>
              <label className="label">Model *</label>
              <input className="input" placeholder="G19 Gen 5" value={form.model} onChange={e => set('model', e.target.value)} required />
            </div>
            <div>
              <label className="label">Caliber</label>
              <input className="input" placeholder="9mm" value={form.caliber} onChange={e => set('caliber', e.target.value)} />
            </div>
            <div>
              <label className="label">Barrel Length</label>
              <input className="input" placeholder='4.02"' value={form.barrel_length} onChange={e => set('barrel_length', e.target.value)} />
            </div>
            <div>
              <label className="label">Serial Number</label>
              <input className="input" placeholder="ABC123456" value={form.serial_number} onChange={e => set('serial_number', e.target.value)} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <h2 className="font-semibold text-white mb-4">Purchase & Value</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Purchase Date</label>
              <input type="date" className="input" value={form.purchase_date} onChange={e => set('purchase_date', e.target.value)} />
            </div>
            <div>
              <label className="label">Purchase Price ($)</label>
              <input type="number" step="0.01" className="input" placeholder="599.99" value={form.purchase_price} onChange={e => set('purchase_price', e.target.value)} />
            </div>
            <div>
              <label className="label">Current Value ($)</label>
              <input type="number" step="0.01" className="input" placeholder="650.00" value={form.current_value} onChange={e => set('current_value', e.target.value)} />
            </div>
            <div>
              <label className="label">Insurance Value ($)</label>
              <input type="number" step="0.01" className="input" placeholder="700.00" value={form.insurance_value} onChange={e => set('insurance_value', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <h2 className="font-semibold text-white mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-brand-500/20 border-brand-500/50 text-brand-400'
                    : 'bg-surface-muted border-surface-border text-slate-400 hover:text-white'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="font-semibold text-white mb-4">Notes</h2>
          <textarea
            className="input h-24 resize-none"
            placeholder="Any additional notes about this firearm…"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Adding…' : 'Add Firearm'}
          </button>
          <Link href="/firearms" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
