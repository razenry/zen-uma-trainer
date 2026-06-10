'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Plus,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  History,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Save,
  Send,
  X,
  FileSpreadsheet,
  Info
} from 'lucide-react'
import { ENTITY_METADATA, FieldDescriptor } from '@/lib/cms-metadata'
import HelpTooltip from '@/components/shared/help-tooltip'
import { EmptyState, LoadingState, ErrorState } from '@/components/shared/ui-states'

export default function DynamicCMSPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const entity = params.entity as string

  const metadata = ENTITY_METADATA[entity]

  // States
  const [activeTab, setActiveTab] = useState<'list' | 'drafts' | 'create' | 'import' | 'history'>('list')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'ARCHIVED' | 'all'>('ACTIVE')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Form state
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [versionComment, setVersionComment] = useState('Manual updates')
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)

  // AI Entry State
  const [aiText, setAiText] = useState('')
  const [aiExtracting, setAiExtracting] = useState(false)

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvPreview, setCsvPreview] = useState<any[]>([])
  const [csvMessage, setCsvMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Version Comparison State
  const [selectedRecordIdForHistory, setSelectedRecordIdForHistory] = useState<string | null>(null)
  const [versionHistoryList, setVersionHistoryList] = useState<any[]>([])
  const [vCompare1, setVCompare1] = useState<string | null>(null)
  const [vCompare2, setVCompare2] = useState<string | null>(null)

  // Redirect if entity name is invalid
  useEffect(() => {
    if (!metadata) {
      router.push('/cms')
    }
  }, [entity, metadata, router])

  // Load auto-saved form draft from localStorage on mount/entity change
  useEffect(() => {
    if (entity) {
      const saved = localStorage.getItem(`draft_${entity}`)
      if (saved) {
        try {
          setFormData(JSON.parse(saved))
        } catch (e) {
          console.error(e)
        }
      } else {
        // Initialize default values
        const defaults: Record<string, any> = {}
        metadata?.fields.forEach(f => {
          if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue
        })
        setFormData(defaults)
      }
      // Reset page states
      setActiveTab('list')
      setSelectedIds([])
      setEditingRecordId(null)
      setCsvFile(null)
      setCsvPreview([])
      setCsvMessage(null)
      setSelectedRecordIdForHistory(null)
      setVersionHistoryList([])
    }
  }, [entity, metadata])

  // Auto-save form data to localStorage
  const handleFieldChange = (key: string, value: any) => {
    const updated = { ...formData, [key]: value }
    setFormData(updated)
    localStorage.setItem(`draft_${entity}`, JSON.stringify(updated))
  }

  // Clear auto-saved draft
  const clearDraft = () => {
    localStorage.removeItem(`draft_${entity}`)
    const defaults: Record<string, any> = {}
    metadata?.fields.forEach(f => {
      if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue
    })
    setFormData(defaults)
    setFormErrors({})
  }

  // Fetch Live Production Records
  const { data: liveData = { data: [], pagination: { total: 0, pages: 1 } }, isLoading: isLiveLoading, error: liveError, refetch: refetchLive } = useQuery({
    queryKey: ['liveRecords', entity, statusFilter, search, currentPage, sortBy, sortOrder],
    queryFn: async () => {
      const res = await fetch(`/api/cms/${entity}?status=${statusFilter}&search=${search}&page=${currentPage}&sortBy=${sortBy}&sortOrder=${sortOrder}`)
      if (!res.ok) throw new Error('Failed to fetch records')
      return res.json()
    },
    enabled: !!metadata
  })

  // Fetch Draft Records
  const { data: drafts = [], isLoading: isDraftsLoading, error: draftsError, refetch: refetchDrafts } = useQuery<any[]>({
    queryKey: ['draftRecords', entity],
    queryFn: async () => {
      const res = await fetch(`/api/cms/${entity}/drafts`)
      if (!res.ok) throw new Error('Failed to fetch drafts')
      return res.json()
    },
    enabled: !!metadata && !!metadata.draftModelName
  })

  // Mutations
  const createLiveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`/api/cms/${entity}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create record directly')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveRecords', entity] })
      clearDraft()
      setActiveTab('list')
    },
    onError: (err: any) => {
      setFormErrors({ _global: err.message })
    }
  })

  const updateLiveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`/api/cms/${entity}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update record')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveRecords', entity] })
      setEditingRecordId(null)
      setFormData({})
      setActiveTab('list')
    },
    onError: (err: any) => {
      setFormErrors({ _global: err.message })
    }
  })

  const deleteLiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cms/${entity}?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveRecords', entity] })
      setSelectedIds([])
    }
  })

  const restoreLiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cms/${entity}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (!res.ok) throw new Error('Failed to restore')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveRecords', entity] })
      setSelectedIds([])
    }
  })

  const createDraftMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`/api/cms/${entity}/drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create draft')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draftRecords', entity] })
      clearDraft()
      setActiveTab('drafts')
    },
    onError: (err: any) => {
      setFormErrors({ _global: err.message })
    }
  })

  const approveDraftMutation = useMutation({
    mutationFn: async ({ id, status, reviewNotes }: { id: string; status: string; reviewNotes?: string }) => {
      const res = await fetch(`/api/cms/${entity}/drafts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, reviewNotes })
      })
      if (!res.ok) throw new Error('Failed to change draft status')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draftRecords', entity] })
      queryClient.invalidateQueries({ queryKey: ['liveRecords', entity] })
    }
  })

  const bulkMutation = useMutation({
    mutationFn: async (payload: { ids: string[]; action: 'archive' | 'restore' | 'publish' }) => {
      const res = await fetch(`/api/cms/${entity}/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Bulk operation failed')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveRecords', entity] })
      queryClient.invalidateQueries({ queryKey: ['draftRecords', entity] })
      setSelectedIds([])
    }
  })

  // AI Extraction Parser Call
  const handleAIExtract = async () => {
    if (!aiText) return
    setAiExtracting(true)
    try {
      const res = await fetch('/api/cms/ai-assisted-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiText, entityType: metadata.auditName })
      })
      if (res.ok) {
        const data = await res.json()
        const ext = data.extractedData
        if (ext) {
          const newFormData = { ...formData }
          metadata.fields.forEach(f => {
            if (ext[f.key] !== undefined) {
              newFormData[f.key] = ext[f.key]
              localStorage.setItem(`draft_${entity}`, JSON.stringify(newFormData))
            }
          })
          setFormData(newFormData)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setAiExtracting(false)
    }
  }

  // Form submit handler
  const handleFormSubmit = (e: React.FormEvent, submitAsDraft: boolean) => {
    e.preventDefault()
    setFormErrors({})

    // Validation
    const errors: Record<string, string> = {}
    metadata.fields.forEach(f => {
      if (f.required && !formData[f.key]) {
        errors[f.key] = `${f.label} is required.`
      }
    })

    // Validate JSON textareas
    metadata.fields.forEach(f => {
      if (f.type === 'textarea' && (f.key === 'effects' || f.key === 'events' || f.key === 'skills')) {
        const val = formData[f.key]
        if (val) {
          try {
            if (typeof val === 'string') JSON.parse(val)
          } catch (e) {
            errors[f.key] = 'Invalid JSON structure.'
          }
        }
      }
    })

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const payload = { ...formData }

    if (editingRecordId) {
      // Direct live edit update
      updateLiveMutation.mutate({ ...payload, id: editingRecordId, versionComment })
    } else {
      if (submitAsDraft && metadata.draftModelName) {
        createDraftMutation.mutate(payload)
      } else {
        createLiveMutation.mutate(payload)
      }
    }
  }

  // Edit live item trigger
  const handleEditClick = (record: any) => {
    setEditingRecordId(record.id)
    const formVals: Record<string, any> = {}
    metadata.fields.forEach(f => {
      formVals[f.key] = record[f.key] !== null ? record[f.key] : ''
    })
    setFormData(formVals)
    setVersionComment(`Updated record ${record.name || record.title || record.id}`)
    setActiveTab('create')
  }

  // Bulk Operations Handlers
  const handleBulkSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (records: any[]) => {
    if (selectedIds.length === records.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(records.map(r => r.id))
    }
  }

  const triggerBulkAction = (action: 'archive' | 'restore' | 'publish') => {
    if (confirm(`Are you sure you want to ${action} ${selectedIds.length} items?`)) {
      bulkMutation.mutate({ ids: selectedIds, action })
    }
  }

  // Client-side CSV Parsing & Template Download
  const downloadCSVTemplate = () => {
    const headers = metadata.fields.map(f => f.key).join(',')
    const dummyData = metadata.fields.map(f => {
      if (f.defaultValue !== undefined) return `"${f.defaultValue}"`
      if (f.type === 'number') return 0
      return `""`
    }).join(',')

    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${dummyData}`
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${entity}_template.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '')
    if (lines.length === 0) return []
    
    // Header parsing
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''))
    const parsedData: any[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      // Simple quote-aware split
      const values: string[] = []
      let currentVal = ''
      let insideQuotes = false

      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"' || char === "'") {
          insideQuotes = !insideQuotes
        } else if (char === ',' && !insideQuotes) {
          values.push(currentVal.trim().replace(/^["']|["']$/g, ''))
          currentVal = ''
        } else {
          currentVal += char
        }
      }
      values.push(currentVal.trim().replace(/^["']|["']$/g, ''))

      if (values.length !== headers.length) continue

      const row: any = {}
      headers.forEach((header, idx) => {
        const fieldMeta = metadata.fields.find(f => f.key === header)
        if (fieldMeta) {
          if (fieldMeta.type === 'number') {
            row[header] = Number(values[idx]) || 0
          } else if (fieldMeta.type === 'boolean') {
            row[header] = values[idx].toLowerCase() === 'true'
          } else {
            row[header] = values[idx]
          }
        } else {
          row[header] = values[idx]
        }
      })
      parsedData.push(row)
    }
    return parsedData
  }

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvFile(file)
    setCsvMessage(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      try {
        const preview = parseCSV(text)
        setCsvPreview(preview)
      } catch (err: any) {
        setCsvMessage({ type: 'error', text: 'Failed to parse CSV: ' + err.message })
      }
    }
    reader.readAsText(file)
  }

  const importCsvMutation = useMutation({
    mutationFn: async (payload: any[]) => {
      // We will loop and POST each record to the API
      let successCount = 0
      for (const row of payload) {
        const res = await fetch(`/api/cms/${entity}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(row)
        })
        if (res.ok) successCount++
      }
      return successCount
    },
    onSuccess: (count) => {
      setCsvMessage({ type: 'success', text: `Successfully imported ${count} records!` })
      queryClient.invalidateQueries({ queryKey: ['liveRecords', entity] })
      setCsvFile(null)
      setCsvPreview([])
    },
    onError: (err: any) => {
      setCsvMessage({ type: 'error', text: 'Error importing records: ' + err.message })
    }
  })

  // Export to CSV
  const handleExportCSV = () => {
    if (liveData.data.length === 0) return
    const headers = metadata.fields.map(f => f.key)
    const csvRows = [headers.join(',')]

    liveData.data.forEach((row: any) => {
      const values = headers.map(header => {
        const val = row[header]
        if (val === null || val === undefined) return '""'
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`
        return `"${String(val).replace(/"/g, '""')}"`
      })
      csvRows.push(values.join(','))
    })

    const csvContent = `data:text/csv;charset=utf-8,${csvRows.join('\n')}`
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${entity}_export.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Version history fetch
  const handleViewHistory = async (recordId: string) => {
    setSelectedRecordIdForHistory(recordId)
    setVCompare1(null)
    setVCompare2(null)
    setActiveTab('history')
    try {
      const res = await fetch(`/api/cms/${entity}/versions?id=${recordId}`)
      if (res.ok) {
        const versions = await res.json()
        setVersionHistoryList(versions)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: async ({ id, versionId }: { id: string; versionId: string }) => {
      const res = await fetch(`/api/cms/${entity}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, versionId })
      })
      if (!res.ok) throw new Error('Rollback failed')
      return res.json()
    },
    onSuccess: () => {
      alert('Rollback completed successfully!')
      queryClient.invalidateQueries({ queryKey: ['liveRecords', entity] })
      if (selectedRecordIdForHistory) {
        handleViewHistory(selectedRecordIdForHistory)
      }
    }
  })

  if (!metadata) return null

  const getCompareSnapshot = (versionId: string | null) => {
    if (!versionId) return null
    const ver = versionHistoryList.find(v => v.id === versionId)
    if (!ver) return null
    try {
      return JSON.parse(ver.snapshot)
    } catch (e) {
      return ver.snapshot
    }
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Manage {metadata.pluralName}
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Master Data CRUD engine for {metadata.name} live catalog and draft workflows.
          </p>
        </div>

        {/* Tab Buttons bar */}
        <div className="flex flex-wrap bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs">
          <button
            onClick={() => { setActiveTab('list'); setEditingRecordId(null); }}
            className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-all ${
              activeTab === 'list' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Live Production
          </button>
          
          {metadata.draftModelName && (
            <button
              onClick={() => { setActiveTab('drafts'); setEditingRecordId(null); }}
              className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-all ${
                activeTab === 'drafts' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Draft Queue
            </button>
          )}

          <button
            onClick={() => {
              if (!editingRecordId) {
                // Clear state
                const defaults: Record<string, any> = {}
                metadata.fields.forEach(f => {
                  if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue
                })
                setFormData(defaults)
              }
              setActiveTab('create')
            }}
            className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer flex items-center gap-1 transition-all ${
              activeTab === 'create' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Plus className="w-3 h-3" /> {editingRecordId ? 'Edit Record' : 'Create Record'}
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer flex items-center gap-1 transition-all ${
              activeTab === 'import' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileSpreadsheet className="w-3 h-3" /> Import/Export
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {formErrors._global && (
        <div className="bg-red-950/40 border border-red-800 text-red-300 text-xs p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{formErrors._global}</span>
        </div>
      )}

      {/* Active Tab rendering */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-zinc-950 border border-zinc-900 rounded-xl p-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder={`Search ${entity}...`}
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full bg-zinc-900 border border-zinc-850 pl-9 pr-4 py-2 rounded-lg text-xs text-white outline-none focus:border-violet-500 transition-all"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto justify-end">
              {/* Status filter dropdown */}
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
                className="bg-zinc-900 border border-zinc-850 text-xs text-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
              >
                <option value="ACTIVE">Status: ACTIVE</option>
                <option value="ARCHIVED">Status: ARCHIVED</option>
                <option value="all">Status: ALL</option>
              </select>

              {/* Bulk actions tools */}
              {selectedIds.length > 0 && (
                <div className="flex gap-1.5">
                  {statusFilter === 'ACTIVE' && (
                    <button
                      onClick={() => triggerBulkAction('archive')}
                      className="px-3 py-2 bg-red-650 hover:bg-red-555 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Archive Selected ({selectedIds.length})
                    </button>
                  )}
                  {statusFilter === 'ARCHIVED' && (
                    <button
                      onClick={() => triggerBulkAction('restore')}
                      className="px-3 py-2 bg-emerald-650 hover:bg-emerald-555 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Restore Selected ({selectedIds.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-xl">
            {isLiveLoading ? (
              <LoadingState message={`Fetching live ${metadata.pluralName.toLowerCase()}...`} />
            ) : liveError ? (
              <ErrorState message={liveError.message || 'Error fetching live records.'} onRetry={() => refetchLive()} />
            ) : liveData.data.length === 0 ? (
              <EmptyState
                title="No Records Found"
                description={`Tidak ada data ${metadata.pluralName.toLowerCase()} yang ditemukan di database.`}
                actionLabel="Create Record"
                onAction={() => setActiveTab('create')}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-900 border-b border-zinc-850 text-zinc-400 font-bold uppercase tracking-wider">
                      <th className="p-4 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === liveData.data.length}
                          onChange={() => handleSelectAll(liveData.data)}
                        />
                      </th>
                      <th className="p-4 cursor-pointer" onClick={() => { setSortBy('id'); setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                        ID <ArrowUpDown className="w-3 h-3 inline ml-1 text-zinc-500" />
                      </th>
                      <th className="p-4 cursor-pointer" onClick={() => { setSortBy(metadata.fields[1]?.key || 'id'); setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                        Name / Title <ArrowUpDown className="w-3 h-3 inline ml-1 text-zinc-500" />
                      </th>
                      {/* Dynamically show one or two extra properties from fields list */}
                      {metadata.fields.filter(f => !f.isId && f.key !== 'name' && f.key !== 'title' && f.type !== 'textarea').slice(0, 3).map(f => (
                        <th key={f.key} className="p-4">{f.label}</th>
                      ))}
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-300">
                    {liveData.data.map((record: any) => (
                      <tr key={record.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(record.id)}
                            onChange={() => handleBulkSelect(record.id)}
                          />
                        </td>
                        <td className="p-4 font-mono text-[10px] text-zinc-400">{record.id}</td>
                        <td className="p-4">
                          <div className="font-bold text-white text-sm">
                            {record.name || record.title || record.id}
                          </div>
                        </td>
                        {/* Render extra properties */}
                        {metadata.fields.filter(f => !f.isId && f.key !== 'name' && f.key !== 'title' && f.type !== 'textarea').slice(0, 3).map(f => (
                          <td key={f.key} className="p-4 text-zinc-400">
                            {typeof record[f.key] === 'boolean' ? (record[f.key] ? 'Yes' : 'No') : String(record[f.key] || '-')}
                          </td>
                        ))}
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                            record.status === 'ACTIVE' ? 'bg-emerald-950/40 border-emerald-850 text-emerald-400' : 'bg-red-950/40 border-red-850 text-red-400'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="p-4 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(record)}
                            className="p-1 hover:text-white text-zinc-500 rounded hover:bg-zinc-850"
                            title="Edit Record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleViewHistory(record.id)}
                            className="p-1 hover:text-white text-zinc-500 rounded hover:bg-zinc-850"
                            title="View History / Versions"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          {record.status === 'ACTIVE' ? (
                            <button
                              onClick={() => {
                                if (confirm('Archive this live record?')) deleteLiveMutation.mutate(record.id)
                              }}
                              className="p-1 hover:text-red-400 text-zinc-500 rounded hover:bg-zinc-850"
                              title="Archive Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (confirm('Restore this archived record?')) restoreLiveMutation.mutate(record.id)
                              }}
                              className="p-1 hover:text-emerald-400 text-zinc-500 rounded hover:bg-zinc-850"
                              title="Restore Record"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {liveData.pagination.pages > 1 && (
              <div className="flex justify-between items-center bg-zinc-900/60 p-4 border-t border-zinc-900 text-xs text-zinc-400">
                <span>
                  Page <strong>{liveData.pagination.page}</strong> of <strong>{liveData.pagination.pages}</strong> ({liveData.pagination.total} records)
                </span>
                <div className="flex gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1.5 bg-zinc-950 border border-zinc-850 disabled:opacity-40 hover:text-white rounded cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage >= liveData.pagination.pages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-1.5 bg-zinc-950 border border-zinc-850 disabled:opacity-40 hover:text-white rounded cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Draft Queue */}
      {activeTab === 'drafts' && metadata.draftModelName && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-xl">
          {isDraftsLoading ? (
            <LoadingState message={`Fetching draft ${metadata.pluralName.toLowerCase()} queue...`} />
          ) : draftsError ? (
            <ErrorState message={draftsError.message || 'Error fetching drafts.'} onRetry={() => refetchDrafts()} />
          ) : drafts.length === 0 ? (
            <EmptyState
              title="Draft Queue Empty"
              description={`Tidak ada draft ${metadata.pluralName.toLowerCase()} yang menunggu proses review saat ini.`}
              actionLabel="Create Draft"
              onAction={() => setActiveTab('create')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-850 text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Name / Title</th>
                    <th className="p-4">Contributor</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Review Notes</th>
                    <th className="p-4 text-right">Review Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {drafts.map((draft: any) => (
                    <tr key={draft.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">
                          {draft.name || draft.title || draft.id}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{draft.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-zinc-200">{draft.contributor?.name || 'Unknown'}</div>
                        <div className="text-[10px] text-zinc-500">{draft.contributor?.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                          draft.status === 'PENDING_REVIEW' ? 'bg-violet-950/40 border-violet-850 text-violet-400' :
                          draft.status === 'REJECTED' ? 'bg-red-950/40 border-red-850 text-red-400' :
                          draft.status === 'PUBLISHED' ? 'bg-emerald-950/40 border-emerald-850 text-emerald-400' :
                          'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}>
                          {draft.status}
                        </span>
                      </td>
                      <td className="p-4 max-w-[200px] truncate" title={draft.reviewNotes || ''}>
                        {draft.reviewNotes || <span className="text-zinc-650">-</span>}
                      </td>
                      <td className="p-4 text-right space-x-1">
                        {draft.status === 'DRAFT' || draft.status === 'REJECTED' ? (
                          <button
                            onClick={() => approveDraftMutation.mutate({ id: draft.id, status: 'PENDING_REVIEW' })}
                            className="px-2.5 py-1 bg-violet-650 hover:bg-violet-555 text-white font-bold rounded text-[10px] cursor-pointer"
                          >
                            Submit Review
                          </button>
                        ) : draft.status === 'PENDING_REVIEW' ? (
                          <div className="inline-flex gap-1">
                            <button
                              onClick={() => {
                                const notes = prompt('Enter rejection notes:')
                                if (notes !== null) approveDraftMutation.mutate({ id: draft.id, status: 'REJECTED', reviewNotes: notes })
                              }}
                              className="px-2.5 py-1 bg-red-650 hover:bg-red-555 text-white font-bold rounded text-[10px] cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Publish this draft live?')) approveDraftMutation.mutate({ id: draft.id, status: 'PUBLISHED' })
                              }}
                              className="px-2.5 py-1 bg-emerald-650 hover:bg-emerald-555 text-white font-bold rounded text-[10px] cursor-pointer"
                            >
                              Approve & Publish
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-550">Published</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Create New / Edit wizard */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Assisted Section */}
          <div className="lg:col-span-1 bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-xl self-start">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              AI-Assisted Entry
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Copy paste a Wiki page, description, or notes block, and click extract. The AI parser will dynamically pop fields inside the creation form.
            </p>
            <textarea
              value={aiText}
              onChange={e => setAiText(e.target.value)}
              placeholder="Paste text describing this record..."
              rows={6}
              className="w-full bg-zinc-900 border border-zinc-850 focus:border-violet-500 rounded-lg p-3 text-xs text-white placeholder-zinc-600 outline-none resize-none transition-all"
            />
            <button
              type="button"
              onClick={handleAIExtract}
              disabled={aiExtracting || !aiText}
              className="w-full flex items-center justify-center gap-2 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-xs font-bold text-violet-400 border border-zinc-800 rounded-lg cursor-pointer transition-colors"
            >
              {aiExtracting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Parse Fields
                </>
              )}
            </button>
          </div>

          {/* Form container */}
          <form onSubmit={e => handleFormSubmit(e, false)} className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-5 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {editingRecordId ? `Edit ${metadata.name}` : `New ${metadata.name}`}
              </h3>
              <button
                type="button"
                onClick={clearDraft}
                className="text-zinc-500 hover:text-zinc-300 text-xs flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Reset Form
              </button>
            </div>

            {/* Form Guided Warning/Hint Callout */}
            {entity === 'characters' && (
              <div className="p-3 bg-violet-950/20 border border-violet-900/40 rounded-lg text-xs text-violet-300 flex items-center gap-2 animate-in fade-in">
                <Info className="w-4 h-4 text-violet-400 shrink-0" />
                <span><strong>Petunjuk Pengisian:</strong> Isi data sesuai sumber resmi.</span>
              </div>
            )}
            {entity === 'skills' && (
              <div className="p-3 bg-violet-950/20 border border-violet-900/40 rounded-lg text-xs text-violet-300 flex items-center gap-2 animate-in fade-in">
                <Info className="w-4 h-4 text-violet-400 shrink-0" />
                <span><strong>Petunjuk Pengisian:</strong> Masukkan deskripsi dan trigger skill.</span>
              </div>
            )}
            {entity === 'supports' && (
              <div className="p-3 bg-violet-950/20 border border-violet-900/40 rounded-lg text-xs text-violet-300 flex items-center gap-2 animate-in fade-in">
                <Info className="w-4 h-4 text-violet-400 shrink-0" />
                <span><strong>Petunjuk Pengisian:</strong> Lengkapi seluruh bonus support.</span>
              </div>
            )}
            {entity === 'events' && (
              <div className="p-3 bg-violet-950/20 border border-violet-900/40 rounded-lg text-xs text-violet-300 flex items-center gap-2 animate-in fade-in">
                <Info className="w-4 h-4 text-violet-400 shrink-0" />
                <span><strong>Petunjuk Pengisian:</strong> Masukkan detail event sesuai server global.</span>
              </div>
            )}
            {entity === 'banners' && (
              <div className="p-3 bg-violet-950/20 border border-violet-900/40 rounded-lg text-xs text-violet-300 flex items-center gap-2 animate-in fade-in">
                <Info className="w-4 h-4 text-violet-400 shrink-0" />
                <span><strong>Petunjuk Pengisian:</strong> Masukkan periode banner dan unit rate up.</span>
              </div>
            )}

            {/* Dynamic Form Generation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metadata.fields.map((field: FieldDescriptor) => {
                // If it is editing record, don't allow modifying key if it is ID
                const isDisabled = !!(field.readonly || (editingRecordId && field.isId))

                return (
                  <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wide flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>{field.label}</span>
                        {field.required && <span className="text-red-500">*</span>}
                        {field.key === 'growthSpeed' && <HelpTooltip content="Bonus pertumbuhan Speed saat training." />}
                        {field.key === 'growthStamina' && <HelpTooltip content="Bonus pertumbuhan Stamina saat training." />}
                        {field.key === 'growthPower' && <HelpTooltip content="Bonus pertumbuhan Power saat training." />}
                        {field.key === 'growthGuts' && <HelpTooltip content="Bonus pertumbuhan Guts saat training." />}
                        {field.key === 'growthWisdom' && <HelpTooltip content="Bonus pertumbuhan Wisdom saat training." />}
                      </span>
                      {formErrors[field.key] && <span className="text-red-400 text-[10px] font-medium lowercase font-mono">{formErrors[field.key]}</span>}
                    </label>

                    {field.type === 'textarea' ? (
                      <textarea
                        value={formData[field.key] || ''}
                        disabled={isDisabled}
                        onChange={e => handleFieldChange(field.key, e.target.value)}
                        placeholder={`Provide ${field.label.toLowerCase()}...`}
                        rows={field.key === 'effects' || field.key === 'events' ? 4 : 5}
                        className={`w-full bg-zinc-900 border ${
                          formErrors[field.key] ? 'border-red-800' : 'border-zinc-850 focus:border-violet-500'
                        } rounded-lg p-3 text-xs text-white outline-none transition-all`}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={formData[field.key] || ''}
                        disabled={isDisabled}
                        onChange={e => handleFieldChange(field.key, e.target.value)}
                        className={`w-full bg-zinc-900 border ${
                          formErrors[field.key] ? 'border-red-800' : 'border-zinc-850 focus:border-violet-500'
                        } rounded-lg p-2.5 text-xs text-zinc-200 outline-none transition-all`}
                      >
                        <option value="">Select Option</option>
                        {field.options?.map((opt: any) => {
                          const val = typeof opt === 'object' ? opt.value : opt
                          const label = typeof opt === 'object' ? opt.label : opt
                          return (
                            <option key={val} value={val}>{label}</option>
                          )
                        })}
                      </select>
                    ) : field.type === 'boolean' ? (
                      <div className="flex items-center gap-2.5 p-2 bg-zinc-900/60 border border-zinc-850 rounded-lg">
                        <input
                          type="checkbox"
                          id={`chk_${field.key}`}
                          checked={!!formData[field.key]}
                          disabled={isDisabled}
                          onChange={e => handleFieldChange(field.key, e.target.checked)}
                          className="w-4 h-4 accent-violet-600 cursor-pointer"
                        />
                        <label htmlFor={`chk_${field.key}`} className="text-xs text-zinc-300 font-semibold cursor-pointer">
                          Enabled
                        </label>
                      </div>
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={formData[field.key] === undefined ? '' : formData[field.key]}
                        disabled={isDisabled}
                        onChange={e => handleFieldChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                        className={`w-full bg-zinc-900 border ${
                          formErrors[field.key] ? 'border-red-800' : 'border-zinc-850 focus:border-violet-500'
                        } rounded-lg p-2.5 text-xs text-white outline-none transition-all`}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Version control comments (only on Edit) */}
            {editingRecordId && (
              <div className="border-t border-zinc-900 pt-4">
                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wide">
                  Version Commit / Rollback Comment
                </label>
                <input
                  type="text"
                  required
                  value={versionComment}
                  onChange={e => setVersionComment(e.target.value)}
                  placeholder="Summarize your changes... e.g. Fixed typo or updated base speed stats"
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 text-xs text-white outline-none focus:border-violet-500 transition-all"
                />
              </div>
            )}

            {/* Actions Bar */}
            <div className="border-t border-zinc-900 pt-5 flex justify-end gap-2">
              {!editingRecordId && metadata.draftModelName && (
                <button
                  type="button"
                  onClick={e => handleFormSubmit(e, true)}
                  disabled={createDraftMutation.isPending}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {createDraftMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Save as Draft
                    </>
                  )}
                </button>
              )}

              <button
                type="submit"
                disabled={createLiveMutation.isPending || updateLiveMutation.isPending}
                className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                {(createLiveMutation.isPending || updateLiveMutation.isPending) ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> {editingRecordId ? 'Publish Changes' : 'Publish Directly'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: CSV Import/Export */}
      {activeTab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exporter Section */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-violet-400" /> Export Data
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Download the entire active {metadata.name} list as a standard CSV spreadsheet file. You can easily back up, share, or edit it inside Microsoft Excel or Google Sheets.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="px-5 py-2.5 bg-violet-650 hover:bg-violet-555 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" /> Export {metadata.pluralName} to CSV
              </button>
              <button
                onClick={downloadCSVTemplate}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" /> Download Blank CSV Template
              </button>
            </div>
          </div>

          {/* Importer Section */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-violet-400" /> Bulk CSV Importer
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Upload a `.csv` document aligning with the template headers. The client-side parser will inspect values and upload them sequentially.
            </p>

            {/* Dropzone area */}
            <div className="border border-dashed border-zinc-850 hover:border-violet-500/50 rounded-xl p-6 bg-zinc-900/10 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileSpreadsheet className="w-10 h-10 text-zinc-500 mb-2.5" />
              <span className="text-xs text-zinc-300 font-bold">
                {csvFile ? csvFile.name : 'Click or Drag CSV here to upload'}
              </span>
              <span className="text-[10px] text-zinc-550 mt-1">Accepts only standard UTF-8 .csv files</span>
            </div>

            {/* CSV parsing preview list */}
            {csvPreview.length > 0 && (
              <div className="bg-zinc-900/60 p-4 border border-zinc-850 rounded-lg space-y-2 max-h-48 overflow-y-auto">
                <span className="block text-[10px] font-bold text-zinc-450 uppercase">CSV File Preview ({csvPreview.length} items detected)</span>
                <div className="divide-y divide-zinc-900">
                  {csvPreview.slice(0, 5).map((row, idx) => (
                    <div key={idx} className="py-2 text-[10px] text-zinc-350 font-mono flex justify-between">
                      <span className="font-bold text-white">{row.name || row.title || row.id || `Row ${idx + 1}`}</span>
                      <span>{row.id}</span>
                    </div>
                  ))}
                  {csvPreview.length > 5 && (
                    <div className="pt-2 text-[9px] text-zinc-500 text-center">... and {csvPreview.length - 5} more items</div>
                  )}
                </div>
              </div>
            )}

            {/* CSV Messages */}
            {csvMessage && (
              <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                csvMessage.type === 'success' ? 'bg-emerald-950/30 border-emerald-900 text-emerald-400' : 'bg-red-950/30 border-red-900 text-red-400'
              }`}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{csvMessage.text}</span>
              </div>
            )}

            {/* Import Confirm Button */}
            {csvPreview.length > 0 && (
              <button
                type="button"
                disabled={importCsvMutation.isPending}
                onClick={() => importCsvMutation.mutate(csvPreview)}
                className="w-full py-2.5 bg-emerald-650 hover:bg-emerald-555 disabled:opacity-40 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {importCsvMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Import {csvPreview.length} Records Now
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab: Version History comparison */}
      {activeTab === 'history' && selectedRecordIdForHistory && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-6 shadow-xl">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-violet-400" /> Version History Comparison
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Record ID: {selectedRecordIdForHistory}</p>
            </div>
            <button
              onClick={() => setActiveTab('list')}
              className="p-1 hover:text-white text-zinc-500 rounded hover:bg-zinc-850"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Version List Sidebar */}
            <div className="md:col-span-1 border-r border-zinc-900 pr-4 space-y-3 max-h-96 overflow-y-auto">
              <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Available Snapshots</span>
              {versionHistoryList.length === 0 ? (
                <div className="text-zinc-650 text-xs py-4 text-center">No version logs found for this item.</div>
              ) : (
                <div className="space-y-2">
                  {versionHistoryList.map(v => (
                    <div
                      key={v.id}
                      className="p-3 bg-zinc-900/50 border border-zinc-850 hover:border-violet-500/50 rounded-lg text-xs space-y-1 relative"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-[11px]">Version v{v.version}</span>
                        <span className="text-[9px] text-zinc-500 font-mono">{new Date(v.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-zinc-400 text-[10px] leading-relaxed line-clamp-2">{v.comment || 'No comment'}</p>
                      
                      <div className="flex justify-between items-center pt-2">
                        {/* Selector checkbox for compare */}
                        <div className="flex gap-2">
                          <label className="flex items-center gap-1 text-[9px] text-zinc-500 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={vCompare1 === v.id}
                              onChange={() => setVCompare1(vCompare1 === v.id ? null : v.id)}
                              className="w-3 h-3 accent-violet-600"
                            />
                            Left
                          </label>
                          <label className="flex items-center gap-1 text-[9px] text-zinc-500 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={vCompare2 === v.id}
                              onChange={() => setVCompare2(vCompare2 === v.id ? null : v.id)}
                              className="w-3 h-3 accent-violet-600"
                            />
                            Right
                          </label>
                        </div>

                        <button
                          disabled={rollbackMutation.isPending}
                          onClick={() => {
                            if (confirm(`Are you sure you want to rollback to Version v${v.version}?`)) {
                              rollbackMutation.mutate({ id: selectedRecordIdForHistory, versionId: v.id })
                            }
                          }}
                          className="px-2 py-0.5 bg-violet-600 hover:bg-violet-500 text-white rounded text-[9px] font-extrabold cursor-pointer"
                        >
                          Rollback
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comparison Side-by-Side viewer */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Left Comparison panel */}
                <div className="bg-zinc-900/30 border border-zinc-850 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                    <span className="text-xs font-bold text-violet-400">Left Panel</span>
                    {vCompare1 && (
                      <span className="text-[10px] font-bold text-white font-mono bg-zinc-800 px-2 py-0.5 rounded">
                        v{versionHistoryList.find(x => x.id === vCompare1)?.version}
                      </span>
                    )}
                  </div>
                  {vCompare1 ? (
                    <pre className="text-[10px] font-mono text-zinc-400 bg-zinc-950 p-3 rounded-lg max-h-72 overflow-y-auto whitespace-pre-wrap">
                      {JSON.stringify(getCompareSnapshot(vCompare1), null, 2)}
                    </pre>
                  ) : (
                    <div className="text-zinc-600 text-xs py-10 text-center">Select "Left" checkbox on snapshot to compare.</div>
                  )}
                </div>

                {/* Right Comparison panel */}
                <div className="bg-zinc-900/30 border border-zinc-850 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                    <span className="text-xs font-bold text-violet-400">Right Panel</span>
                    {vCompare2 && (
                      <span className="text-[10px] font-bold text-white font-mono bg-zinc-800 px-2 py-0.5 rounded">
                        v{versionHistoryList.find(x => x.id === vCompare2)?.version}
                      </span>
                    )}
                  </div>
                  {vCompare2 ? (
                    <pre className="text-[10px] font-mono text-zinc-400 bg-zinc-950 p-3 rounded-lg max-h-72 overflow-y-auto whitespace-pre-wrap">
                      {JSON.stringify(getCompareSnapshot(vCompare2), null, 2)}
                    </pre>
                  ) : (
                    <div className="text-zinc-600 text-xs py-10 text-center">Select "Right" checkbox on snapshot to compare.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
