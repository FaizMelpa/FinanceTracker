import React, { useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { PageHeader, Button, ConfirmDialog, showToast } from '../components/UI'
import { formatDate, MONEFY_CAT_MAP } from '../utils/constants'
import * as XLSX from 'xlsx'

export default function BackupRestore({ navigate }) {
  const { state, dispatch } = useApp()
  const fileRef = useRef()
  const monefyRef = useRef()
  const [confirmRestore, setConfirmRestore] = useState(false)
  const [pendingRestore, setPendingRestore] = useState(null)
  const [confirmImport, setConfirmImport] = useState(false)
  const [pendingImport, setPendingImport] = useState(null)
  const [importing, setImporting] = useState(false)

  // ── BACKUP ────────────────────────────────────────────
  const handleBackup = () => {
    try {
      const wb = XLSX.utils.book_new()

      // Sheet 1: Transactions
      const txData = state.transactions.map(t => ({
        'ID': t.id,
        'Tipe': t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        'Jumlah': t.amount,
        'Kategori': t.category,
        'Akun': state.accounts.find(a => a.id === t.accountId)?.name || '',
        'Catatan': t.note || '',
        'Tanggal': formatDate(t.date),
        'Transfer': t.isTransfer ? 'Ya' : 'Tidak',
      }))
      const txSheet = XLSX.utils.json_to_sheet(txData)
      XLSX.utils.book_append_sheet(wb, txSheet, 'Transaksi')

      // Sheet 2: Accounts
      const accData = state.accounts.map(a => ({
        'ID': a.id,
        'Nama': a.name,
        'Tipe': a.type,
        'Saldo': a.balance,
        'Warna': a.color,
        'Icon': a.icon,
      }))
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(accData), 'Akun')

      // Sheet 3: Budgets
      const budgetData = state.budgets.map(b => ({
        'ID': b.id,
        'Kategori': b.category,
        'Limit': b.limit,
        'Periode': b.period,
      }))
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(budgetData), 'Anggaran')

      // Sheet 4: Debts
      const debtData = state.debts.map(d => ({
        'ID': d.id,
        'Nama': d.name,
        'Total': d.total,
        'Terbayar': d.paid,
        'Sisa': d.remaining,
        'Arah': d.direction,
        'Status': d.status,
        'Catatan': d.note || '',
        'Tanggal': d.date,
      }))
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(debtData.length ? debtData : [{}]), 'Hutang')

      // Sheet 5: Investments
      const invData = state.investments.map(i => ({
        'ID': i.id,
        'Nama': i.name,
        'Tipe': i.type,
        'Modal': i.modal,
        'Nilai Sekarang': i.currentValue,
        'Catatan': i.note || '',
        'Tanggal Mulai': i.startDate,
      }))
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invData.length ? invData : [{}]), 'Investasi')

      // Sheet 6: Raw JSON backup
      const rawSheet = XLSX.utils.json_to_sheet([{ data: JSON.stringify(state) }])
      XLSX.utils.book_append_sheet(wb, rawSheet, '_RAW_BACKUP')

      const now = new Date()
      const filename = `FinanceTracker_Backup_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}.xlsx`
      XLSX.writeFile(wb, filename)
      showToast('Backup berhasil diunduh!')
    } catch (e) {
      showToast('Gagal backup: ' + e.message, 'error')
    }
  }

  // ── RESTORE ───────────────────────────────────────────
  const handleRestoreFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'binary' })
        const rawSheet = wb.Sheets['_RAW_BACKUP']
        if (!rawSheet) { showToast('File backup tidak valid', 'error'); return }
        const raw = XLSX.utils.sheet_to_json(rawSheet)
        if (!raw[0]?.data) { showToast('File backup tidak valid', 'error'); return }
        const parsed = JSON.parse(raw[0].data)
        setPendingRestore(parsed)
        setConfirmRestore(true)
      } catch (e) {
        showToast('File tidak bisa dibaca', 'error')
      }
    }
    reader.readAsBinaryString(file)
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
        
        // Detect separator
        const sep = lines[0].includes(';') ? ';' : ','
        const headers = lines[0].split(sep).map(h => h.trim().replace(/"/g, '').toLowerCase())
        
        const transactions = []
        const accountNames = new Set()

        lines.slice(1).forEach(line => {
          const cols = line.split(sep).map(c => c.trim().replace(/"/g, ''))
          const row = {}
          headers.forEach((h, i) => row[h] = cols[i] || '')

          // Parse Monefy format
          // Common columns: date, account, category, amount, currency, description
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

          // Map category
          const mappedCat = MONEFY_CAT_MAP[categoryRaw] || (amount < 0 ? 'other_exp' : 'other_inc')
          const type = amount < 0 ? 'expense' : (typeRaw.includes('income') || typeRaw.includes('pemasukan') ? 'income' : amount > 0 && mappedCat.includes('salary') || mappedCat.includes('freelance') || mappedCat.includes('other_inc') ? 'income' : 'expense')

          let parsedDate
          try {
            parsedDate = new Date(dateRaw).toISOString()
            if (isNaN(new Date(dateRaw))) throw new Error()
          } catch {
            parsedDate = new Date().toISOString()
          }

          transactions.push({
            id: `monefy_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            type,
            amount: Math.abs(amount),
            category: mappedCat,
            accountId: accountRaw || 'Import',
            note: noteRaw,
            date: parsedDate,
            createdAt: new Date().toISOString(),
            importedFrom: 'monefy',
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
    // Add missing accounts
    const existingAccNames = state.accounts.map(a => a.name.toLowerCase())
    pendingImport.accountNames.forEach(name => {
      if (name && !existingAccNames.includes(name.toLowerCase())) {
        dispatch({
          type: 'ADD_ACC',
          payload: { id: `acc_${Date.now()}_${Math.random().toString(36).slice(2)}`, name, type: 'bank', icon: '🏦', color: '#4FC3F7', balance: 0, currency: 'IDR', createdAt: new Date().toISOString() }
        })
      }
    })

    // Map account names to IDs and import
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

  const lastBackup = state.transactions.length > 0
    ? formatDate(Math.max(...state.transactions.map(t => new Date(t.createdAt || t.date))))
    : null

  return (
    <div className="h-full flex flex-col bg-bg">
      <PageHeader title="Backup & Restore" onBack={() => navigate('dashboard')} />

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 pb-6">
        {/* Data Stats */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-5">
          <p className="text-white font-bold text-sm mb-3">📦 Data Tersimpan</p>
          <div className="grid grid-cols-3 gap-3">
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
          <div className="grid grid-cols-2 gap-3 mt-3">
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
              <p className="text-text-muted text-xs">Export ke file Excel (.xlsx)</p>
            </div>
          </div>
          <p className="text-text-muted text-xs mb-3">
            File akan tersimpan di folder Downloads HP lo. Simpan file ini dengan aman!
          </p>
          <Button onClick={handleBackup}>💾 Backup Sekarang</Button>
        </div>

        {/* Restore */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(79,195,247,0.15)' }}>
              <span style={{ fontSize: 22 }}>📂</span>
            </div>
            <div>
              <p className="text-white font-bold">Restore Data</p>
              <p className="text-text-muted text-xs">Pulihkan dari file backup Excel</p>
            </div>
          </div>
          <p className="text-text-muted text-xs mb-3">
            ⚠️ Data saat ini akan <span style={{ color: '#FF6B6B' }}>ditimpa</span> dengan data dari file backup.
          </p>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleRestoreFile} className="hidden" />
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>📂 Pilih File Backup</Button>
        </div>

        {/* Import dari Wallet Lain */}
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
          <p className="text-text-muted text-xs mb-3">
            Export data dari app lain dalam format CSV, lalu import di sini. Data akan <span style={{ color: '#00C896' }}>ditambahkan</span> ke data yang ada.
          </p>
          <div className="bg-elevated rounded-xl p-3 mb-3">
            <p className="text-text-sec text-xs font-semibold mb-1">Cara Export dari Monefy:</p>
            <p className="text-text-muted text-xs">Settings → Export → pilih format CSV → simpan file</p>
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
              'Backup secara rutin minimal seminggu sekali',
              'Simpan file backup di Google Drive atau cloud storage',
              'Jangan hapus file backup lama, simpan beberapa versi',
              'Setelah ganti HP, restore dari file backup terakhir',
            ].map((tip, i) => (
              <div key={i} className="flex gap-2">
                <span style={{ color: '#00C896', fontSize: 12, marginTop: 1 }}>•</span>
                <p className="text-text-muted text-xs">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Restore */}
      <ConfirmDialog
        show={confirmRestore}
        title="Restore Data?"
        message="Data saat ini akan ditimpa dengan data backup. Tindakan ini tidak bisa dibatalkan!"
        danger
        onConfirm={doRestore}
        onCancel={() => setConfirmRestore(false)} />

      {/* Confirm Import */}
      <ConfirmDialog
        show={confirmImport}
        title={`Import ${pendingImport?.transactions?.length || 0} Transaksi?`}
        message={`Data dari wallet lain akan ditambahkan ke data yang ada. Akun baru: ${pendingImport?.accountNames?.join(', ') || '-'}`}
        onConfirm={doImport}
        onCancel={() => setConfirmImport(false)} />
    </div>
  )
}
