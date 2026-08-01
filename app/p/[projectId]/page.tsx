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
  if (status === 'On Hold')   return <PauseCircle size={16} className="text-amber-400" />
  return <Eye size={16} className="text-purple-400" />
}

function Divider() {
  return <div className="h-px w-full bg-white/5 my-2" />
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
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
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  // Not found
  if (project === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617] overflow-hidden relative">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
        <div className="glass-card max-w-md w-full p-10 text-center shadow-[0_0_40px_rgba(239,68,68,0.1)] animate-entrance border-red-500/20">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Access Denied</h1>
          <p className="text-sm text-slate-400 font-light leading-relaxed">
            This deployment link is invalid or the node has been purged from the matrix.
            Please verify your access token.
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
    <div className="min-h-screen relative overflow-hidden p-4 sm:p-8 flex items-center justify-center">
      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-float" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-float" style={{ animationDelay: '-2s' }} />

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4 cursor-zoom-out bg-black/90"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Full size preview"
            className="max-w-full max-h-full rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] object-contain animate-entrance border border-white/5"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="relative max-w-2xl w-full mx-auto animate-entrance z-10 my-auto">
        {/* Brand header */}
        <div className="flex items-center justify-center gap-4 mb-8 opacity-80 hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <FolderKanban size={18} className="text-blue-400" />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Client Node</p>
            <p className="text-sm font-bold text-white tracking-wide">Deployment Status</p>
          </div>
        </div>

        {/* Main card */}
        <div className="glass-card overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] group hover:shadow-[0_20px_60px_rgba(59,130,246,0.1)] transition-shadow duration-500">
          {/* Top accent bar */}
          <div className={`h-1.5 w-full ${
            project.status === 'Active'    ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]' :
            project.status === 'Completed' ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]' :
            project.status === 'On Hold'   ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.8)]' :
                                             'bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.8)]'
          }`} />

          <div className="p-6 sm:p-10 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>

            {/* ─── Row 1: Project Name + Payment ─── */}
            <div className="relative z-10">
              <div className="flex flex-wrap items-start justify-between gap-6 mb-2">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">Designation</p>
                  <h1 className="text-3xl font-black text-white leading-tight tracking-tight">{project.name}</h1>
                </div>
                <div className="mt-1 shrink-0">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono text-right">Tariff</p>
                  <PaymentBadge status={project.paymentStatus} cost={project.cost} />
                </div>
              </div>
            </div>

            <Divider />

            {/* ─── Row 2: Client Name ─── */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-lg shadow-inner shrink-0">
                {project.clientName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Assigned Client</p>
                <p className="text-base font-bold text-white">{project.clientName}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Init Date</p>
                <p className="text-sm text-slate-300 font-mono">{formattedDate}</p>
              </div>
            </div>

            <Divider />

            {/* ─── Row 3: Progress ─── */}
            <div className="relative z-10">
              <ProgressBar value={project.progress} animated />
            </div>

            {/* ─── Row 4: Status ─── */}
            <div className="flex items-center gap-4 bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 relative z-10 shadow-inner">
              <StatusIcon status={project.status} />
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Network Status</p>
                <StatusBadge status={project.status} />
              </div>
            </div>

            <Divider />

            {/* ─── Row 5: Notes ─── */}
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Protocol Updates</p>
              <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 shadow-inner">
                <p className="text-sm text-slate-300 leading-relaxed font-light whitespace-pre-wrap">
                  {project.notes || 'No protocol updates found in the ledger.'}
                </p>
              </div>
            </div>

            {/* ─── Row 6: Project Link (if set) ─── */}
            {project.projectLink && (
              <>
                <Divider />
                <div className="relative z-10">
                  <SectionLabel
                    icon={<Link size={14} className="text-blue-400" />}
                    label="External Node Gateway"
                  />
                  {project.paymentStatus !== 'paid' ? (
                    <button
                      onClick={() => setPaymentModalOpen(true)}
                      className="w-full text-left relative overflow-hidden rounded-2xl border border-dashed border-amber-500/30 bg-slate-900/30 hover:bg-slate-900/50 transition-colors group p-6 flex flex-col items-center justify-center shadow-inner"
                    >
                      <div className="w-full opacity-30 blur-[6px] pointer-events-none mb-4">
                        <div className="flex items-center gap-4 bg-blue-900/20 border border-blue-500/20 rounded-xl px-5 py-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                            <ExternalLink size={16} className="text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 mb-1">Access Gateway</p>
                            <p className="text-sm text-blue-400 truncate">{project.projectLink}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest group-hover:scale-105 transition-transform drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full absolute">
                        <AlertCircle size={16} /> Tariff Outstanding. Gateway Locked.
                      </div>
                    </button>
                  ) : (
                    <a
                      href={project.projectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 bg-blue-500/5 border border-blue-500/20 hover:border-blue-400 hover:bg-blue-500/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] rounded-2xl px-5 py-4 transition-all group shadow-inner"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                        <ExternalLink size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Enter Gateway</p>
                        <p className="text-sm font-mono text-blue-400 group-hover:text-blue-300 truncate transition-colors">
                          {project.projectLink}
                        </p>
                      </div>
                      <ExternalLink size={16} className="text-slate-600 group-hover:text-blue-400 shrink-0 transition-colors" />
                    </a>
                  )}
                </div>
              </>
            )}

            {/* ─── Row 7: File Attachments ─── */}
            {hasFiles && (
              <>
                <Divider />
                <div className="relative z-10">
                  <SectionLabel
                    icon={<ExternalLink size={14} className="text-amber-400" />}
                    label={`Data Assets (${project.fileLinks!.length})`}
                  />
                  <FileAttachments files={project.fileLinks!} />
                </div>
              </>
            )}

            {/* ─── Row 8: Pictures / Gallery ─── */}
            {hasImages && (
              <>
                <Divider />
                <div className="relative z-10">
                  <SectionLabel
                    icon={<Image size={14} className="text-emerald-400" />}
                    label={`Visual Feeds (${project.imageLinks!.length})`}
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {project.imageLinks!.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setLightbox(url)}
                        className="group relative overflow-hidden rounded-2xl border border-white/5 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all aspect-video cursor-zoom-in bg-slate-900/50"
                        title="Click to enlarge"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Project image ${i + 1}`}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.parentElement!.classList.add('hidden')
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-blue-500/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[2px]">
                          <ExternalLink size={24} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
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
        <p className="text-center text-[10px] font-mono tracking-widest uppercase text-slate-600 mt-8 opacity-70">
          Encrypted Channel. Do Not Distribute.
        </p>
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 modal-overlay bg-black/80"
          onClick={() => setPaymentModalOpen(false)}
        >
          <div className="glass-card w-full max-w-md p-8 sm:p-10 shadow-[0_0_50px_rgba(245,158,11,0.15)] animate-entrance border-amber-500/20" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 mx-auto shadow-inner">
              <AlertCircle size={32} className="text-amber-400" />
            </div>
            <h3 className="text-2xl font-black text-white text-center mb-2">Gateway Locked</h3>
            <p className="text-sm font-light text-slate-400 text-center mb-8">
              Outstanding tariff detected. Complete authorization to unlock the deployment gateway.
            </p>
            
            <div className="space-y-4 text-sm text-slate-300 bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-inner">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black shrink-0 shadow-inner">1</div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Remit to GCash Node</p>
                  <p className="text-xl font-black text-emerald-400 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">0977 481 2075</p>
                </div>
              </div>
              <div className="border-t border-white/5 my-2"></div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black shrink-0 shadow-inner">2</div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Verify Authorization</p>
                  <p className="font-light">Forward the transaction receipt to <strong className="text-blue-400 font-bold ml-1">Mark Daluson (Facebook)</strong> for manual override.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setPaymentModalOpen(false)}
              className="btn-primary w-full justify-center mt-8 py-3.5 bg-amber-600 hover:bg-amber-500 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]"
            >
              Acknowledge Directive
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
