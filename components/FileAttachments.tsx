import { ExternalLink, FileText, FileImage, FileVideo, FileArchive, File } from 'lucide-react'
import type { FileEntry } from '../lib/types'

// ── Source detection ────────────────────────────────────────────────────────

type FileSource = 'gdrive' | 'dropbox' | 'onedrive' | 'github' | 'notion' | 'figma' | 'generic'

function detectSource(url: string): FileSource {
  try {
    const host = new URL(url).hostname.replace('www.', '')
    if (host.includes('drive.google.com') || host.includes('docs.google.com')) return 'gdrive'
    if (host.includes('dropbox.com'))   return 'dropbox'
    if (host.includes('onedrive.live.com') || host.includes('sharepoint.com')) return 'onedrive'
    if (host.includes('github.com') || host.includes('raw.githubusercontent.com')) return 'github'
    if (host.includes('notion.so'))     return 'notion'
    if (host.includes('figma.com'))     return 'figma'
  } catch { /* ignore invalid urls */ }
  return 'generic'
}

// ── Extension-based file type icons ─────────────────────────────────────────

function getFileIcon(url: string) {
  const lower = url.toLowerCase()
  if (/\.(jpg|jpeg|png|gif|webp|svg|avif)/.test(lower)) return FileImage
  if (/\.(mp4|mov|avi|mkv|webm)/.test(lower))           return FileVideo
  if (/\.(zip|rar|tar|gz|7z)/.test(lower))               return FileArchive
  if (/\.(pdf|doc|docx|txt|md|xlsx|csv|pptx)/.test(lower)) return FileText
  return File
}

// ── Source metadata ──────────────────────────────────────────────────────────

const SOURCE_CONFIG: Record<FileSource, { label: string; bg: string; border: string; text: string; badge: string }> = {
  gdrive:   { label: 'Google Drive', bg: 'bg-blue-950/40',   border: 'border-blue-700/40',   text: 'text-blue-300',   badge: 'bg-blue-500'   },
  dropbox:  { label: 'Dropbox',      bg: 'bg-sky-950/40',    border: 'border-sky-700/40',    text: 'text-sky-300',    badge: 'bg-sky-500'    },
  onedrive: { label: 'OneDrive',     bg: 'bg-cyan-950/40',   border: 'border-cyan-700/40',   text: 'text-cyan-300',   badge: 'bg-cyan-500'   },
  github:   { label: 'GitHub',       bg: 'bg-slate-800/60',  border: 'border-slate-600/40',  text: 'text-slate-200',  badge: 'bg-slate-500'  },
  notion:   { label: 'Notion',       bg: 'bg-stone-900/60',  border: 'border-stone-600/40',  text: 'text-stone-200',  badge: 'bg-stone-500'  },
  figma:    { label: 'Figma',        bg: 'bg-purple-950/40', border: 'border-purple-700/40', text: 'text-purple-300', badge: 'bg-purple-500' },
  generic:  { label: 'File',         bg: 'bg-amber-950/30',  border: 'border-amber-800/30',  text: 'text-amber-300',  badge: 'bg-amber-500'  },
}

// ── Source SVG logos (inline, no extra deps) ─────────────────────────────────

