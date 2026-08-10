import { useEffect, useState } from 'react'
import { Bookmark, Download, Folder, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import type { Bookmark as BookmarkType } from '../lib/types'
import TenderCard from '../components/TenderCard'

export default function BookmarksPage() {
  const { session } = useAuth()
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])
  const [folders, setFolders] = useState<Set<string>>(new Set(['Saved']))
  const [activeFolder, setActiveFolder] = useState('Saved')
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!session) return
    supabase
      .from('bookmarks')
      .select('*, tender:tenders(*, category:categories(*))')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const b = (data as BookmarkType[]) ?? []
        setBookmarks(b)
        setFolders(new Set(b.map((x) => x.folder)))
        setLoading(false)
      })
  }

  useEffect(load, [session])

  const filtered = bookmarks.filter((b) => b.folder === activeFolder)

  const removeBookmark = async (id: string) => {
    if (!session) return
    await supabase.from('bookmarks').delete().eq('id', id)
    load()
  }

  const exportCsv = () => {
    const rows = [['Title', 'Organization', 'Budget', 'State', 'Closing Date', 'Link']]
    filtered.forEach((b) => {
      if (b.tender) rows.push([
        b.tender.title,
        b.tender.organization ?? '',
        String(b.tender.budget ?? ''),
        b.tender.state ?? '',
        b.tender.closing_date ?? '',
        `${window.location.origin}/tenders/${b.tender_id}`,
      ])
    })
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tenderpulse-bookmarks-${activeFolder}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Bookmarks</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Organize and export your saved tenders</p>
        </div>
        {filtered.length > 0 && (
          <button onClick={exportCsv} className="btn-secondary text-xs">
            <Download size={14} /> Export CSV
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from(folders).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFolder(f)}
            className={`badge px-3 py-1.5 ${activeFolder === f ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
          >
            <Folder size={12} /> {f} ({bookmarks.filter((b) => b.folder === f).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <Bookmark className="mb-3 text-slate-300 dark:text-slate-700" size={40} />
          <h3 className="font-semibold text-slate-900 dark:text-white">No saved tenders in this folder</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Save tenders by clicking the bookmark icon</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <div key={b.id} className="relative">
              <TenderCard tender={b.tender!} bookmarked onBookmarkChange={() => load()} />
              <button
                onClick={() => removeBookmark(b.id)}
                className="absolute right-3 top-3 z-10 rounded-lg bg-white/90 p-1.5 text-rose-500 shadow-sm transition-colors hover:bg-rose-50 dark:bg-slate-900/90"
                aria-label="Remove bookmark"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
