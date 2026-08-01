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
    <div className="glass-card p-5 flex flex-col gap-4 animate-slide-up">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Project Name + Payment */}
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 mb-1">
            <h3 className="text-base font-bold text-slate-100 leading-snug truncate max-w-[60%]">
              {project.name}
            </h3>
            <div className="shrink-0">
              <PaymentBadge status={project.paymentStatus} cost={project.cost} />
            </div>
          </div>
          {/* Client Name */}
          <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-3">
            <User size={13} className="shrink-0" />
            <span className="font-medium">{project.clientName}</span>
            <span className="text-slate-600 mx-1">·</span>
            <span className="text-xs text-slate-500">{formattedDate}</span>
          </div>

          {/* Progress bar */}
          <ProgressBar value={project.progress} />
        </div>
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <StatusBadge status={project.status} />
        </div>
        {/* Expand/collapse extras button */}
        {hasExtras && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            id={`expand-extras-${project.id}`}
            title={expanded ? 'Hide details' : 'Show more details'}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? 'Less' : 'More'}
          </button>
        )}
      </div>

      {/* Notes */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <FileText size={12} className="text-slate-500" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Notes</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">{project.notes || '—'}</p>
      </div>

      {/* ── File Attachments (always visible) ── */}
      {hasFiles && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Paperclip size={12} className="text-slate-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Attachments ({project.fileLinks!.length})
            </span>
          </div>
          <FileAttachments files={project.fileLinks!} compact />
        </div>
      )}

      {/* ── Expandable extras (project link + images) ── */}
      {hasExtras && expanded && (
        <div className="space-y-3 pt-1 border-t border-slate-800">
          {/* Project Link */}
          {project.projectLink && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Link size={12} className="text-indigo-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Project Link</span>
              </div>
              <a
                href={project.projectLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors truncate max-w-full"
              >
                <ExternalLink size={11} />
                {project.projectLink}
              </a>
            </div>
          )}

          {/* Image Gallery (thumbnails) */}
          {project.imageLinks && project.imageLinks.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Image size={12} className="text-emerald-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pictures ({project.imageLinks.length})</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {project.imageLinks.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Project image ${i + 1}`}
                      className="w-full h-16 object-cover rounded-lg border border-slate-700/50 hover:border-indigo-500/50 transition-colors"
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
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
          <button
            onClick={handleCopyLink}
            className={`btn-secondary flex-1 justify-center text-xs py-2 transition-all ${copied ? 'text-emerald-400 border-emerald-700/50' : ''}`}
            title="Copy client share link"
            id={`copy-link-${project.id}`}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy Share Link'}
          </button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary px-3 py-2 text-xs"
            title="Preview client view"
            id={`preview-link-${project.id}`}
          >
            <ExternalLink size={13} />
          </a>
          <button
            onClick={() => onEdit?.(project)}
            className="btn-secondary px-3 py-2 text-xs"
            title="Edit project"
            id={`edit-${project.id}`}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete?.(project.id)}
            className="btn-danger px-3 py-2"
            title="Delete project"
            id={`delete-${project.id}`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  )
}
