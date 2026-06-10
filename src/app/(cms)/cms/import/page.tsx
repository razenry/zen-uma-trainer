'use client'

import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  FileSpreadsheet, 
  HelpCircle, 
  Upload, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2 
} from 'lucide-react'
import HelpTooltip from '@/components/shared/help-tooltip'

const TEMPLATES = {
  Character: "name,japaneseName,rarity,birthday,height,weight,cv,growthSpeed,growthStamina,growthPower,growthGuts,growthWisdom,sprint,mile,medium,long,front,leader,betweener,chaser,description\nOguri Cap,オグリキャップ,3,03-27,167,Unknown,Yuko Sanpei,20,0,10,0,0,A,A,A,B,C,A,S,B,Legendary horse girl",
  SupportCard: "name,rarity,type,trainingBonus,friendshipBonus,raceBonus,fanBonus,hintLevelBonus,initialBond,description\nKitasan Black SSR,SSR,Speed,15,35,10,15,3,15,Top tier speed support",
  Skill: "name,category,cost,tier,trigger,distanceRequirement,styleRequirement,description\nConcentration,Start,170,S,Start Race,Any,Any,Improve race start",
  Race: "name,distance,groundType,season,grade,fanRequirement\nJapan Cup,2400,Turf,Autumn,G1,25000"
}

