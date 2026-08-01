'use server'

import { createClient } from 'redis'
import { v4 as uuidv4 } from 'uuid'
import type { Project } from './types'

const PROJECTS_KEY = 'cpt_projects'
const SHARE_TOKENS_KEY = 'cpt_share_tokens'

let redisClient: ReturnType<typeof createClient>

async function getClient() {
  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL })
    redisClient.on('error', err => console.error('Redis Client Error', err))
  }
  if (!redisClient.isOpen) {
    await redisClient.connect()
  }
  return redisClient
}

export async function getProjects(): Promise<Project[]> {
  try {
    const client = await getClient()
    const projectsMap = await client.hGetAll(PROJECTS_KEY)
    
    if (!projectsMap || Object.keys(projectsMap).length === 0) return []
    
    const projects = Object.values(projectsMap).map(p => JSON.parse(p) as Project)
    
    return projects.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch (err) {
    console.error('Failed to get projects:', err)
    return []
  }
}

export async function getProjectByToken(token: string): Promise<Project | null> {
  try {
    const client = await getClient()
    const projectId = await client.hGet(SHARE_TOKENS_KEY, token)
    if (!projectId) return null
    
    const projectStr = await client.hGet(PROJECTS_KEY, projectId)
    return projectStr ? JSON.parse(projectStr) : null
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
  
  const client = await getClient()
  await Promise.all([
    client.hSet(PROJECTS_KEY, newProject.id, JSON.stringify(newProject)),
    client.hSet(SHARE_TOKENS_KEY, newProject.shareToken, newProject.id)
  ])
  
  return newProject
}

export async function updateProject(id: string, data: Partial<Omit<Project, 'id' | 'shareToken' | 'createdAt'>>): Promise<Project | null> {
  const client = await getClient()
  const projectStr = await client.hGet(PROJECTS_KEY, id)
  if (!projectStr) return null

  const project: Project = JSON.parse(projectStr)
  const updatedProject = { ...project, ...data }
  
  await client.hSet(PROJECTS_KEY, id, JSON.stringify(updatedProject))
  
  return updatedProject
}

export async function deleteProject(id: string): Promise<boolean> {
  const client = await getClient()
  const projectStr = await client.hGet(PROJECTS_KEY, id)
  if (!projectStr) return false

  const project: Project = JSON.parse(projectStr)

  await Promise.all([
    client.hDel(PROJECTS_KEY, id),
    client.hDel(SHARE_TOKENS_KEY, project.shareToken)
  ])
  
  return true
}
