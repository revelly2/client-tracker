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
function StatCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent: string
}) {
  return (
    <div className={`glass-card p-4 flex flex-col gap-1 border-l-4 ${accent}`}>
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-extrabold text-slate-100">{value}</span>
      {sub && <span className="text-xs text-slate-500">{sub}</span>}
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
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Gradient blobs */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <FolderKanban size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 leading-none">Project Tracker</h1>
              <p className="text-xs text-slate-500 leading-none mt-0.5">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Admin
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 relative">
        {/* Page title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard size={18} className="text-indigo-400" />
              <h2 className="text-xl font-bold text-slate-100">All Projects</h2>
            </div>
            <p className="text-sm text-slate-500">Manage client projects and share progress links.</p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="btn-primary"
            id="add-project-btn"
          >
            <Plus size={16} />
            Add Project
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Projects" value={total}   accent="border-indigo-500" sub={`${filtered.length} shown`} />
          <StatCard label="Active"         value={active}  accent="border-blue-500"   sub="in progress" />
          <StatCard label="Completed"      value={completed} accent="border-emerald-500" sub="delivered" />
          <StatCard label="Total Revenue"  value={`₱${revenue.toLocaleString('en-PH')}`} accent="border-purple-500" sub="across all projects" />
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="search-input"
            type="text"
            className="input-field pl-9"
            placeholder="Search projects or clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Project grid or loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 size={40} className="animate-spin mb-4 text-indigo-500" />
            <p>Loading projects...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FolderKanban size={40} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No projects found</p>
            <p className="text-sm text-slate-600 mt-1">
              {search ? 'Try a different search term.' : 'Click "Add Project" to get started.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay bg-black/60">
          <div className="glass-card w-full max-w-sm p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/40 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Delete Project</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-5">
              Are you sure you want to delete this project? The share link will also stop working.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1 justify-center" id="cancel-delete-btn">
                Cancel
              </button>
              <button onClick={handleDeleteConfirmed} className="flex-1 btn-primary justify-center bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-900/30" id="confirm-delete-btn">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
