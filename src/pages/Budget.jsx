import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatRp, formatRpShort, EXPENSE_CATS } from '../utils/constants'
import { PageHeader, BottomSheet, Button, ProgressBar, EmptyState, ConfirmDialog, showToast } from '../components/UI'

export default function Budget({ navigate }) {
  const { state, dispatch, getBudgetStatus } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editBudget, setEditBudget] = useState(null)
  const [form, setForm] = useState({ category: '', limit: '' })
  const [deleteId, setDeleteId] = useState(null)

  const budgets = getBudgetStatus()
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const usedCats = budgets.map(b => b.category)

  const openAdd = () => {
    setEditBudget(null)
    setForm({ category: '', limit: '' })
    setShowForm(true)
  }

  const openEdit = (b) => {
    setEditBudget(b)
    setForm({ category: b.category, limit: b.limit.toString() })
    setShowForm(true)
  }

  const handleSave = () => {
    if (!form.category || !form.limit) { showToast('Lengkapi data', 'error'); return }
    const limit = parseInt(form.limit.replace(/\D/g, ''))
    if (!limit) { showToast('Limit tidak valid', 'error'); return }

    if (editBudget) {
      dispatch({ type: 'UPDATE_BUDGET', payload: { ...editBudget, category: form.category, limit } })
      showToast('Anggaran diperbarui!')
    } else {
      dispatch({ type: 'ADD_BUDGET', payload: { id: Date.now().toString(), category: form.category, limit, period: 'monthly' } })
      showToast('Anggaran ditambahkan!')
    }
    setShowForm(false)
  }

  const availableCats = EXPENSE_CATS.filter(c => !usedCats.includes(c.id) || c.id === editBudget?.category)

  return (
    <div className="h-full flex flex-col bg-bg">
      <PageHeader title="Anggaran" right={
        <button onClick={openAdd}
          className="w-9 h-9 rounded-full flex items-center justify-center card-press"
          style={{ background: 'rgba(0,200,150,0.15)', border: 'none', color: '#00C896', fontSize: 22, cursor: 'pointer' }}>+</button>
      } />

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 pb-6">
        {/* Overview */}
        <div className="bg-card rounded-3xl border border-border p-5 mb-4">
          <p className="text-text-muted text-xs mb-1">Total Anggaran Bulan Ini</p>
          <p className="text-white font-black text-3xl mb-3">{formatRp(totalLimit)}</p>
          <div className="flex justify-between mb-3">
            <div><p className="text-text-muted text-xs">Terpakai</p><p className="font-bold text-sm" style={{ color: '#FF6B6B' }}>{formatRpShort(totalSpent)}</p></div>
            <div><p className="text-text-muted text-xs">Tersisa</p><p className="font-bold text-sm" style={{ color: '#00C896' }}>{formatRpShort(totalLimit - totalSpent)}</p></div>
            <div><p className="text-text-muted text-xs">Persentase</p><p className="font-bold text-sm" style={{ color: '#FFB347' }}>{totalLimit ? Math.round((totalSpent / totalLimit) * 100) : 0}%</p></div>
          </div>
          <ProgressBar pct={totalLimit ? (totalSpent / totalLimit) * 100 : 0} />
        </div>

        {/* Budget List */}
        {budgets.length === 0 ? (
          <EmptyState emoji="📊" title="Belum ada anggaran" subtitle="Buat anggaran untuk kontrol pengeluaran" action="Buat Anggaran" onAction={openAdd} />
        ) : (
          budgets.map(b => {
            const cat = EXPENSE_CATS.find(c => c.id === b.category)
            if (!cat) return null
            const isOver = b.pct > 100
            const isWarn = b.pct > 75 && !isOver
            const barColor = isOver ? '#FF6B6B' : isWarn ? '#FFB347' : '#00C896'
            return (
              <div key={b.id} className="bg-card rounded-2xl border border-border p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: cat.color + '20' }}>
                      <span style={{ fontSize: 22 }}>{cat.icon}</span>
                    </div>
                    <div>
                      <p className="text-white font-bold">{cat.label}</p>
                      <p className="text-text-muted text-xs">{formatRp(b.spent)} / {formatRp(b.limit)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(b)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✏️</button>
                    <button onClick={() => setDeleteId(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
                  </div>
                </div>

                <ProgressBar pct={b.pct} color={barColor} />

                <div className="flex justify-between mt-2">
                  <p className="text-xs font-semibold" style={{ color: barColor }}>{Math.round(b.pct)}% terpakai</p>
                  <p className="text-xs font-semibold" style={{ color: isOver ? '#FF6B6B' : '#00C896' }}>
                    {isOver ? `Lebih ${formatRp(Math.abs(b.remaining))}` : `Sisa ${formatRp(b.remaining)}`}
                  </p>
                </div>

                {isOver && (
                  <div className="flex items-center gap-2 mt-2 p-2 rounded-xl" style={{ background: 'rgba(255,107,107,0.1)' }}>
                    <span style={{ fontSize: 12 }}>⚠️</span>
                    <span style={{ color: '#FF6B6B', fontSize: 11, fontWeight: 600 }}>Anggaran terlampaui!</span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Form */}
      <BottomSheet show={showForm} onClose={() => setShowForm(false)} title={editBudget ? 'Edit Anggaran' : 'Tambah Anggaran'}>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-text-sec text-xs font-semibold mb-2">Kategori</p>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto scrollbar-none">
              {availableCats.map(cat => (
                <button key={cat.id} onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-2xl border-2 card-press"
                  style={{ borderColor: form.category === cat.id ? cat.color : '#2A2D3E', background: form.category === cat.id ? cat.color + '20' : '#1E2235', cursor: 'pointer' }}>
                  <span style={{ fontSize: 20 }}>{cat.icon}</span>
                  <span style={{ color: form.category === cat.id ? cat.color : '#5A6080', fontSize: 9, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-text-sec text-xs font-semibold mb-2">Limit Bulanan</p>
            <input type="text" inputMode="numeric"
              value={form.limit ? new Intl.NumberFormat('id-ID').format(parseInt(form.limit.replace(/\D/g,'') || 0)) : ''}
              onChange={e => setForm(f => ({ ...f, limit: e.target.value.replace(/\D/g,'') }))}
              placeholder="0"
              className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-text-muted" />
          </div>
          <Button onClick={handleSave}>Simpan</Button>
        </div>
      </BottomSheet>

      <ConfirmDialog show={!!deleteId} title="Hapus Anggaran" message="Yakin ingin menghapus anggaran ini?" danger
        onConfirm={() => { dispatch({ type: 'DELETE_BUDGET', payload: deleteId }); setDeleteId(null); showToast('Dihapus') }}
        onCancel={() => setDeleteId(null)} />
    </div>
  )
}