export default function CMSImportPage() {
  const queryClient = useQueryClient()
  const [entityType, setEntityType] = useState<'Character' | 'SupportCard' | 'Skill' | 'Race'>('Character')
  const [csvContent, setCsvContent] = useState('')
  
  // Validation Results state
  const [validating, setValidating] = useState(false)
  const [validationReport, setValidationReport] = useState<any | null>(null)
  const [validRows, setValidRows] = useState<any[]>([])

  // Mutation to validate rows
  const validateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/cms/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Validation failed')
      return res.json()
    },
    onSuccess: (data) => {
      setValidationReport(data.summary)
      setValidRows(data.validRows || [])
    }
  })

  // Mutation to save validated drafts
  const importMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/cms/import/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Save failed')
      return res.json()
    },
    onSuccess: (data) => {
      alert(`Import Berhasil! ${data.count} Draf ditambahkan ke review queue.`);
      setValidationReport(null)
      setCsvContent('')
      setValidRows([])
      queryClient.invalidateQueries({ queryKey: ['charDrafts'] })
      queryClient.invalidateQueries({ queryKey: ['adminCounts'] })
    }
  })

  const parseCsvText = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim())
    const parsedRows = []

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim())
      const rowObj: any = {}
      headers.forEach((header, index) => {
        rowObj[header] = cols[index] || ''
      })
      parsedRows.push(rowObj)
    }

    return parsedRows
  }

  const handleValidate = () => {
    if (!csvContent) return
    const parsed = parseCsvText(csvContent)
    validateMutation.mutate({ rows: parsed, entityType })
  }

  const handleExecuteImport = () => {
    if (validRows.length === 0) return
    importMutation.mutate({ rows: validRows, entityType })
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">Bulk Import Center</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Unggah atau tempel data CSV untuk memvalidasi duplikasi, kolom wajib, tipe angka, dan menyimpannya sebagai draf review secara massal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CSV input and template picker */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-violet-400" />
              <span>Unggah File CSV / Spreadsheet</span>
              <HelpTooltip content="Gunakan template CSV yang tersedia." />
            </h2>

            {/* Entity selector */}
            <select
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value as any)
                setValidationReport(null)
              }}
              className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-300 outline-none"
            >
              <option value="Character">Character Import</option>
              <option value="SupportCard">Support Card Import</option>
              <option value="Skill">Skill Catalog Import</option>
              <option value="Race">Race Suitability Import</option>
            </select>
          </div>

          {/* Template preview */}
          <div className="p-3 bg-zinc-900/50 border border-zinc-900 rounded-lg text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-400 uppercase text-[9px] tracking-wider">CSV Header Format Template:</span>
              <button
                onClick={() => setCsvContent(TEMPLATES[entityType])}
                className="text-[9px] text-violet-400 hover:underline font-bold"
              >
                Gunakan Dummy Template
              </button>
            </div>
            <code className="block bg-zinc-950 p-2 rounded text-[10px] text-violet-300 font-mono break-all leading-normal">
              {TEMPLATES[entityType].split('\n')[0]}
            </code>
          </div>

          {/* CSV Textarea */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pasted CSV Content</label>
            <textarea
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="name,rarity,type...\nSpecial Week,3,Medium..."
              rows={8}
              className="w-full bg-zinc-900 border border-zinc-850 focus:border-violet-500 rounded-lg p-3 text-xs text-white placeholder-zinc-600 font-mono outline-none resize-none transition-all"
            />
          </div>

          {validateMutation.isError && (
            <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-xs text-red-400">
              Validasi Gagal: {validateMutation.error?.message || 'Terjadi kesalahan sistem saat memproses berkas.'}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={handleValidate}
              disabled={validateMutation.isPending || !csvContent}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow"
            >
              {validateMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Validating Rows...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Validate Bulk Rows
                </>
              )}
            </button>
          </div>
        </div>

        {/* Validation Results Sidebar */}
        <div className="space-y-6">
          {validationReport ? (
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Laporan Hasil Validasi</span>
                <HelpTooltip content="Periksa data sebelum diimport." />
              </h3>
              
              {/* Summary Stats grid */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-zinc-900 p-2 rounded border border-zinc-850">
                  <span className="block text-[9px] text-zinc-500 uppercase">Valid Rows</span>
                  <span className="text-base font-extrabold text-emerald-400 mt-0.5 block">{validationReport.valid}</span>
                </div>
                <div className="bg-zinc-900 p-2 rounded border border-zinc-850">
                  <span className="block text-[9px] text-zinc-500 uppercase">Invalid Rows</span>
                  <span className="text-base font-extrabold text-red-400 mt-0.5 block">{validationReport.invalid}</span>
                </div>
                <div className="bg-zinc-900 p-2 rounded border border-zinc-850">
                  <span className="block text-[9px] text-zinc-500 uppercase flex items-center justify-center gap-1">
                    Duplicates
                    <HelpTooltip content="Sistem akan mendeteksi data duplikat." />
                  </span>
                  <span className="text-base font-extrabold text-amber-500 mt-0.5 block">{validationReport.duplicate}</span>
                </div>
                <div className="bg-zinc-900 p-2 rounded border border-zinc-850">
                  <span className="block text-[9px] text-zinc-500 uppercase">Total Rows</span>
                  <span className="text-base font-extrabold text-white mt-0.5 block">{validationReport.total}</span>
                </div>
              </div>

              {/* Warnings details list */}
              {validationReport.errors && validationReport.errors.length > 0 && (
                <div className="space-y-2.5 border-t border-zinc-900 pt-4">
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                    <span>Daftar Baris Error / Peringatan:</span>
                    <HelpTooltip content="Baris yang gagal dapat diunduh untuk diperbaiki." />
                  </span>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2">
                    {validationReport.errors.map((err: any, idx: number) => (
                      <div key={idx} className="p-2 bg-zinc-900/60 border border-zinc-900 rounded text-[10px] text-zinc-400 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Row {err.row}:</strong> {err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {importMutation.isError && (
                <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-[10px] text-red-400">
                  Import Gagal: {importMutation.error?.message}
                </div>
              )}

              {/* Import trigger */}
              {validationReport.valid > 0 && (
                <div className="border-t border-zinc-900 pt-4">
                  <button
                    onClick={handleExecuteImport}
                    disabled={importMutation.isPending}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow cursor-pointer transition-colors"
                  >
                    {importMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Import {validationReport.valid} Valid Rows
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 text-center text-zinc-500 text-xs shadow">
              <HelpCircle className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
              Laporan hasil validasi akan muncul di sini setelah Anda mengeklik &quot;Validate Bulk Rows&quot;.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
