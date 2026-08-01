'use server'

import { kv } from '@vercel/kv'
import { v4 as uuidv4 } from 'uuid'
import type { Project } from './types'

const PROJECTS_KEY = 'cpt_projects'
const SHARE_TOKENS_KEY = 'cpt_share_tokens' // Maps token to project ID

export async function getProjects(): Promise<Project[]> {
  try {
    const projectsMap = await kv.hgetall<Record<string, Project>>(PROJECTS_KEY)
    if (!projectsMap) return []
    // Sort by createdAt descending
    return Object.values(projectsMap).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch (err) {
    console.error('Failed to get projects:', err)
    return []
  }
}

export async function getProjectByToken(token: string): Promise<Project | null> {
  try {
    const projectId = await kv.hget<string>(SHARE_TOKENS_KEY, token)
    if (!projectId) return null
    
    const project = await kv.hget<Project>(PROJECTS_KEY, projectId)
    return project || null
  } catch (err) {
    console.error('Failed to get project by token:', err)
    return null
  }
}

export async function addProject(data: Omit<Project, 'id' | 'shareToken' | 'createdAt'>): Promise<Project> {
  const newProject: Project = {
    ...data,
    id: `proj-${uuidv4().slice(0, 8)}`,
    shareToken: `share-${uuidv4()}`,
    createdAt: new Date().toISOString(),
  }
  
  await Promise.all([
    kv.hset(PROJECTS_KEY, { [newProject.id]: newProject }),
    kv.hset(SHARE_TOKENS_KEY, { [newProject.shareToken]: newProject.id })
  ])
  
  return newProject
}

export async function updateProject(id: string, data: Partial<Omit<Project, 'id' | 'shareToken' | 'createdAt'>>): Promise<Project | null> {
  const project = await kv.hget<Project>(PROJECTS_KEY, id)
  if (!project) return null

  const updatedProject = { ...project, ...data }
  await kv.hset(PROJECTS_KEY, { [id]: updatedProject })
  
  return updatedProject
}

export async function deleteProject(id: string): Promise<boolean> {
  const project = await kv.hget<Project>(PROJECTS_KEY, id)
  if (!project) return false

  await Promise.all([
    kv.hdel(PROJECTS_KEY, id),
    kv.hdel(SHARE_TOKENS_KEY, project.shareToken)
  ])
  
  return true
}
