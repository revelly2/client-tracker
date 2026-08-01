'use client'

import { useEffect, useState } from 'react'
import { X, Plus, Trash2, Link, FolderOpen, Image, Save } from 'lucide-react'
import type { Project, PaymentStatus, ProjectStatus, FileEntry } from '../lib/types'

interface ProjectFormProps {
  initial?: Project | null
  onSave: (data: Omit<Project, 'id' | 'shareToken' | 'createdAt'>) => void
  onCancel: () => void
}

const PAYMENT_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'none',    label: 'No Downpayment' },
  { value: 'partial', label: 'Partially Paid'  },
  { value: 'paid',    label: 'Paid'             },
]

const STATUS_OPTIONS: ProjectStatus[] = ['Active', 'On Hold', 'Reviewing', 'Completed']

const EMPTY: Omit<Project, 'id' | 'shareToken' | 'createdAt'> = {
  name:          '',
  clientName:    '',
  cost:          0,
  paymentStatus: 'none',
  progress:      0,
  status:        'Active',
  notes:         '',
  projectLink:   '',
  fileLinks:     [],
  imageLinks:    [],
}

export default function ProjectForm({ initial, onSave, onCancel }: ProjectFormProps) {
  const [form, setForm]         = useState({ ...EMPTY })
  const [error, setError]       = useState('')

  useEffect(() => {
    if (initial) {
      setForm({
        name:          initial.name,
        clientName:    initial.clientName,
        cost:          initial.cost,
        paymentStatus: initial.paymentStatus,
        progress:      initial.progress,
        status:        initial.status,
        notes:         initial.notes,
        projectLink:   initial.projectLink  ?? '',
        fileLinks:     initial.fileLinks    ?? [],
        imageLinks:    initial.imageLinks   ?? [],
      })
    } else {
      setForm({ ...EMPTY })
    }
  }, [initial])

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  // ── File links helpers ──────────────────────────────────────────────────────
  const addFile = () =>
    set('fileLinks', [...(form.fileLinks ?? []), { label: '', url: '' }])

  const updateFile = (idx: number, field: keyof FileEntry, value: string) =>
    set(
      'fileLinks',
      (form.fileLinks ?? []).map((f, i) => (i === idx ? { ...f, [field]: value } : f))
    )

  const removeFile = (idx: number) =>
    set('fileLinks', (form.fileLinks ?? []).filter((_, i) => i !== idx))

  // ── Image link helpers ──────────────────────────────────────────────────────
  const addImage = () =>
    set('imageLinks', [...(form.imageLinks ?? []), ''])

  const updateImage = (idx: number, value: string) =>
    set('imageLinks', (form.imageLinks ?? []).map((u, i) => (i === idx ? value : u)))

  const removeImage = (idx: number) =>
    set('imageLinks', (form.imageLinks ?? []).filter((_, i) => i !== idx))

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim())       return setError('Project name is required.')
    if (!form.clientName.trim()) return setError('Client name is required.')
    if (form.cost < 0)           return setError('Cost cannot be negative.')
    // Strip empty file/image entries
    const cleaned: Omit<Project, 'id' | 'shareToken' | 'createdAt'> = {
      ...form,
      fileLinks:  (form.fileLinks  ?? []).filter((f) => f.url.trim()),
      imageLinks: (form.imageLinks ?? []).filter((u) => u.trim()),
      projectLink: form.projectLink?.trim() || undefined,
    }
    setError('')
    onSave(cleaned)
  }

  const sectionHeader = (icon: React.ReactNode, label: string) => (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-title"
    >
      <div className="glass-card w-full max-w-2xl animate-entrance shadow-2xl border-white/10">
        {/* Modal header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <Plus size={18} className="text-blue-400" />
            </div>
            <div>
              <h2 id="form-title" className="text-lg font-bold text-white tracking-wide">
                {initial ? 'Edit Project Parameters' : 'Initialize New Node'}
              </h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                {initial ? 'Modifying existing data' : 'Creating new client entry'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 border border-transparent hover:border-white/10 transition-all"
            aria-label="Close form"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {error && (
            <div className="px-4 py-3 rounded-xl text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 shadow-inner">
              ERROR: {error}
            </div>
          )}

          {/* ── Core fields ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="label-text" htmlFor="field-name">Designation (Project Name)</label>
              <input
                id="field-name"
                type="text"
                className="input-field"
                placeholder="e.g. SOTERO Protocol Integration"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>

            <div>
              <label className="label-text" htmlFor="field-client">Client Entity</label>
              <input
                id="field-client"
                type="text"
                className="input-field"
                placeholder="e.g. Maria Santos"
                value={form.clientName}
                onChange={(e) => set('clientName', e.target.value)}
              />
            </div>

            <div>
              <label className="label-text" htmlFor="field-cost">Project Tariff (₱)</label>
              <input
                id="field-cost"
                type="number"
                min={0}
                className="input-field font-mono"
                placeholder="45000"
                value={form.cost === 0 ? '' : form.cost}
                onChange={(e) => set('cost', Number(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="label-text" htmlFor="field-payment">Financial Status</label>
              <select
                id="field-payment"
                className="input-field appearance-none"
                value={form.paymentStatus}
                onChange={(e) => set('paymentStatus', e.target.value as PaymentStatus)}
              >
                {PAYMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-text" htmlFor="field-status">Node Status</label>
              <select
                id="field-status"
                className="input-field appearance-none"
                value={form.status}
                onChange={(e) => set('status', e.target.value as ProjectStatus)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="bg-slate-900">{s}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="flex justify-between items-center label-text mb-3" htmlFor="field-progress">
                <span>Progression Phase</span>
                <span className="text-blue-400 font-mono bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">{form.progress}%</span>
              </label>
              <input
                id="field-progress"
                type="range"
                min={0}
                max={100}
                step={5}
                className="w-full h-2 appearance-none rounded-full bg-slate-900 cursor-pointer accent-blue-500 border border-white/5 shadow-inner"
                value={form.progress}
                onChange={(e) => set('progress', Number(e.target.value))}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label-text" htmlFor="field-notes">Protocol Notes / Updates</label>
              <textarea
                id="field-notes"
                rows={3}
                className="input-field resize-none text-xs"
                placeholder="Add project updates, current status details, or next steps…"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-white/5" />

          {/* ── Project Link ── */}
          <div>
            {sectionHeader(<Link size={14} className="text-blue-400" />, 'External Node (Project Link)')}
            <input
              id="field-project-link"
              type="url"
              className="input-field text-xs font-mono"
              placeholder="https://github.com/user/project or https://yoursite.com"
              value={form.projectLink ?? ''}
              onChange={(e) => set('projectLink', e.target.value)}
            />
          </div>

          {/* ── File Repository ── */}
          <div className="pt-2">
            {sectionHeader(<FolderOpen size={14} className="text-amber-400" />, 'Data Assets')}
            <div className="space-y-3">
              {(form.fileLinks ?? []).map((file, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      className="input-field text-xs py-2.5"
                      placeholder="Label (e.g. Design Files)"
                      value={file.label}
                      onChange={(e) => updateFile(idx, 'label', e.target.value)}
                      id={`file-label-${idx}`}
                    />
                    <input
                      type="url"
                      className="input-field text-xs py-2.5 font-mono"
                      placeholder="https://drive.google.com/…"
                      value={file.url}
                      onChange={(e) => updateFile(idx, 'url', e.target.value)}
                      id={`file-url-${idx}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="btn-danger p-2.5 mt-0.5 shrink-0 hover:bg-red-500/20"
                    title="Remove file"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFile}
                className="btn-secondary w-full justify-center text-xs py-3 border-dashed bg-transparent"
                id="add-file-btn"
              >
                <Plus size={14} /> Attach Asset
              </button>
            </div>
          </div>

          {/* ── Image Links ── */}
          <div className="pt-2 pb-2">
            {sectionHeader(<Image size={14} className="text-emerald-400" />, 'Visual Feeds')}
            <div className="space-y-3">
              {(form.imageLinks ?? []).map((url, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="url"
                    className="input-field text-xs py-2.5 flex-1 font-mono"
                    placeholder="https://i.imgur.com/… or direct image URL"
                    value={url}
                    onChange={(e) => updateImage(idx, e.target.value)}
                    id={`image-url-${idx}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="btn-danger p-2.5 shrink-0 hover:bg-red-500/20"
                    title="Remove image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addImage}
                className="btn-secondary w-full justify-center text-xs py-3 border-dashed bg-transparent"
                id="add-image-btn"
              >
                <Plus size={14} /> Attach Visual Feed
              </button>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-4 pt-6 border-t border-white/5 sticky bottom-0 bg-slate-900/90 backdrop-blur-md p-4 -mx-6 -mb-6 rounded-b-2xl">
            <button type="button" onClick={onCancel} className="btn-secondary flex-1 justify-center py-3.5">
              Abort
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center py-3.5" id="form-submit-btn">
              <Save size={16} />
              {initial ? 'Save Configuration' : 'Initialize Node'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
