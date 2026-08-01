'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  LayoutDashboard, Plus, LogOut, Search, FolderKanban,
  ShieldCheck, Eye, EyeOff, AlertTriangle,
} from 'lucide-react'
import type { Project } from '../../lib/types'
import {
  loadProjects, addProject, updateProject, deleteProject,
  checkAdminPassword, setAdminSession, clearAdminSession, isAdminAuthenticated,
} from '../../lib/store'
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

// ─── Login ───────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw]         = useState('')
  const [show, setShow]     = useState(false)
  const [error, setError]   = useState('')
  const [shake, setShake]   = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (checkAdminPassword(pw)) {
      setAdminSession()
      onLogin()
    } else {
      setError('Incorrect password. Please try again.')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-[#0f0f1a] to-indigo-950">
      {/* Gradient blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className={`glass-card w-full max-w-sm p-8 shadow-2xl z-10 animate-fade-in ${shake ? 'animate-[shake_0.3s_ease]' : ''}`}>
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
            <ShieldCheck size={30} className="text-white" />
          </div>
        </div>

        <h1 className="text-xl font-bold text-slate-100 text-center mb-1">Admin Access</h1>
        <p className="text-sm text-slate-400 text-center mb-6">Enter your password to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text" htmlFor="admin-password">Password</label>
            <div className="relative">
              <input
                id="admin-password"
                type={show ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="Enter admin password"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError('') }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40">
              <AlertTriangle size={13} />
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full justify-center py-2.5" id="login-submit">
            Sign In
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-5">
          Default password: <code className="text-slate-500 font-mono">admin123</code>
        </p>
      </div>
    </div>
  )
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed]         = useState(false)
  const [hydrated, setHydrated]     = useState(false)
  const [projects, setProjects]     = useState<Project[]>([])
  const [search, setSearch]         = useState('')
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  useEffect(() => {
    setAuthed(isAdminAuthenticated())
    setHydrated(true)
  }, [])

  const refresh = useCallback(() => setProjects(loadProjects()), [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const handleLogin  = () => { setAuthed(true) }
  const handleLogout = () => { clearAdminSession(); setAuthed(false); setProjects([]) }

  const handleSave = (data: Omit<Project, 'id' | 'shareToken' | 'createdAt'>) => {
    if (editing) {
      updateProject(editing.id, data)
    } else {
      addProject(data)
    }
    setShowForm(false)
    setEditing(null)
    refresh()
  }

  const handleEdit = (p: Project) => { setEditing(p); setShowForm(true) }

  const confirmDelete = (id: string) => setDeleteTarget(id)
  const handleDeleteConfirmed = () => {
    if (deleteTarget) { deleteProject(deleteTarget); setDeleteTarget(null); refresh() }
  }

  if (!hydrated) return null // avoid hydration mismatch
  if (!authed)   return <LoginScreen onLogin={handleLogin} />

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
            <button onClick={handleLogout} className="btn-secondary py-1.5 px-3 text-xs" id="logout-btn">
              <LogOut size={13} />
              Logout
            </button>
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

        {/* Project grid */}
        {filtered.length === 0 ? (
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
