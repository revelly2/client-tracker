export type PaymentStatus = 'none' | 'paid' | 'partial'
export type ProjectStatus = 'Active' | 'On Hold' | 'Completed' | 'Reviewing'

export interface FileEntry {
  label: string   // display name shown to client
  url: string     // link to file (Google Drive, Dropbox, etc.)
}

export interface Project {
  id: string
  shareToken: string
  name: string
  clientName: string
  cost: number
  paymentStatus: PaymentStatus
  progress: number        // 0–100
  status: ProjectStatus
  notes: string
  createdAt: string       // ISO date string
  projectLink?: string    // live demo / GitHub / deployment URL
  fileLinks?: FileEntry[] // file repository entries
  imageLinks?: string[]   // image URLs (screenshots, mockups, etc.)
}
