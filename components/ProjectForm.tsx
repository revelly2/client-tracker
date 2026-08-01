'use client'

import { useEffect, useState } from 'react'
import { X, Plus, Trash2, Link, FolderOpen, Image } from 'lucide-react'
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
      <div className="w-6 h-6 rounded-md bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</span>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-title"
    >
      <div className="glass-card w-full max-w-lg animate-slide-up shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Plus size={16} className="text-indigo-400" />
            </div>
            <h2 id="form-title" className="text-base font-bold text-slate-100">
              {initial ? 'Edit Project' : 'Add New Project'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
            aria-label="Close form"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="px-4 py-2.5 rounded-xl text-sm text-rose-400 bg-rose-950/40 border border-rose-800/40">
              {error}
            </div>
          )}

          {/* ── Core fields ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label-text" htmlFor="field-name">Project Name</label>
              <input
                id="field-name"
                type="text"
                className="input-field"
                placeholder="e.g. E-Commerce Website Redesign"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>

            <div>
              <label className="label-text" htmlFor="field-client">Client Name</label>
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
              <label className="label-text" htmlFor="field-cost">Cost (₱)</label>
              <input
                id="field-cost"
                type="number"
                min={0}
                className="input-field"
                placeholder="45000"
                value={form.cost === 0 ? '' : form.cost}
                onChange={(e) => set('cost', Number(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="label-text" htmlFor="field-payment">Payment Status</label>
              <select
                id="field-payment"
                className="input-field"
                value={form.paymentStatus}
                onChange={(e) => set('paymentStatus', e.target.value as PaymentStatus)}
              >
                {PAYMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-text" htmlFor="field-status">Status</label>
              <select
                id="field-status"
                className="input-field"
                value={form.status}
                onChange={(e) => set('status', e.target.value as ProjectStatus)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="label-text" htmlFor="field-progress">
                Progress: {form.progress}%
              </label>
              <input
                id="field-progress"
                type="range"
                min={0}
                max={100}
                step={5}
                className="w-full h-2 appearance-none rounded-full bg-slate-800 cursor-pointer accent-indigo-500"
                value={form.progress}
                onChange={(e) => set('progress', Number(e.target.value))}
              />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="label-text" htmlFor="field-notes">Notes / Updates</label>
              <textarea
                id="field-notes"
                rows={3}
                className="input-field resize-none"
                placeholder="Add project updates, current status details, or next steps…"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-slate-800" />

          {/* ── Project Link ── */}
          <div>
            {sectionHeader(<Link size={12} className="text-indigo-400" />, 'Project Link')}
            <input
              id="field-project-link"
              type="url"
              className="input-field"
              placeholder="https://github.com/user/project or https://yoursite.com"
              value={form.projectLink ?? ''}
              onChange={(e) => set('projectLink', e.target.value)}
            />
            <p className="text-xs text-slate-600 mt-1.5">Live demo, GitHub repo, Vercel deployment, etc.</p>
          </div>

          {/* ── File Repository ── */}
          <div>
            {sectionHeader(<FolderOpen size={12} className="text-amber-400" />, 'File Attachments')}
            <div className="space-y-2">
              {(form.fileLinks ?? []).map((file, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      className="input-field text-xs py-2"
                      placeholder="Label (e.g. Design Files)"
                      value={file.label}
                      onChange={(e) => updateFile(idx, 'label', e.target.value)}
                      id={`file-label-${idx}`}
                    />
                    <input
                      type="url"
                      className="input-field text-xs py-2"
                      placeholder="https://drive.google.com/…"
                      value={file.url}
                      onChange={(e) => updateFile(idx, 'url', e.target.value)}
                      id={`file-url-${idx}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="btn-danger p-2 mt-0.5 shrink-0"
                    title="Remove file"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFile}
                className="btn-secondary w-full justify-center text-xs py-2 border-dashed"
                id="add-file-btn"
              >
                <Plus size={13} /> Add Attachment
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-1.5">Supports Google Drive, Dropbox, OneDrive, GitHub, Figma, Notion, and any direct URL.</p>
          </div>

          {/* ── Image Links ── */}
          <div>
            {sectionHeader(<Image size={12} className="text-emerald-400" />, 'Pictures / Screenshots')}
            <div className="space-y-2">
              {(form.imageLinks ?? []).map((url, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="url"
                    className="input-field text-xs py-2 flex-1"
                    placeholder="https://i.imgur.com/… or direct image URL"
                    value={url}
                    onChange={(e) => updateImage(idx, e.target.value)}
                    id={`image-url-${idx}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="btn-danger p-2 shrink-0"
                    title="Remove image"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addImage}
                className="btn-secondary w-full justify-center text-xs py-2 border-dashed"
                id="add-image-btn"
              >
                <Plus size={13} /> Add Image URL
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-1.5">Direct image links — Imgur, Cloudinary, GitHub raw, etc.</p>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-1 border-t border-slate-800">
            <button type="button" onClick={onCancel} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center" id="form-submit-btn">
              {initial ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
