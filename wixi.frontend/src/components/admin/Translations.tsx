import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import TranslationService from '@/ApiServices/services/TranslationService'
import { useToast } from '@/hooks/use-toast'
import { BASE_URL } from '@/ApiServices/config/api.config'
import { TokenService } from '@/ApiServices/services/TokenService'

interface Row {
  id?: number
  key: string
  de?: string
  tr?: string
  en?: string
  ar?: string
}

const Translations: React.FC = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [hasMore, setHasMore] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [activeTab, setActiveTab] = useState<'list'|'tree'>('list')

  const load = async () => {
    try {
      setLoading(true)
      const items = await TranslationService.list(search, page, pageSize)
      // Ensure items is an array
      const itemsArray = Array.isArray(items) ? items : []
      setRows(itemsArray.map((item: any) => ({
        id: item.id || item.Id,
        key: item.key || item.Key || '',
        de: item.de || item.De || '',
        tr: item.tr || item.Tr || '',
        en: item.en || item.En || '',
        ar: item.ar || item.Ar || ''
      })))
      setHasMore(itemsArray.length === pageSize)
    } catch (e) {
      console.error('Error loading translations:', e)
      toast({ variant: 'destructive', title: 'Hata', description: 'Çeviriler yüklenemedi' })
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page, pageSize])

  const handleChange = (index: number, field: keyof Row, value: string) => {
    setRows(prev => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
  }

  const addRow = () => setRows(prev => [{ key: '', de: '', tr: '', en: '', ar: '' }, ...prev])

  const saveRow = async (row: Row) => {
    if (!row.key) { toast({ variant: 'destructive', title: 'Hata', description: 'Key boş olamaz' }); return }
    try {
      await TranslationService.upsert({ key: row.key, de: row.de, tr: row.tr, en: row.en, ar: row.ar })
      toast({ title: 'Kaydedildi', description: row.key })
      await TranslationService.invalidate()
      load()
    } catch (e) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Kayıt başarısız' })
    }
  }

  const exportJson = () => {
    const items = rows.map(r => ({ key: r.key, De: r.de || '', Tr: r.tr || '', En: r.en || undefined, Ar: r.ar || undefined }))
    const blob = new Blob([JSON.stringify({ items }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'translations-bulk.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => fileRef.current?.click()

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const text = await f.text()
      const json = JSON.parse(text)
      const items: Array<{ key: string; De?: string; Tr?: string; En?: string; Ar?: string }> = json.items || []
      if (!items.length) { toast({ variant: 'destructive', title: 'Hata', description: 'Geçersiz dosya' }); return }
      const token = await TokenService.getInstance().getToken()
      const resp = await fetch(`${BASE_URL}/api/v1.0/admin/translations/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ items })
      })
      if (!resp.ok) throw new Error('Import failed')
      toast({ title: 'İçe aktarıldı', description: `${items.length} kayıt işlendi` })
      await TranslationService.invalidate()
      load()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Hata', description: 'İçe aktarma başarısız' })
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-4 flex gap-2 border-b">
        <button
          className={`px-3 py-2 text-sm font-medium border-b-2 ${activeTab==='list' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500'}`}
          onClick={() => setActiveTab('list')}
        >Liste</button>
        <button
          className={`px-3 py-2 text-sm font-medium border-b-2 ${activeTab==='tree' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500'}`}
          onClick={() => setActiveTab('tree')}
        >Ağaç</button>
      </div>
      {activeTab==='list' && (
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <Input placeholder="Ara (key)" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs h-10 border border-gray-300 dark:border-gray-600" />
        <Button onClick={() => { setPage(1); load() }} disabled={loading}>Ara</Button>
        <Button variant="outline" onClick={addRow}>Yeni</Button>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={exportJson}>Dışa Aktar (JSON)</Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
          <Button onClick={handleImportClick}>İçe Aktar (JSON)</Button>
        </div>
      </div>
      )}

      {activeTab==='list' && (
      <Card className="p-0 overflow-auto max-h-[70vh]">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-white dark:bg-gray-900 z-10">
            <tr className="text-left border-b">
              <th className="p-2 w-64">Key</th>
              <th className="p-2">DE</th>
              <th className="p-2">TR</th>
              <th className="p-2">EN</th>
              <th className="p-2">AR</th>
              <th className="p-2 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="p-2 align-top"><Input className="h-10 border border-gray-300 dark:border-gray-600" value={r.key} onChange={(e) => handleChange(i, 'key', e.target.value)} /></td>
                <td className="p-2 align-top"><Input className="h-10 border border-gray-300 dark:border-gray-600" value={r.de || ''} onChange={(e) => handleChange(i, 'de', e.target.value)} /></td>
                <td className="p-2 align-top"><Input className="h-10 border border-gray-300 dark:border-gray-600" value={r.tr || ''} onChange={(e) => handleChange(i, 'tr', e.target.value)} /></td>
                <td className="p-2 align-top"><Input className="h-10 border border-gray-300 dark:border-gray-600" value={r.en || ''} onChange={(e) => handleChange(i, 'en', e.target.value)} /></td>
                <td className="p-2 align-top"><Input dir="rtl" className="h-10 border border-gray-300 dark:border-gray-600 text-right" value={r.ar || ''} onChange={(e) => handleChange(i, 'ar', e.target.value)} /></td>
                <td className="p-2 align-top"><Button size="sm" onClick={() => saveRow(r)}>Kaydet</Button></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="p-4 text-muted-foreground" colSpan={6}>Kayıt yok</td></tr>
            )}
          </tbody>
        </table>
      </Card>
      )}

      {activeTab==='tree' && (
        <Card className="p-4">
          <TreeView rows={rows} />
        </Card>
      )}
      {activeTab==='list' && (
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2 text-sm">
          <span>Sayfa boyutu:</span>
          <select
            className="h-9 px-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent"
            value={pageSize}
            onChange={(e) => { setPage(1); setPageSize(parseInt(e.target.value)); }}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={loading || page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Önceki</Button>
          <span className="text-sm">Sayfa {page}</span>
          <Button variant="outline" disabled={loading || !hasMore} onClick={() => setPage(p => p + 1)}>Sonraki</Button>
        </div>
      </div>
      )}
    </div>
  )
}

// Simple tree view grouped by key prefixes
function TreeView({ rows }: { rows: Array<{ key: string; de?: string; tr?: string; en?: string; ar?: string }> }) {
  // group by prefix: use first two segments for 'admin.*', else first segment
  const groups: Record<string, Array<typeof rows[number]>> = {}
  rows.forEach(r => {
    const parts = r.key.split('.')
    const groupKey = parts[0] === 'admin' ? parts.slice(0, 2).join('.') : parts[0]
    if (!groups[groupKey]) groups[groupKey] = []
    groups[groupKey].push(r)
  })
  const groupKeys = Object.keys(groups).sort()
  return (
    <div className="space-y-3">
      {groupKeys.map(g => (
        <details key={g} className="rounded-md border border-gray-200 dark:border-gray-700">
          <summary className="cursor-pointer select-none px-3 py-2 font-medium text-sm">{g} <span className="text-xs text-gray-500">({groups[g].length})</span></summary>
          <div className="px-3 pb-3">
            <ul className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              {groups[g]
                .sort((a,b)=>a.key.localeCompare(b.key))
                .map(item => (
                  <li key={item.key} className="py-2 flex items-center justify-between gap-4">
                    <span className="text-gray-600 dark:text-gray-300">{item.key}</span>
                    <span className="truncate text-gray-500 dark:text-gray-400 max-w-[45%]" title={item.tr || item.de || item.en || ''}>
                      {(item.tr || item.de || item.en || '').slice(0, 80)}
                    </span>
                  </li>
              ))}
            </ul>
          </div>
        </details>
      ))}
      {groupKeys.length === 0 && (
        <div className="text-sm text-muted-foreground">Kayıt yok</div>
      )}
    </div>
  )
}

export default Translations


