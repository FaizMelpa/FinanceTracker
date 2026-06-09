import React, { useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { PageHeader, Button, ConfirmDialog, showToast } from '../components/UI'
import { MONEFY_CAT_MAP } from '../utils/constants'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

const isNative = () => {
  try { return !!(window.Capacitor?.isNativePlatform?.()) } catch { return false }
}

const getStamp = () => {
  const n = new Date()
  return `${n.getFullYear()}${String(n.getMonth()+1).padStart(2,'0')}${String(n.getDate()).padStart(2,'0')}_${String(n.getHours()).padStart(2,'0')}${String(n.getMinutes()).padStart(2,'0')}`
}

export default function BackupRestore({ navigate }) {
  const { state, dispatch } = useApp()
  const fileRef = useRef()
  const monefyRef = useRef()
  const [confirmRestore, setConfirmRestore] = useState(false)
  const [pendingRestore, setPendingRestore] = useState(null)
  const [confirmImport, setConfirmImport] = useState(false)
  const [pendingImport, setPendingImport] = useState(null)
  const [importing, setImporting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lastBackupPath, setLastBackupPath] = useState('')

  // ── BACKUP ────────────────────────────────────────────
  const handleBackup = async () => {
    setLoading(true)
    try {
      const filename = `FinanceTracker_Backup_${getStamp()}.json`
      const content = JSON.stringify({
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        data: state,
      }, null, 2)

      if (isNative()) {
        // Tulis langsung ke Download/FinanceTracker/
        try {
          // Buat folder dulu
          try {
            await Filesystem.mkdir({
              path: 'Download/FinanceTracker',
              directory: Directory.ExternalStorage,
              recursive: true,
            })
          } catch (_) { /* folder sudah ada */ }

          await Filesystem.writeFile({
            path: `Download/FinanceTracker/${filename}`,
            data: content,
            directory: Directory.ExternalStorage,
            encoding: Encoding.UTF8,
          })

          const path = `/storage/emulated/0/Download/FinanceTracker/${filename}`
          setLastBackupPath(path)
          showToast(`✅ Tersimpan!\n${path}`)
        } catch (e) {
          console.error('Filesystem write error:', e)
          // Fallback ke Documents jika ExternalStorage gagal
          try {
            await Filesystem.writeFile({
              path: `FinanceTracker/${filename}`,
              data: content,
              directory: Directory.Documents,
              encoding: Encoding.UTF8,
              recursive: true,
            })
            showToast('✅ Tersimpan di folder Documents!')
          } catch (e2) {
            // Last resort: browser download
            _browserDownload(content, filename)
            showToast('Backup didownload!')
          }
        }
      } else {
        _browserDownload(content, filename)
        showToast('Backup didownload! Cek folder Downloads.')
      }
    } catch (e) {
      showToast('Gagal backup: ' + e.message, 'error')
    }
    setLoading(false)
  }

  const _browserDownload = (content, filename) => {
    const blob = new Blob([content], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ── RESTORE ───────────────────────────────────────────
  const handleRestoreFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        const stateData = parsed.data || parsed
        if (!stateData.accounts) { showToast('File backup tidak valid', 'error'); return }
        setPendingRestore(stateData)
        setConfirmRestore(true)
      } catch (e) {
        showToast('File tidak bisa dibaca: ' + e.message, 'error')
      }
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  const doRestore = () => {
    dispatch({ type: 'RESTORE', payload: { ...pendingRestore, isLoaded: true } })
    setConfirmRestore(false)
    showToast('Data berhasil dipulihkan!')
    navigate('dashboard')
  }

  // ── IMPORT MONEFY CSV ─────────────────────────────────
  const handleMonefyFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImporting(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target.result
        const lines = text.split('\n').filter(l => l.trim())
        const sep = lines[0].includes(';') ? ';' : ','
        const headers = lines[0].split(sep).map(h => h.trim().replace(/"/g, '').toLowerCase())
        const transactions = []
        const accountNames = new Set()

        lines.slice(1).forEach(line => {
          const cols = line.split(sep).map(c => c.trim().replace(/"/g, ''))
          const row = {}
          headers.forEach((h, i) => row[h] = cols[i] || '')
          const dateRaw = row['date'] || row['tanggal'] || ''
          const accountRaw = row['account'] || row['akun'] || ''
          const categoryRaw = (row['category'] || row['kategori'] || '').toLowerCase()
          const amountRaw = row['amount'] || row['jumlah'] || '0'
          const noteRaw = row['description'] || row['catatan'] || row['note'] || ''
          const typeRaw = (row['type'] || row['tipe'] || '').toLowerCase()
          if (!dateRaw || !amountRaw) return
          const amount = parseFloat(amountRaw.replace(',', '.').replace(/[^\d.]/g, ''))
          if (isNaN(amount) || amount === 0) return
          accountNames.add(accountRaw || 'Import')
          const mappedCat = MONEFY_CAT_MAP[categoryRaw] || (amount < 0 ? 'other_exp' : 'other_inc')
          const type = amount < 0 ? 'expense' : (typeRaw.includes('income') || typeRaw.includes('pemasukan') ? 'income' : 'expense')
          let parsedDate
          try { parsedDate = new Date(dateRaw).toISOString(); if (isNaN(new Date(dateRaw))) throw new Error() }
          catch { parsedDate = new Date().toISOString() }
          transactions.push({
            id: `monefy_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            type, amount: Math.abs(amount), category: mappedCat,
            accountId: accountRaw || 'Import', note: noteRaw,
            date: parsedDate, createdAt: new Date().toISOString()
          })
        })

        setPendingImport({ transactions, accountNames: [...accountNames] })
        setConfirmImport(true)
        setImporting(false)
      } catch (e) {
        showToast('Gagal membaca file CSV', 'error')
        setImporting(false)
      }
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  const doImport = () => {
    if (!pendingImport) return
    const existingAccNames = state.accounts.map(a => a.name.toLowerCase())
    pendingImport.accountNames.forEach(name => {
      if (name && !existingAccNames.includes(name.toLowerCase())) {
        dispatch({ type: 'ADD_ACC', payload: { id: `acc_${Date.now()}_${Math.random().toString(36).slice(2)}`, name, type: 'bank', icon: '🏦', color: '#4FC3F7', balance: 0, currency: 'IDR', createdAt: new Date().toISOString() } })
      }
    })
    const allAccounts = [...state.accounts]
    const txsWithIds = pendingImport.transactions.map(tx => {
      const acc = allAccounts.find(a => a.name.toLowerCase() === (tx.accountId || '').toLowerCase())
      return { ...tx, accountId: acc?.id || state.accounts[0]?.id || 'acc1' }
    })
    dispatch({ type: 'BULK_ADD_TX', payload: txsWithIds })
    setConfirmImport(false)
    showToast(`${txsWithIds.length} transaksi berhasil diimpor!`)
    navigate('transactions')
  }

  return (
    <div className="h-full flex flex-col bg-bg">
      <PageHeader title="Backup & Restore" onBack={() => navigate('dashboard')} />

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 pb-6">
        {/* Stats */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-5">
          <p className="text-white font-bold text-sm mb-3">📦 Data Tersimpan</p>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {[
              { label: 'Transaksi', val: state.transactions.length, icon: '📋' },
              { label: 'Akun', val: state.accounts.length, icon: '🏦' },
              { label: 'Anggaran', val: state.budgets.length, icon: '💼' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <span style={{ fontSize: 24 }}>{s.icon}</span>
                <p className="text-white font-black text-xl mt-1">{s.val}</p>
                <p className="text-text-muted text-xs">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Hutang', val: state.debts.length, icon: '🤝' },
              { label: 'Investasi', val: state.investments.length, icon: '📈' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <span style={{ fontSize: 24 }}>{s.icon}</span>
                <p className="text-white font-black text-xl mt-1">{s.val}</p>
                <p className="text-text-muted text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Backup */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,200,150,0.15)' }}>
              <span style={{ fontSize: 22 }}>💾</span>
            </div>
            <div>
              <p className="text-white font-bold">Backup Data</p>
              <p className="text-text-muted text-xs">Simpan ke file .json</p>
            </div>
          </div>
          <div className="bg-elevated rounded-xl p-3 mb-3">
            <p className="text-text-sec text-xs font-semibold mb-1">📂 Lokasi di HP:</p>
            <p className="text-text-muted text-xs font-mono">/storage/emulated/0/Download/FinanceTracker/</p>
          </div>
          {lastBackupPath ? (
            <div className="bg-elevated rounded-xl p-3 mb-3 border" style={{ borderColor: '#00C896' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#00C896' }}>✅ Backup terakhir:</p>
              <p className="text-text-muted text-xs font-mono break-all">{lastBackupPath}</p>
            </div>
          ) : null}
          <Button onClick={handleBackup} disabled={loading}>
            {loading ? '⏳ Menyimpan...' : '💾 Backup Sekarang'}
          </Button>
        </div>

        {/* Restore */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(79,195,247,0.15)' }}>
              <span style={{ fontSize: 22 }}>📂</span>
            </div>
            <div>
              <p className="text-white font-bold">Restore Data</p>
              <p className="text-text-muted text-xs">Pulihkan dari file backup .json</p>
            </div>
          </div>
          <p className="text-text-muted text-xs mb-3">
            ⚠️ Pilih file <span style={{ color: '#00C896' }}>FinanceTracker_Backup_*.json</span>. Data saat ini akan <span style={{ color: '#FF6B6B' }}>ditimpa</span>.
          </p>
          <input ref={fileRef} type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>📂 Pilih File Backup</Button>
        </div>

        {/* Import CSV */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(206,147,216,0.15)' }}>
              <span style={{ fontSize: 22 }}>📤</span>
            </div>
            <div>
              <p className="text-white font-bold">Import dari Wallet Lain</p>
              <p className="text-text-muted text-xs">Monefy, Money Manager, dll (CSV)</p>
            </div>
          </div>
          <input ref={monefyRef} type="file" accept=".csv,.txt" onChange={handleMonefyFile} className="hidden" />
          <Button variant="secondary" onClick={() => monefyRef.current?.click()} disabled={importing}>
            {importing ? '⏳ Memproses...' : '📤 Pilih File CSV'}
          </Button>
        </div>

        {/* Tips */}
        <div className="bg-elevated rounded-2xl border border-border p-4">
          <p className="text-white font-bold text-sm mb-2">💡 Tips</p>
          <div className="space-y-2">
            {[
              'Backup rutin minimal seminggu sekali',
              'File tersimpan di Downloads/FinanceTracker/ di HP',
              'Pindah HP? Backup → kirim file ke HP baru → restore',
              'Untuk restore: tap tombol restore, cari file .json tadi',
            ].map((tip, i) => (
              <div key={i} className="flex gap-2">
                <span style={{ color: '#00C896', fontSize: 12, marginTop: 1 }}>•</span>
                <p className="text-text-muted text-xs">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog show={confirmRestore} title="Restore Data?" message="Data saat ini akan ditimpa dengan data backup. Tindakan ini tidak bisa dibatalkan!" danger onConfirm={doRestore} onCancel={() => setConfirmRestore(false)} />
      <ConfirmDialog show={confirmImport} title={`Import ${pendingImport?.transactions?.length || 0} Transaksi?`} message={`Data akan ditambahkan. Akun baru: ${pendingImport?.accountNames?.join(', ') || '-'}`} onConfirm={doImport} onCancel={() => setConfirmImport(false)} />
    </div>
  )
}
