'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Image as ImageIcon, 
  Search, 
  Upload, 
  Trash2, 
  Tag, 
  Filter, 
  Plus,
  Loader2 
} from 'lucide-react'

interface MediaFile {
  id: string
  name: string
  url: string
  size: string
  type: string
  tags: string[]
}

export default function CMSMediaPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState('All')

  // Form states for mock upload dialog
  const [uploadOpen, setUploadOpen] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState('42 KB')
  const [fileTag, setFileTag] = useState('character')

  // Query media list
  const { data: media = [], isLoading } = useQuery<MediaFile[]>({
    queryKey: ['mediaFiles'],
    queryFn: () => fetch('/api/cms/media').then(res => res.json())
  })

  // Mutation to mock upload image
  const uploadMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/cms/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Upload failed')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaFiles'] })
      setUploadOpen(false)
      setFileName('')
    }
  })

  // Mutation to delete media
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/cms/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (!res.ok) throw new Error('Delete failed')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaFiles'] })
    }
  })

  // Filter
  const filteredMedia = media.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase())
    const matchesTag = selectedTag === 'All' || m.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const handleMockUpload = (e: React.FormEvent) => {
    e.preventDefault()
    uploadMutation.mutate({
      name: fileName.endsWith('.webp') ? fileName : `${fileName}.webp`,
      size: fileSize,
      type: 'image/webp',
      tags: [fileTag, 'upload']
    })
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">Media Library</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Unggah dan optimalkan aset gambar (thumbnails, artwork) yang dikompres dan dikonversi ke WebP secara otomatis.
          </p>
        </div>

        <button
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload New Image
        </button>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari nama berkas media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-550 outline-none transition-all"
          />
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-zinc-500 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-violet-400" /> Filter Tag:
          </span>
          {['All', 'character', 'support', 'skill', 'icon'].map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1 rounded-md border transition-all cursor-pointer capitalize ${
                selectedTag === tag
                  ? 'bg-violet-600 border-violet-500 text-white font-semibold'
                  : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Images */}
      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-zinc-900/10 border border-zinc-900 rounded-xl p-12 text-center text-zinc-500">
          Tidak ada berkas gambar yang cocok dengan kriteria pencarian Anda.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredMedia.map((file) => (
            <div 
              key={file.id} 
              className="bg-zinc-900/20 border border-zinc-900 hover:border-zinc-800 rounded-xl overflow-hidden group transition-all"
            >
              {/* Image Preview Container */}
              <div className="h-32 bg-zinc-950 border-b border-zinc-900 flex items-center justify-center relative overflow-hidden">
                <img
                  src={file.url}
                  alt={file.name}
                  onError={(e) => {
                    // fallback icon if resource offline
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm('Delete this file?')) deleteMutation.mutate(file.id)
                    }}
                    className="p-2 bg-red-950/80 border border-red-800 text-red-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Hapus Aset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="p-3 space-y-1">
                <span className="block text-xs font-bold text-white truncate" title={file.name}>
                  {file.name}
                </span>
                <div className="flex justify-between items-center text-[10px] text-zinc-500">
                  <span>{file.size} • WebP</span>
                  <div className="flex gap-1">
                    {file.tags.map(t => (
                      <span key={t} className="px-1 py-0.5 bg-zinc-900 rounded border border-zinc-800 text-[8px] text-zinc-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal Dialog */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form 
            onSubmit={handleMockUpload} 
            className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-violet-400" />
                Upload & WebP Converter
              </h2>
              <button 
                type="button" 
                onClick={() => setUploadOpen(false)} 
                className="text-zinc-500 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">FILE NAME</label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. kitasan-black-ssr-thumb"
                  className="w-full bg-zinc-900 border border-zinc-850 focus:border-violet-500 rounded-lg p-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">ESTIMATED SIZE</label>
                  <select
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-lg p-2 text-xs text-zinc-200 outline-none"
                  >
                    <option value="25 KB">25 KB (Compressed)</option>
                    <option value="48 KB">48 KB (Normal)</option>
                    <option value="120 KB">120 KB (High Quality)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">IMAGE TAG</label>
                  <select
                    value={fileTag}
                    onChange={(e) => setFileTag(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-lg p-2 text-xs text-zinc-200 outline-none"
                  >
                    <option value="character">Character Thumb</option>
                    <option value="support">Support Card Artwork</option>
                    <option value="skill">Skill Icon</option>
                    <option value="icon">System Icon</option>
                  </select>
                </div>
              </div>

              {/* Simulated Auto Convert Log */}
              <div className="p-3 bg-zinc-900 border border-zinc-900 rounded-lg text-[10px] text-zinc-500 space-y-1">
                <span className="block text-violet-400 font-bold">AUTOMATIC CONVERSION PIPELINE:</span>
                <span className="block">• Converts PNG/JPG files to WebP container.</span>
                <span className="block">• Resize resolution to fit maximum 800px width.</span>
                <span className="block">• Applies lossy WebP compression at 80% quality.</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={uploadMutation.isPending || !fileName}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Convert & Upload Asset'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
