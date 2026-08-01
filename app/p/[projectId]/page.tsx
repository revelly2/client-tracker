'use client'

import { useEffect, useState } from 'react'
import {
  FolderKanban, AlertCircle, Clock, CheckCircle2, PauseCircle, Eye,
  Link, Image, ExternalLink,
} from 'lucide-react'
import type { Project } from '../../../lib/types'
import { getProjectByToken } from '../../../lib/actions'
import ProgressBar from '../../../components/ProgressBar'
import PaymentBadge from '../../../components/PaymentBadge'
import StatusBadge from '../../../components/StatusBadge'
import FileAttachments from '../../../components/FileAttachments'

function StatusIcon({ status }: { status: Project['status'] }) {
  if (status === 'Active')    return <Clock size={16} className="text-blue-400" />
  if (status === 'Completed') return <CheckCircle2 size={16} className="text-emerald-400" />
  if (status === 'On Hold')   return <PauseCircle size={16} className="text-orange-400" />
  return <Eye size={16} className="text-purple-400" />
}

function Divider() {
  return <div className="h-px w-full bg-slate-800 my-1" />
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-md bg-slate-700/60 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  )
}

export default function PublicProjectPage({
  params,
}: {
  params: { projectId: string }
}) {
  const [project, setProject] = useState<Project | null | undefined>(undefined)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)

  useEffect(() => {
    async function fetchProject() {
      const found = await getProjectByToken(params.projectId)
      setProject(found)
    }
    fetchProject()
  }, [params.projectId])

  // Loading state
  if (project === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  // Not found
  if (project === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-[#0f0f1a] to-indigo-950">
        <div className="absolute top-20 left-20 w-72 h-72 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="glass-card max-w-sm w-full p-8 text-center shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/40 flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={28} className="text-rose-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-100 mb-2">Project Not Found</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            This project link is invalid or may have been removed.
            Please contact your project manager for a new link.
          </p>
        </div>
      </div>
    )
  }

  const formattedDate = new Date(project.createdAt).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const hasFiles  = project.fileLinks  && project.fileLinks.length  > 0
  const hasImages = project.imageLinks && project.imageLinks.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0f0f1a] to-indigo-950 p-4 sm:p-8">
      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Full size preview"
            className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="relative max-w-2xl mx-auto animate-fade-in">
        {/* Brand header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <FolderKanban size={18} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Client Portal</p>
            <p className="text-sm font-bold text-slate-200 leading-none">Project Status Update</p>
          </div>
        </div>

        {/* Main card */}
        <div className="glass-card overflow-hidden shadow-2xl">
          {/* Top accent bar */}
          <div className={`h-1 w-full ${
            project.status === 'Active'    ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
            project.status === 'Completed' ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
            project.status === 'On Hold'   ? 'bg-gradient-to-r from-orange-400 to-amber-500' :
                                             'bg-gradient-to-r from-purple-400 to-violet-500'
          }`} />

          <div className="p-6 sm:p-8 space-y-6">
            {/* ─── Row 1: Project Name + Payment ─── */}
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Project Name</p>
                  <h1 className="text-2xl font-extrabold text-slate-100 leading-tight">{project.name}</h1>
                </div>
                <div className="mt-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Payment</p>
                  <PaymentBadge status={project.paymentStatus} cost={project.cost} />
                </div>
              </div>
            </div>

            <Divider />

            {/* ─── Row 2: Client Name ─── */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">
                {project.clientName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Client Name</p>
                <p className="text-base font-semibold text-slate-100">{project.clientName}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-slate-500 font-medium">Project Started</p>
                <p className="text-sm text-slate-300 font-medium">{formattedDate}</p>
              </div>
            </div>

            <Divider />

            {/* ─── Row 3: Progress ─── */}
            <div>
              <ProgressBar value={project.progress} animated />
            </div>

            {/* ─── Row 4: Status ─── */}
            <div className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3">
              <StatusIcon status={project.status} />
              <div className="flex-1">
                <p className="text-xs text-slate-500 font-medium mb-0.5">Current Status</p>
                <StatusBadge status={project.status} />
              </div>
            </div>

            <Divider />

            {/* ─── Row 5: Notes ─── */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Latest Notes</p>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {project.notes || 'No notes have been added yet.'}
                </p>
              </div>
            </div>

            {/* ─── Row 6: Project Link (if set) ─── */}
            {project.projectLink && (
              <>
                <Divider />
                <div>
                  <SectionLabel
                    icon={<Link size={12} className="text-indigo-400" />}
                    label="Project Link"
                  />
                  {project.paymentStatus !== 'paid' ? (
                    <button
                      onClick={() => setPaymentModalOpen(true)}
                      className="w-full text-left relative overflow-hidden rounded-xl border border-dashed border-slate-700 bg-slate-900/30 hover:bg-slate-800/50 transition-colors group p-4 flex flex-col items-center justify-center"
                    >
                      <div className="w-full opacity-30 blur-[4px] pointer-events-none mb-3">
                        <div className="flex items-center gap-3 bg-indigo-950/40 border border-indigo-700/40 rounded-xl px-4 py-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center shrink-0">
                            <ExternalLink size={14} className="text-indigo-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 mb-0.5">Visit Project</p>
                            <p className="text-sm text-indigo-300 truncate">{project.projectLink}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest group-hover:scale-105 transition-transform drop-shadow-md">
                        <AlertCircle size={14} /> Requires Payment to Unlock
                      </div>
                    </button>
                  ) : (
                    <a
                      href={project.projectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-indigo-950/40 border border-indigo-700/40 hover:border-indigo-500/60 rounded-xl px-4 py-3 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center shrink-0">
                        <ExternalLink size={14} className="text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 mb-0.5">Visit Project</p>
                        <p className="text-sm text-indigo-300 group-hover:text-indigo-200 truncate transition-colors">
                          {project.projectLink}
                        </p>
                      </div>
                      <ExternalLink size={14} className="text-slate-600 group-hover:text-indigo-400 shrink-0 transition-colors" />
                    </a>
                  )}
                </div>
              </>
            )}

            {/* ─── Row 7: File Attachments ─── */}
            {hasFiles && (
              <>
                <Divider />
                <div>
                  <SectionLabel
                    icon={<ExternalLink size={12} className="text-amber-400" />}
                    label={`Attachments (${project.fileLinks!.length})`}
                  />
                  <FileAttachments files={project.fileLinks!} />
                </div>
              </>
            )}

            {/* ─── Row 8: Pictures / Gallery ─── */}
            {hasImages && (
              <>
                <Divider />
                <div>
                  <SectionLabel
                    icon={<Image size={12} className="text-emerald-400" />}
                    label={`Pictures (${project.imageLinks!.length})`}
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {project.imageLinks!.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setLightbox(url)}
                        className="group relative overflow-hidden rounded-xl border border-slate-700/50 hover:border-indigo-500/50 transition-all aspect-video cursor-zoom-in"
                        title="Click to enlarge"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Project image ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.parentElement!.classList.add('hidden')
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <ExternalLink size={20} className="text-white drop-shadow-lg" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-700 mt-6">
          This is a private project update link. Please do not share it with others.
        </p>
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPaymentModalOpen(false)}
        >
          <div className="glass-card w-full max-w-sm p-8 shadow-2xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-800/40 flex items-center justify-center mb-5 mx-auto">
              <AlertCircle size={24} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 text-center mb-2">Payment Required</h3>
            <p className="text-sm text-slate-400 text-center mb-6">
              Please complete your payment to unlock the project link.
            </p>
            
            <div className="space-y-4 text-sm text-slate-300 bg-slate-900/50 p-5 rounded-xl border border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-950 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0 mt-0.5">1</div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Pay using GCash</p>
                  <p className="text-lg font-mono font-bold text-emerald-400">0977 481 2075</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pt-2">
                <div className="w-6 h-6 rounded-full bg-indigo-950 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0 mt-0.5">2</div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Verify Payment</p>
                  <p>Send a screenshot of the receipt to <br/><strong className="text-indigo-400">Mark Daluson (Facebook)</strong></p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setPaymentModalOpen(false)}
              className="btn-primary w-full justify-center mt-6 py-2.5"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
