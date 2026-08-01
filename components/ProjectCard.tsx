'use client'

import { useState } from 'react'
import { Copy, Check, Pencil, Trash2, ExternalLink, User, FileText, Link, Paperclip, Image, ChevronDown, ChevronUp } from 'lucide-react'
import type { Project } from '../lib/types'
import ProgressBar from './ProgressBar'
import PaymentBadge from './PaymentBadge'
import StatusBadge from './StatusBadge'
import FileAttachments from './FileAttachments'

interface ProjectCardProps {
  project: Project
  isAdmin?: boolean
  onEdit?: (project: Project) => void
  onDelete?: (id: string) => void
}

export default function ProjectCard({
  project,
  isAdmin = false,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const [copied, setCopied]       = useState(false)
  const [expanded, setExpanded]   = useState(false)

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/p/${project.shareToken}`
      : `/p/${project.shareToken}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = shareUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formattedDate = new Date(project.createdAt).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  const hasExtras =
    !!project.projectLink ||
    (project.imageLinks && project.imageLinks.length > 0)

  const hasFiles = project.fileLinks && project.fileLinks.length > 0

  return (
    <div className="glass-card p-6 flex flex-col gap-5 animate-entrance group hover:shadow-[0_10px_40px_rgba(59,130,246,0.1)] transition-all">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Project Name + Payment */}
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mb-2">
            <h3 className="text-lg font-bold text-white leading-snug truncate max-w-[60%] group-hover:text-blue-400 transition-colors">
              {project.name}
            </h3>
            <div className="shrink-0">
              <PaymentBadge status={project.paymentStatus} cost={project.cost} />
            </div>
          </div>
          {/* Client Name */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-mono">
            <User size={14} className="text-blue-500 shrink-0" />
            <span className="font-semibold text-slate-300">{project.clientName}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-500">{formattedDate}</span>
          </div>

          {/* Progress bar */}
          <ProgressBar value={project.progress} animated />
        </div>
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Status</span>
          <StatusBadge status={project.status} />
        </div>
        {/* Expand/collapse extras button */}
        {hasExtras && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-slate-500 hover:text-blue-400 transition-colors"
            id={`expand-extras-${project.id}`}
            title={expanded ? 'Hide details' : 'Show more details'}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Less' : 'More'}
          </button>
        )}
      </div>

      {/* Notes */}
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 shadow-inner">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={14} className="text-blue-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol Notes</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed font-light line-clamp-3">{project.notes || 'No active remarks.'}</p>
      </div>

      {/* ── File Attachments (always visible) ── */}
      {hasFiles && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Paperclip size={14} className="text-blue-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Data Assets ({project.fileLinks!.length})
            </span>
          </div>
          <FileAttachments files={project.fileLinks!} compact />
        </div>
      )}

      {/* ── Expandable extras (project link + images) ── */}
      {hasExtras && expanded && (
        <div className="space-y-4 pt-4 border-t border-white/5 animate-entrance">
          {/* Project Link */}
          {project.projectLink && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link size={14} className="text-blue-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">External Node</span>
              </div>
              <a
                href={project.projectLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors truncate max-w-full font-mono bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 shadow-inner"
              >
                <ExternalLink size={12} />
                {project.projectLink}
              </a>
            </div>
          )}

          {/* Image Gallery (thumbnails) */}
          {project.imageLinks && project.imageLinks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Image size={14} className="text-blue-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Visual Feeds ({project.imageLinks.length})</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {project.imageLinks.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded-xl border border-white/5 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Feed asset ${i + 1}`}
                      className="w-full h-16 object-cover opacity-80 hover:opacity-100 transition-opacity"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin actions */}
      {isAdmin && (
        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
          <button
            onClick={handleCopyLink}
            className={`btn-secondary flex-1 justify-center py-2.5 transition-all ${copied ? 'text-blue-400 border-blue-500/50 bg-blue-500/10' : ''}`}
            title="Copy client share link"
            id={`copy-link-${project.id}`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Link Copied' : 'Copy Access Token'}
          </button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary px-3.5 py-2.5"
            title="Preview client view"
            id={`preview-link-${project.id}`}
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={() => onEdit?.(project)}
            className="btn-secondary px-3.5 py-2.5 hover:text-blue-400 hover:border-blue-500/30"
            title="Edit project"
            id={`edit-${project.id}`}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete?.(project.id)}
            className="btn-danger px-3.5 py-2.5 hover:bg-red-500/20 hover:text-red-400"
            title="Delete project"
            id={`delete-${project.id}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
