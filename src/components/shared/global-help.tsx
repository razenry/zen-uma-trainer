'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { HelpCircle, Search, X, BookOpen, Key, Settings, PlayCircle, HelpCircle as HelpIcon, FileText } from 'lucide-react'

const FAQ_ITEMS = [
  { q: "Bagaimana cara melakukan Spark?", a: "Spark dicapai setelah melakukan 200 kali tarikan (setara 30.000 Jewels atau gabungan tiket gacha) pada satu banner." },
  { q: "Apa guna pengali Skenario di AI Advisor?", a: "Setiap skenario (e.g. L'Arc, UAF) memiliki pengali stat bawaan. AI Advisor menyesuaikan urgensi latihan berdasarkan pengali ini." },
  { q: "Mengapa draf saya belum muncul di halaman utama?", a: "Draf yang Anda kirimkan harus ditinjau dan disetujui terlebih dahulu oleh Moderator atau Admin di CMS Review Center." }
]

const KEYBOARD_SHORTCUTS = [
  { key: "Esc", desc: "Menutup modal / panel bantuan melayang" },
  { key: "Tab", desc: "Berpindah fokus navigasi input form" },
  { key: "Enter", desc: "Mengonfirmasi pilihan dialog / tombol aktif" }
]

export default function GlobalHelp() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'getting-started' | 'user-guide' | 'cms-guide' | 'faq' | 'shortcuts' | 'videos' | 'changelog'>('getting-started')

  const userRole = (session?.user as any)?.role || 'USER'
  const isCmsUser = ['ADMIN', 'MODERATOR', 'DATA_ENTRY'].includes(userRole)

  const handleClose = () => setIsOpen(false)

  // Filtering helper
  const matchesSearch = (text: string) => {
    return text.toLowerCase().includes(searchQuery.toLowerCase())
  }

  return (
    <>
      {/* Floating help button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-full shadow-xl shadow-violet-600/35 transition-all hover:scale-105 cursor-pointer outline-none border border-violet-500/20"
        title="Open Help Center"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Help Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px] animate-in zoom-in-95 duration-200">
            
            {/* Header with Search */}
            <div className="p-4 border-b border-zinc-900 flex items-center justify-between gap-4 bg-zinc-900/30">
              <div className="flex items-center gap-2 text-white font-bold text-sm font-display flex-shrink-0">
                <BookOpen className="w-4 h-4 text-violet-400" />
                Help Center
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari dokumentasi bantuan..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg py-1.5 pl-8 pr-3.5 text-xs text-white placeholder-zinc-550 outline-none transition-all"
                />
              </div>

              <button
                onClick={handleClose}
                className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar + Main Content Grid */}
            <div className="flex-1 flex min-h-0">
              {/* Sidebar Navigation */}
              <div className="w-48 border-r border-zinc-900 p-2 space-y-1 overflow-y-auto bg-zinc-950">
                <button
                  onClick={() => setActiveTab('getting-started')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'getting-started' ? 'bg-zinc-900 text-violet-400' : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-white'
                  }`}
                >
                  🎯 Getting Started
                </button>
                <button
                  onClick={() => setActiveTab('user-guide')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'user-guide' ? 'bg-zinc-900 text-violet-400' : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-white'
                  }`}
                >
                  📖 User Guide
                </button>
                {isCmsUser && (
                  <button
                    onClick={() => setActiveTab('cms-guide')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'cms-guide' ? 'bg-zinc-900 text-violet-400' : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-white'
                    }`}
                  >
                    🛠️ CMS Guide
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('faq')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'faq' ? 'bg-zinc-900 text-violet-400' : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-white'
                  }`}
                >
                  ❓ FAQ
                </button>
                <button
                  onClick={() => setActiveTab('shortcuts')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'shortcuts' ? 'bg-zinc-900 text-violet-400' : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-white'
                  }`}
                >
                  ⌨️ Shortcuts
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'videos' ? 'bg-zinc-900 text-violet-400' : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-white'
                  }`}
                >
                  📹 Video Guide
                </button>
                <button
                  onClick={() => setActiveTab('changelog')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'changelog' ? 'bg-zinc-900 text-violet-400' : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-white'
                  }`}
                >
                  🚀 Changelog
                </button>
              </div>

              {/* Documentation Detail Panels */}
              <div className="flex-1 p-5 overflow-y-auto bg-zinc-900/10 text-xs text-zinc-350 space-y-4">
                
                {/* 1. GETTING STARTED */}
                {activeTab === 'getting-started' && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white">Selamat Datang di Trainer Assistant!</h4>
                    <p className="leading-relaxed">Berikut 3 langkah awal memaksimalkan performa Uma Anda:</p>
                    <ol className="list-decimal list-inside space-y-1.5 pl-1">
                      {matchesSearch("Mendaftarkan Uma dan kartu bantuan di Ownership Tracker") && (
                        <li>Daftarkan Uma Musume dan Support Card yang dimiliki di <strong>Ownership Tracker</strong>.</li>
                      )}
                      {matchesSearch("Rancang target build di planner") && (
                        <li>Rancang target statistik akhir dan keahlian di <strong>Build Planner</strong>.</li>
                      )}
                      {matchesSearch("Lakukan uji coba simulasi training") && (
                        <li>Jalankan latihan simulasi turn-by-turn di modul <strong>Training Simulator</strong> dibantu rekomendasi AI.</li>
                      )}
                    </ol>
                  </div>
                )}

                {/* 2. USER GUIDE */}
                {activeTab === 'user-guide' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white">Panduan Penggunaan Fitur Utama</h4>
                    
                    {matchesSearch("Training Simulator") && (
                      <div className="space-y-1">
                        <span className="font-bold text-zinc-200 block">⚡ Training Simulator</span>
                        <p className="leading-relaxed">Lakukan simulasi aktivitas latihan. Setiap turn mengonsumsi energi dan dipengaruhi motivasi. Ikuti saran terbaik AI di kanan layar untuk efisiensi maksimum.</p>
                      </div>
                    )}

                    {matchesSearch("Team Builder") && (
                      <div className="space-y-1 pt-2 border-t border-zinc-900">
                        <span className="font-bold text-zinc-200 block">👥 Team Builder</span>
                        <p className="leading-relaxed">Formulasikan susunan tim untuk mode Stadium atau Champion Meeting. Hindari Running Style ganda untuk mencegah risiko blocking jalur lari.</p>
                      </div>
                    )}

                    {matchesSearch("Resource Planner") && (
                      <div className="space-y-1 pt-2 border-t border-zinc-900">
                        <span className="font-bold text-zinc-200 block">💎 Resource Planner</span>
                        <p className="leading-relaxed">Pantau jumlah Jewels Anda. AI akan menyarankan menyimpan gacha tickets jika target Jewels belum mencapai batas jaminan Spark (30.000 Jewels).</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. CMS GUIDE */}
                {activeTab === 'cms-guide' && isCmsUser && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white">Panduan Administrator & Data Entry</h4>
                    
                    {matchesSearch("Review Workflow") && (
                      <div className="space-y-1">
                        <span className="font-bold text-zinc-200 block">🔄 Review Workflow Draf</span>
                        <p className="leading-relaxed">Penyuntingan data master melalui status draf. Draf yang dibuat Data Entry harus disetujui (Approved) oleh Moderator/Admin di Review Center agar rilis live.</p>
                      </div>
                    )}

                    {matchesSearch("Import Center") && (
                      <div className="space-y-1 pt-2 border-t border-zinc-900">
                        <span className="font-bold text-zinc-200 block">📥 Import Center</span>
                        <p className="leading-relaxed">Unggah file CSV sesuai template kolom yang disediakan. Sistem mendeteksi entri duplikat dan men-draft baris gagal untuk dapat diunduh ulang.</p>
                      </div>
                    )}

                    {/* Role specific dynamic alert */}
                    <div className="p-3 bg-violet-600/10 border border-violet-900/40 rounded-xl text-[10px] space-y-1">
                      <span className="font-bold text-violet-400 block uppercase tracking-wider">HAK AKSES AKTIF: {userRole}</span>
                      {userRole === 'DATA_ENTRY' && <p>Sebagai Data Entry, Anda dapat membuat dan mengedit draf karakter/card/skill/event.</p>}
                      {userRole === 'MODERATOR' && <p>Sebagai Moderator, Anda memiliki wewenang untuk Menyetujui atau Menolak draf di Review Center.</p>}
                      {userRole === 'ADMIN' && <p>Sebagai Admin, Anda memegang kendali penuh termasuk pengelolaan User Role, susunan hak akses, dan log audit sistem.</p>}
                    </div>
                  </div>
                )}

                {/* 4. FAQ */}
                {activeTab === 'faq' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white">Pertanyaan Sering Diajukan (FAQ)</h4>
                    <div className="space-y-3">
                      {FAQ_ITEMS.filter(item => matchesSearch(item.q) || matchesSearch(item.a)).map((item, i) => (
                        <div key={i} className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-1.5">
                          <span className="font-bold text-zinc-200 block">Q: {item.q}</span>
                          <p className="text-zinc-400 leading-relaxed">A: {item.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. SHORTCUTS */}
                {activeTab === 'shortcuts' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white">Pintasan Keyboard (Shortcuts)</h4>
                    <div className="space-y-2">
                      {KEYBOARD_SHORTCUTS.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-zinc-900/40 border border-zinc-900 rounded-xl">
                          <span className="text-zinc-300 font-semibold">{item.desc}</span>
                          <kbd className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-md font-mono text-[9px] font-bold text-violet-400">
                            {item.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. VIDEOS */}
                {activeTab === 'videos' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white">Tutorial Video</h4>
                    <div className="p-8 bg-zinc-900 border border-zinc-850 rounded-2xl text-center space-y-3">
                      <PlayCircle className="w-12 h-12 text-violet-400 mx-auto" />
                      <div className="space-y-1">
                        <span className="block font-bold text-zinc-200">Uma Trainer AI Overview (Video Guide)</span>
                        <p className="text-[10px] text-zinc-500">Durasi: 3 menit 45 detik • Pengantar dasar menu simulator dan planner.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. CHANGELOG */}
                {activeTab === 'changelog' && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white">Riwayat Versi (Changelog)</h4>
                    <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <strong className="text-zinc-200">v1.1.0 (Versi Terbaru)</strong>
                        <span className="text-[9px] text-zinc-500 font-semibold">Aktif</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-zinc-400">
                        <li>Integrasi sistem login Google OAuth otomatis.</li>
                        <li>Penambahan modul asisten Team Builder & Deck Optimizer.</li>
                        <li>Sistem navigasi interaktif Tooltips dan Guided Tour.</li>
                      </ul>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Footer Contact Admin */}
            <div className="p-3 border-t border-zinc-900 text-center text-[10px] text-zinc-500 bg-zinc-950 flex justify-between px-6 items-center">
              <span>UMA TRAINER AI • Enterprise Edition v1.1.0</span>
              <a href="mailto:admin@zenuma.com" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                Hubungi Admin Utama
              </a>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
