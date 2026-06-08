import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatRp, formatRpShort, ACCOUNT_TYPES, ACCOUNT_COLORS, getAccountType } from '../utils/constants'
import { PageHeader, BottomSheet, Button, EmptyState, ConfirmDialog, showToast } from '../components/UI'

const EMPTY_FORM = { name: '', type: 'cash', balance: '', color: ACCOUNT_COLORS[0] }

export default function Accounts({ navigate }) {
  const { state, dispatch, getTotalBalance } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [showAdjust, setShowAdjust] = useState(false)
  const [editAcc, setEditAcc] = useState(null)
  const [adjustAcc, setAdjustAcc] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [adjustAmount, setAdjustAmount] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  const total = getTotalBalance()

  const openAdd = () => {
    setEditAcc(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (acc) => {
    setEditAcc(acc)
    setForm({ name: acc.name, type: acc.type, balance: acc.balance.toString(), color: acc.color })
    setShowForm(true)
  }

  const openAdjust = (acc) => {
    setAdjustAcc(acc)
    setAdjustAmount(acc.balance.toString())
    setShowAdjust(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) { showToast('Masukkan nama akun', 'error'); return }
    const typeObj = ACCOUNT_TYPES.find(t => t.id === form.type)
    if (editAcc) {
      dispatch({ type: 'UPDATE_ACC', payload: { ...editAcc, name: form.name.trim(), type: form.type, color: form.color, icon: typeObj?.icon || '💰' } })
      showToast('Akun diperbarui!')
    } else {
      const balance = parseInt(form.balance.replace(/\D/g, '') || '0')
      dispatch({ type: 'ADD_ACC', payload: { id: Date.now().toString(), name: form.name.trim(), type: form.type, icon: typeObj?.icon || '💰', color: form.color, balance, currency: 'IDR', createdAt: new Date().toISOString() } })
      showToast('Akun ditambahkan!')
    }
    setShowForm(false)
  }

  const handleAdjustBalance = () => {
    const newBalance = parseInt(adjustAmount.replace(/\D/g, '') || '0')
    dispatch({ type: 'UPDATE_ACC', payload: { ...adjustAcc, balance: newBalance } })
    setShowAdjust(false)
    showToast('Saldo diperbarui!')
  }

  // Move account up/down
  const moveAccount = (index, dir) => {
    const accounts = [...state.accounts]
    const swapIdx = index + dir
    if (swapIdx < 0 || swapIdx >= accounts.length) return
    ;[accounts[index], accounts[swapIdx]] = [accounts[swapIdx], accounts[index]]
    dispatch({ type: 'REORDER_ACCOUNTS', payload: accounts })
  }

  const grouped = ACCOUNT_TYPES.map(t => ({
    ...t,
    accounts: state.accounts.filter(a => a.type === t.id)
  })).filter(g => g.accounts.length > 0)

  return (
    <div className="h-full flex flex-col bg-bg">
      <PageHeader title="Akun" right={
        <button onClick={openAdd}
          className="w-9 h-9 rounded-full flex items-center justify-center card-press"
          style={{ background: 'rgba(0,200,150,0.15)', border: 'none', color: '#00C896', fontSize: 22, cursor: 'pointer' }}>+</button>
      } />

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 pb-6">
        {/* Net Worth */}
        <div className="rounded-3xl p-5 mb-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #00C896 0%, #00A87E 100%)', boxShadow: '0 8px 32px rgba(0,200,150,0.3)' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10" style={{ background: '#fff' }} />
          <p className="text-white/70 text-xs mb-1">Total Kekayaan Bersih</p>
          <p className="text-white font-black text-4xl mb-1">{formatRp(total)}</p>
          <p className="text-white/70 text-xs">{state.accounts.length} akun terhubung</p>
        </div>

        {/* Distribution */}
        {grouped.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-4 mb-4">
            <p className="text-white font-bold text-sm mb-3">Distribusi per Tipe</p>
            {grouped.map(g => {
              const groupTotal = g.accounts.reduce((s, a) => s + a.balance, 0)
              const pct = total > 0 ? (groupTotal / total) * 100 : 0
              return (
                <div key={g.id} className="flex items-center gap-3 mb-3">
                  <span style={{ fontSize: 20 }}>{g.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-text-sec text-xs font-semibold">{g.label}</span>
                      <span className="font-bold text-xs" style={{ color: g.color }}>{formatRpShort(groupTotal)}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#2A2D3E' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: g.color }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Account List */}
        {state.accounts.length === 0 ? (
          <EmptyState emoji="🏦" title="Belum ada akun" subtitle="Tambahkan akun bank, e-wallet, atau tunai" action="Tambah Akun" onAction={openAdd} />
        ) : (
          <>
            <p className="text-text-muted text-xs mb-2 px-1">Tap untuk edit · Tahan ↑↓ untuk atur urutan</p>
            {state.accounts.map((acc, index) => {
              const typeObj = getAccountType(acc.type)
              return (
                <div key={acc.id} className="flex items-center gap-2 mb-3">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveAccount(index, -1)} disabled={index === 0}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                      style={{ background: index === 0 ? '#1A1D27' : '#22263A', color: index === 0 ? '#3A3D4E' : '#A0A8C0', border: 'none', cursor: index === 0 ? 'default' : 'pointer' }}>▲</button>
                    <button onClick={() => moveAccount(index, 1)} disabled={index === state.accounts.length - 1}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                      style={{ background: index === state.accounts.length - 1 ? '#1A1D27' : '#22263A', color: index === state.accounts.length - 1 ? '#3A3D4E' : '#A0A8C0', border: 'none', cursor: index === state.accounts.length - 1 ? 'default' : 'pointer' }}>▼</button>
                  </div>

                  {/* Card */}
                  <div className="flex-1 flex items-center gap-3 bg-card rounded-2xl border border-border p-4 card-press" onClick={() => openEdit(acc)}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: acc.color + '20' }}>
                      <span style={{ fontSize: 24 }}>{acc.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold">{acc.name}</p>
                      <p className="text-text-muted text-xs mt-0.5">{typeObj.label}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-base" style={{ color: acc.balance >= 0 ? acc.color : '#FF6B6B' }}>{formatRp(acc.balance)}</p>
                      <div className="flex gap-2 mt-1 justify-end">
                        <button onClick={e => { e.stopPropagation(); openAdjust(acc) }}
                          className="text-xs px-2 py-0.5 rounded-lg card-press"
                          style={{ background: 'rgba(0,200,150,0.15)', color: '#00C896', border: 'none', cursor: 'pointer' }}>
                          ✏️ Edit Saldo
                        </button>
                        <button onClick={e => { e.stopPropagation(); setDeleteId(acc.id) }}
                          className="text-text-muted text-xs card-press"
                          style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* Edit Akun Form */}
      <BottomSheet show={showForm} onClose={() => setShowForm(false)} title={editAcc ? 'Edit Akun' : 'Tambah Akun'}>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-text-sec text-xs font-semibold mb-2">Nama Akun</p>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Contoh: BCA, GoPay, Dompet..."
              className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-text-muted" />
          </div>
          <div>
            <p className="text-text-sec text-xs font-semibold mb-2">Tipe</p>
            <div className="grid grid-cols-4 gap-2">
              {ACCOUNT_TYPES.map(t => (
                <button key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-2xl border-2 card-press"
                  style={{ borderColor: form.type === t.id ? t.color : '#2A2D3E', background: form.type === t.id ? t.color + '20' : '#1E2235', cursor: 'pointer' }}>
                  <span style={{ fontSize: 20 }}>{t.icon}</span>
                  <span style={{ color: form.type === t.id ? t.color : '#5A6080', fontSize: 9, fontWeight: 600, textAlign: 'center' }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          {!editAcc && (
            <div>
              <p className="text-text-sec text-xs font-semibold mb-2">Saldo Awal</p>
              <input type="text" inputMode="numeric"
                value={form.balance ? new Intl.NumberFormat('id-ID').format(parseInt(form.balance.replace(/\D/g,'') || 0)) : ''}
                onChange={e => setForm(f => ({ ...f, balance: e.target.value.replace(/\D/g,'') }))}
                placeholder="0"
                className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-text-muted" />
            </div>
          )}
          <div>
            <p className="text-text-sec text-xs font-semibold mb-2">Warna</p>
            <div className="flex gap-2 flex-wrap">
              {ACCOUNT_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-8 h-8 rounded-full card-press"
                  style={{ background: c, border: form.color === c ? '3px solid #fff' : '3px solid transparent', cursor: 'pointer' }} />
              ))}
            </div>
          </div>
          <Button onClick={handleSave}>Simpan</Button>
        </div>
      </BottomSheet>

      {/* Edit Saldo Form */}
      <BottomSheet show={showAdjust} onClose={() => setShowAdjust(false)} title={`Edit Saldo — ${adjustAcc?.name}`}>
        <div className="p-4 space-y-4">
          <p className="text-text-muted text-xs">Masukkan saldo terbaru untuk akun <span className="text-white font-semibold">{adjustAcc?.name}</span>. Ini tidak akan membuat transaksi baru.</p>
          <div>
            <p className="text-text-sec text-xs font-semibold mb-2">Saldo Baru</p>
            <input type="text" inputMode="numeric"
              value={adjustAmount ? new Intl.NumberFormat('id-ID').format(parseInt(adjustAmount.replace(/\D/g,'') || 0)) : ''}
              onChange={e => setAdjustAmount(e.target.value.replace(/\D/g,''))}
              placeholder="0"
              className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-text-muted" />
          </div>
          <Button onClick={handleAdjustBalance}>Simpan Saldo</Button>
        </div>
      </BottomSheet>

      <ConfirmDialog show={!!deleteId} title="Hapus Akun" message="Semua transaksi di akun ini juga akan dihapus. Yakin?" danger
        onConfirm={() => { dispatch({ type: 'DELETE_ACC', payload: deleteId }); setDeleteId(null); showToast('Akun dihapus') }}
        onCancel={() => setDeleteId(null)} />
    </div>
  )
}
