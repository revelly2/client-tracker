'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  LayoutDashboard, Plus, Search, FolderKanban, AlertTriangle, Loader2
} from 'lucide-react'
import type { Project } from '../../lib/types'
import {
  getProjects, addProject, updateProject, deleteProject,
} from '../../lib/actions'
import ProjectCard from '../../components/ProjectCard'
import ProjectForm from '../../components/ProjectForm'

// ─── Stats ───────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accentClass }: {
  label: string; value: string | number; sub?: string; accentClass: string
}) {
  return (
    <div className={`glass-card p-6 flex flex-col gap-1 relative overflow-hidden group hover:border-blue-500/30 transition-colors`}>
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${accentClass}`}></div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest z-10">{label}</span>
      <span className="text-3xl font-black text-white tracking-tight z-10">{value}</span>
      {sub && <span className="text-xs text-slate-400 font-light mt-1 z-10">{sub}</span>}
    </div>
  )
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [loading, setLoading]       = useState(true)
  const [projects, setProjects]     = useState<Project[]>([])
  const [search, setSearch]         = useState('')
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const data = await getProjects()
    setProjects(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleSave = async (data: Omit<Project, 'id' | 'shareToken' | 'createdAt'>) => {
    if (editing) {
      await updateProject(editing.id, data)
    } else {
      await addProject(data)
    }
    setShowForm(false)
    setEditing(null)
    refresh()
  }

  const handleEdit = (p: Project) => { setEditing(p); setShowForm(true) }

  const confirmDelete = (id: string) => setDeleteTarget(id)
  const handleDeleteConfirmed = async () => {
    if (deleteTarget) {
      await deleteProject(deleteTarget)
      setDeleteTarget(null)
      refresh()
    }
  }

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase())
  )

  // Stats
  const total     = projects.length
  const active    = projects.filter((p) => p.status === 'Active').length
  const completed = projects.filter((p) => p.status === 'Completed').length
  const revenue   = projects.reduce((s, p) => s + p.cost, 0)

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient blobs */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-float"></div>

      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <FolderKanban size={20} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide leading-none">Client Tracker Matrix</h1>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest leading-none mt-1.5">Command Node</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Root Admin Active
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10 relative z-10">
        {/* Page title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/5 animate-entrance opacity-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <LayoutDashboard size={24} className="text-blue-500" />
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Active Deployments</h2>
            </div>
            <p className="text-sm text-slate-400 font-light">Manage client nodes and generate secure external access tokens.</p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="btn-primary self-start sm:self-auto"
            id="add-project-btn"
          >
            <Plus size={16} />
            Initialize Project
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-entrance opacity-0" style={{ animationDelay: '0.1s' }}>
          <StatCard label="Total Nodes" value={total}   accentClass="bg-blue-500" sub={`${filtered.length} currently indexed`} />
          <StatCard label="Active"         value={active}  accentClass="bg-green-500"   sub="in progress" />
          <StatCard label="Completed"      value={completed} accentClass="bg-emerald-500" sub="delivered" />
          <StatCard label="Total Revenue"  value={`₱${revenue.toLocaleString('en-PH')}`} accentClass="bg-purple-500" sub="across all nodes" />
        </div>

        {/* Search */}
        <div className="relative max-w-md animate-entrance opacity-0" style={{ animationDelay: '0.2s' }}>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="search-input"
            type="text"
            className="input-field pl-11 py-3.5 shadow-sm"
            placeholder="Search projects or clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Project grid or loading state */}
        <div className="animate-entrance opacity-0" style={{ animationDelay: '0.3s' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-500">
              <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
              <p className="font-mono text-xs tracking-widest uppercase">Syncing Nodes...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 glass-card border-dashed border-white/10 shadow-none">
              <div className="w-16 h-16 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center justify-center mx-auto mb-5 shadow-inner">
                <FolderKanban size={28} className="text-slate-600" />
              </div>
              <p className="text-white font-bold text-lg mb-1">No deployments found</p>
              <p className="text-sm text-slate-500 font-light max-w-sm mx-auto">
                {search ? 'Adjust search parameters to locate specific nodes.' : 'Initialize your first project to begin tracking.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  isAdmin
                  onEdit={handleEdit}
                  onDelete={confirmDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Project form modal */}
      {showForm && (
        <ProjectForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay bg-black/80">
          <div className="glass-card w-full max-w-sm p-8 shadow-2xl animate-entrance">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 mx-auto">
              <AlertTriangle size={24} className="text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">Purge Project?</h3>
            <p className="text-sm text-slate-400 text-center mb-8 font-light">
              This action is absolute. The sharing token will instantly expire and the repository link will be lost.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1 justify-center" id="cancel-delete-btn">
                Abort
              </button>
              <button onClick={handleDeleteConfirmed} className="flex-1 btn-primary bg-red-600 hover:bg-red-500 border-red-500 hover:border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] justify-center" id="confirm-delete-btn">
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