function SourceLogo({ source }: { source: FileSource }) {
  const size = 'w-4 h-4 shrink-0'

  if (source === 'gdrive') return (
    <svg className={size} viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L28 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
      <path d="M43.65 25L29.35 0c-1.35.8-2.5 1.9-3.3 3.3l-25.8 44.7A9.06 9.06 0 000 53h28z" fill="#00ac47"/>
      <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 57.5a9.06 9.06 0 000-9L58.3 3.3C57.5 1.9 56.35.8 55 0L40.7 25l22.95 39.75z" fill="#ea4335"/>
      <path d="M43.65 25L57.95 0c-1.35-.8-2.85-1.2-4.4-1.2H33.75c-1.55 0-3.05.45-4.4 1.2z" fill="#00832d"/>
      <path d="M59.3 53H28L13.8 76.8c1.35.8 2.85 1.2 4.4 1.2h50.1c1.55 0 3.05-.4 4.4-1.2z" fill="#2684fc"/>
      <path d="M73.4 26.5l-12.9-22.35C59.7 2.75 58.55 1.65 57.2.85L43 25l16.3 28.2 28.1-.1a9.06 9.06 0 000-9z" fill="#ffba00"/>
    </svg>
  )

  if (source === 'dropbox') return (
    <svg className={size} viewBox="0 0 43 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.6 0L0 8.08l8.68 7 13.05-7.96L12.6 0zM0 22.16l12.6 8.08 9.13-7.12L8.68 15.1 0 22.16zM21.73 23.12l9.13 7.12 12.6-8.08-8.68-7.02-13.05 7.98zM43.46 8.08L30.86 0l-9.13 7.12 13.05 7.96L43.46 8.08zM21.73 24.99L12.6 32.07l-3.92-2.5v2.8l13.05 7.64 13.05-7.64v-2.8l-3.92 2.5-9.13-7.08z" fill="#0061ff"/>
    </svg>
  )

  if (source === 'github') return (
    <svg className={size} viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M49 0C22 0 0 22 0 49c0 21.6 14 40 33.4 46.5 2.4.5 3.3-1 3.3-2.3v-8.1C23 87.7 20.1 79 20.1 79c-2.3-5.7-5.5-7.2-5.5-7.2-4.5-3 .3-3 .3-3 5 .3 7.6 5 7.6 5 4.4 7.6 11.6 5.4 14.4 4.1.5-3.2 1.7-5.4 3.1-6.7-11-1.3-22.6-5.5-22.6-24.5 0-5.4 1.9-9.8 5.1-13.3-.5-1.3-2.2-6.3.5-13 0 0 4.1-1.3 13.5 5 3.9-1.1 8.1-1.6 12.3-1.6 4.2 0 8.4.5 12.3 1.6 9.4-6.4 13.5-5 13.5-5 2.7 6.8 1 11.8.5 13 3.2 3.5 5.1 7.9 5.1 13.3 0 19-11.6 23.2-22.7 24.4 1.8 1.5 3.4 4.6 3.4 9.3v13.8c0 1.3.9 2.8 3.4 2.3C84 89 98 70.6 98 49 98 22 76 0 49 0z" fill="#c9d1d9"/>
    </svg>
  )

  if (source === 'figma') return (
    <svg className={size} viewBox="0 0 38 57" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1abcfe"/>
      <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0acf83"/>
      <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#ff7262"/>
      <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#f24e1e"/>
      <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#a259ff"/>
    </svg>
  )

  // Fallback: generic icon from lucide
  const Icon = getFileIcon('')
  return <Icon size={16} className="text-amber-400 shrink-0" />
}

// ── Main component ────────────────────────────────────────────────────────────

interface FileAttachmentsProps {
  files: FileEntry[]
  compact?: boolean   // compact = pill chips (admin card), full = row cards (public view)
}

export default function FileAttachments({ files, compact = false }: FileAttachmentsProps) {
  if (!files || files.length === 0) return null

  if (compact) {
    // ── Chip row for admin card ──────────────────────────────────────────────
    return (
      <div className="flex flex-wrap gap-1.5">
        {files.map((f, i) => {
          const source = detectSource(f.url)
          const cfg    = SOURCE_CONFIG[source]
          const Icon   = getFileIcon(f.url)
          return (
            <a
              key={i}
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`${f.label || 'File'} — ${cfg.label}`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${cfg.bg} ${cfg.border} ${cfg.text} hover:brightness-125 transition-all`}
            >
              <SourceLogo source={source} />
              <span className="truncate max-w-[120px]">{f.label || `File ${i + 1}`}</span>
              <ExternalLink size={10} className="opacity-50 shrink-0" />
            </a>
          )
        })}
      </div>
    )
  }

  // ── Full row cards for public view ───────────────────────────────────────
  return (
    <div className="space-y-2">
      {files.map((f, i) => {
        const source = detectSource(f.url)
        const cfg    = SOURCE_CONFIG[source]
        const Icon   = getFileIcon(f.url)
        return (
          <a
            key={i}
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${cfg.bg} ${cfg.border} hover:brightness-110 transition-all group`}
          >
            {/* Source logo */}
            <div className="w-9 h-9 rounded-lg bg-black/20 flex items-center justify-center shrink-0">
              <SourceLogo source={source} />
            </div>

            {/* Label + source tag */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${cfg.text} group-hover:brightness-125 truncate transition-all`}>
                {f.label || `File ${i + 1}`}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {/* Colored dot indicating source */}
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.badge}`} />
                <span className="text-xs text-slate-500">{cfg.label}</span>
              </div>
            </div>

            {/* File type icon + open indicator */}
            <div className="flex items-center gap-2 shrink-0">
              <Icon size={14} className="text-slate-600" />
              <ExternalLink size={13} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
            </div>
          </a>
        )
      })}
    </div>
  )
}
