import { v4 as uuidv4 } from 'uuid'
import type { Project } from './types'
import seedData from '../data/projects.json'

const STORAGE_KEY = 'cpt_projects'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/** Load all projects from localStorage, seeding from JSON on first visit */
export function loadProjects(): Project[] {
  if (!isBrowser()) return seedData as Project[]

  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      return JSON.parse(raw) as Project[]
    } catch {
      // corrupted — reset
    }
  }
  // First visit: seed from JSON
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData))
  return seedData as Project[]
}

/** Persist the full project list */
export function saveProjects(projects: Project[]): void {
  if (!isBrowser()) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

/** Get a single project by its public shareToken */
export function getProjectByToken(token: string): Project | null {
  return loadProjects().find((p) => p.shareToken === token) ?? null
}

/** Add a new project */
export function addProject(data: Omit<Project, 'id' | 'shareToken' | 'createdAt'>): Project {
  const projects = loadProjects()
  const newProject: Project = {
    ...data,
    id: `proj-${uuidv4().slice(0, 8)}`,
    shareToken: `share-${uuidv4()}`,
    createdAt: new Date().toISOString(),
  }
  saveProjects([newProject, ...projects])
  return newProject
}

/** Update an existing project by ID */
export function updateProject(id: string, data: Partial<Omit<Project, 'id' | 'shareToken' | 'createdAt'>>): Project | null {
  const projects = loadProjects()
  const idx = projects.findIndex((p) => p.id === id)
  if (idx === -1) return null
  projects[idx] = { ...projects[idx], ...data }
  saveProjects(projects)
  return projects[idx]
}

/** Delete a project by ID */
export function deleteProject(id: string): boolean {
  const projects = loadProjects()
  const filtered = projects.filter((p) => p.id !== id)
  if (filtered.length === projects.length) return false
  saveProjects(filtered)
  return true
}

/** Simple admin auth helpers (sessionStorage) */
const AUTH_KEY = 'cpt_admin_auth'
const ADMIN_PASSWORD = 'admin123'

export function checkAdminPassword(pw: string): boolean {
  return pw === ADMIN_PASSWORD
}

export function setAdminSession(): void {
  if (isBrowser()) sessionStorage.setItem(AUTH_KEY, '1')
}

export function clearAdminSession(): void {
  if (isBrowser()) sessionStorage.removeItem(AUTH_KEY)
}

export function isAdminAuthenticated(): boolean {
  if (!isBrowser()) return false
  return sessionStorage.getItem(AUTH_KEY) === '1'
}
