import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { formatRp, formatRpShort, formatDate, formatTime, getCat } from '../utils/constants'
import { PageHeader, EmptyState, ConfirmDialog, showToast } from '../components/UI'

export default function Transactions({ navigate }) {
  const { state, dispatch } = useApp()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [deleteId, setDeleteId] = useState(null)
  const [expandedTx, setExpandedTx] = useState(null)

  const filtered = useMemo(() => {
    return state.transactions.filter(tx => {
      if (filter === 'income' && tx.type !== 'income') return false
      if (filter === 'expense' && tx.type !== 'expense') return false
      if (filter === 'transfer' && !tx.isTransfer) return false
      if (search) {
        const cat = getCat(tx.category, tx.type)
        const q = search.toLowerCase()
        return cat.label.toLowerCase().includes(q) || (tx.note || '').toLowerCase().includes(q)
      }
      return true
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [state.transactions, filter, search])

  // Group by date
  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach(tx => {
      const key = tx.date.split('T')[0]
      if (!map[key]) map[key] = []
      map[key].push(tx)
    })
    return Object.entries(map).sort((a, b) => new Date(b[0]) - new Date(a[0]))
  }, [filtered])

  const totalIncome = filtered.filter(t => t.type === 'income' && !t.isTransfer).reduce((s, t) => s + t.amount, 0)
  const totalExpense = filtered.filter(t => t.type === 'expense' && !t.isTransfer).reduce((s, t) => s + t.amount, 0)

  const handleDelete = () => {
    dispatch({ type: 'DELETE_TX', payload: deleteId })
    setDeleteId(null)
    showToast('Transaksi dihapus')
  }

  return (
    <div className="h-full flex flex-col bg-bg">
      <PageHeader title="Transaksi" right={
        <button onClick={() => navigate('add-tx', { type: 'expense' })}
          className="w-9 h-9 rounded-full flex items-center justify-center card-press"
          style={{ background: 'rgba(0,200,150,0.15)', border: 'none', color: '#00C896', fontSize: 22, cursor: 'pointer' }}>+</button>
      } />

      <div className="flex-1 overflow-y-auto scrollbar-none">
        <div className="px-4">
          {/* Summary */}
          <div className="flex bg-surface rounded-2xl border border-border mb-3 overflow-hidden">
            {[
              { label: 'Pemasukan', val: totalIncome, color: '#00C896' },
              { label: 'Pengeluaran', val: totalExpense, color: '#FF6B6B' },
              { label: 'Selisih', val: totalIncome - totalExpense, color: totalIncome - totalExpense >= 0 ? '#00C896' : '#FF6B6B' },
            ].map((s, i) => (
              <div key={i} className={`flex-1 py-3 text-center ${i < 2 ? 'border-r border-border' : ''}`}>
                <p className="text-text-muted text-xs mb-1">{s.label}</p>
                <p className="font-bold text-xs" style={{ color: s.color }}>{formatRpShort(Math.abs(s.val))}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-surface border border-border rounded-2xl px-4 py-3 mb-3">
            <span style={{ fontSize: 16 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari transaksi..."
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-text-muted" />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#5A6080', cursor: 'pointer', fontSize: 16 }}>✕</button>}
          </div>

          {/* Filter */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-3">
            {[
              { key: 'all', label: 'Semua' },
              { key: 'expense', label: '📤 Pengeluaran' },
              { key: 'income', label: '📥 Pemasukan' },
              { key: 'transfer', label: '🔄 Transfer' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="px-4 py-2 rounded-full border-2 card-press flex-shrink-0"
                style={{ borderColor: filter === f.key ? '#00C896' : '#2A2D3E', background: filter === f.key ? 'rgba(0,200,150,0.15)' : 'transparent', color: filter === f.key ? '#00C896' : '#A0A8C0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction List */}
        {grouped.length === 0 ? (
          <EmptyState emoji="💸" title="Tidak ada transaksi" subtitle="Coba ubah filter atau tambah transaksi baru" />
        ) : (
          grouped.map(([dateKey, txs]) => {
            const dayTotal = txs.filter(t => !t.isTransfer).reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0)
            return (
              <div key={dateKey} className="px-4 mb-2">
                <div className="flex items-center justify-between py-2">
                  <p className="text-text-sec text-xs font-semibold">{formatDate(dateKey)}</p>
                  <p className="text-xs font-bold" style={{ color: dayTotal >= 0 ? '#00C896' : '#FF6B6B' }}>
                    {dayTotal >= 0 ? '+' : ''}{formatRpShort(dayTotal)}
                  </p>
                </div>
                {txs.map(tx => {
                  const cat = getCat(tx.category, tx.type)
                  const acc = state.accounts.find(a => a.id === tx.accountId)
                  const isExpanded = expandedTx === tx.id
                  return (
                    <div key={tx.id}>
                      <div className="flex items-center gap-3 py-3 border-b border-border/40 card-press"
                        onClick={() => setExpandedTx(isExpanded ? null : tx.id)}
                        onContextMenu={e => { e.preventDefault(); setDeleteId(tx.id) }}>
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: cat.color + '20' }}>
                          <span style={{ fontSize: 20 }}>{tx.isTransfer ? '🔄' : cat.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{tx.isTransfer ? tx.note : cat.label}</p>
                          <p className="text-text-muted text-xs mt-0.5 truncate">{acc?.name}{!tx.isTransfer && tx.note ? ` · ${tx.note}` : ''}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-sm" style={{ color: tx.type === 'income' ? '#00C896' : '#FF6B6B' }}>
                            {tx.type === 'income' ? '+' : '-'}{formatRpShort(tx.amount)}
                          </p>
                          <p className="text-text-muted text-xs mt-0.5">{formatTime(tx.date)}</p>
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="bg-surface rounded-2xl p-4 mb-2 border border-border animate-fade-in">
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div><p className="text-text-muted text-xs">Jumlah</p><p className="text-white font-bold text-sm">{formatRp(tx.amount)}</p></div>
                            <div><p className="text-text-muted text-xs">Akun</p><p className="text-white font-bold text-sm">{acc?.name || '-'}</p></div>
                            <div><p className="text-text-muted text-xs">Kategori</p><p className="text-white font-bold text-sm">{cat.icon} {cat.label}</p></div>
                            <div><p className="text-text-muted text-xs">Tanggal</p><p className="text-white font-bold text-sm">{formatDate(tx.date)}</p></div>
                            {tx.note && <div className="col-span-2"><p className="text-text-muted text-xs">Catatan</p><p className="text-white font-bold text-sm">{tx.note}</p></div>}
                          </div>
                          {tx.struk && (
                            <div className="mb-3">
                              <p className="text-text-muted text-xs mb-2">Foto Struk</p>
                              <img src={tx.struk} alt="struk" className="w-full rounded-xl object-cover" style={{ maxHeight: 200 }} />
                            </div>
                          )}
                          <button onClick={() => setDeleteId(tx.id)}
                            className="w-full py-2.5 rounded-xl text-expense font-semibold text-sm card-press"
                            style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', cursor: 'pointer' }}>
                            🗑️ Hapus Transaksi
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })
        )}
        <div className="h-6" />
      </div>

      <ConfirmDialog show={!!deleteId} title="Hapus Transaksi" message="Saldo akun akan dikembalikan. Yakin ingin menghapus?" danger onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
