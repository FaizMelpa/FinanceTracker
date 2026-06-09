import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { EXPENSE_CATS, INCOME_CATS, formatRp } from '../utils/constants'
import { Button, showToast } from '../components/UI'

export default function AddTransaction({ navigate, params = {} }) {
  const { state, dispatch } = useApp()
  const [type, setType] = useState(params.type === 'transfer' ? 'expense' : (params.type || 'expense'))
  const [isTransfer, setIsTransfer] = useState(params.type === 'transfer')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [accountId, setAccountId] = useState(state.accounts[0]?.id || '')
  const [toAccountId, setToAccountId] = useState(state.accounts[1]?.id || '')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16))

  const cats = type === 'income' ? INCOME_CATS : EXPENSE_CATS
  const selectedAcc = state.accounts.find(a => a.id === accountId)

  const handleAmountChange = (val) => setAmount(val.replace(/\D/g, ''))
  const displayAmount = amount ? new Intl.NumberFormat('id-ID').format(parseInt(amount)) : ''

  const handleSave = () => {
    if (!amount || parseInt(amount) === 0) { showToast('Masukkan jumlah', 'error'); return }
    if (!isTransfer && !category) { showToast('Pilih kategori', 'error'); return }
    if (!accountId) { showToast('Pilih akun', 'error'); return }

    const parsedAmount = parseInt(amount)
    const txDate = new Date(date).toISOString()

    if (isTransfer) {
      if (accountId === toAccountId) { showToast('Akun tujuan harus berbeda', 'error'); return }
      const fromAcc = state.accounts.find(a => a.id === accountId)
      const toAcc = state.accounts.find(a => a.id === toAccountId)
      dispatch({ type: 'TRANSFER', payload: { fromId: accountId, toId: toAccountId, amount: parsedAmount, note, date: txDate, fromName: fromAcc?.name, toName: toAcc?.name } })
      showToast('Transfer berhasil!')
    } else {
      dispatch({
        type: 'ADD_TX',
        payload: { id: Date.now().toString(), type, amount: parsedAmount, category, accountId, note, date: txDate, createdAt: new Date().toISOString() }
      })
      showToast(type === 'income' ? 'Pemasukan ditambahkan!' : 'Pengeluaran dicatat!')
    }
    navigate('transactions')
  }

  return (
    <div className="h-full flex flex-col bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border" style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}>
        <button onClick={() => navigate('dashboard')} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}>✕</button>
        <h1 className="text-white font-bold text-lg">Tambah Transaksi</h1>
        <button onClick={handleSave} style={{ background: 'none', border: 'none', color: '#00C896', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Simpan</button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-4">
        {/* Type Selector */}
        <div className="flex gap-2 mb-5">
          {[
            { key: 'expense',  label: '📤 Pengeluaran', color: '#FF6B6B' },
            { key: 'income',   label: '📥 Pemasukan',   color: '#00C896' },
            { key: 'transfer', label: '🔄 Transfer',    color: '#FFB347' },
          ].map(t => {
            const active = isTransfer ? t.key === 'transfer' : (!isTransfer && t.key === type)
            return (
              <button key={t.key} onClick={() => {
                if (t.key === 'transfer') { setIsTransfer(true) }
                else { setIsTransfer(false); setType(t.key); setCategory('') }
              }}
                className="flex-1 py-2.5 rounded-2xl border-2 card-press text-xs font-bold"
                style={{ borderColor: active ? t.color : '#2A2D3E', background: active ? t.color + '20' : 'transparent', color: active ? t.color : '#A0A8C0', cursor: 'pointer' }}>
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Amount */}
        <div className="bg-surface rounded-3xl border border-border p-5 mb-4">
          <p className="text-text-muted text-xs font-semibold mb-2">Jumlah</p>
          <div className="flex items-center gap-2">
            <span className="text-text-sec font-black text-2xl">Rp</span>
            <input type="text" inputMode="numeric" value={displayAmount}
              onChange={e => handleAmountChange(e.target.value.replace(/\D/g, ''))}
              placeholder="0" className="flex-1 bg-transparent text-white font-black outline-none placeholder-text-muted"
              style={{ fontSize: 38, minWidth: 0 }} autoFocus />
          </div>
        </div>

        {/* Account */}
        <div className="mb-4">
          <p className="text-text-sec text-xs font-semibold mb-2">{isTransfer ? 'Dari Akun' : 'Akun'}</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {state.accounts.map(acc => (
              <button key={acc.id} onClick={() => setAccountId(acc.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl border-2 card-press flex-shrink-0"
                style={{ borderColor: accountId === acc.id ? acc.color : '#2A2D3E', background: accountId === acc.id ? acc.color + '20' : 'transparent', cursor: 'pointer' }}>
                <span style={{ fontSize: 16 }}>{acc.icon}</span>
                <span style={{ color: accountId === acc.id ? acc.color : '#A0A8C0', fontSize: 12, fontWeight: 600 }}>{acc.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* To Account (transfer) */}
        {isTransfer && (
          <div className="mb-4">
            <p className="text-text-sec text-xs font-semibold mb-2">Ke Akun</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {state.accounts.filter(a => a.id !== accountId).map(acc => (
                <button key={acc.id} onClick={() => setToAccountId(acc.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl border-2 card-press flex-shrink-0"
                  style={{ borderColor: toAccountId === acc.id ? acc.color : '#2A2D3E', background: toAccountId === acc.id ? acc.color + '20' : 'transparent', cursor: 'pointer' }}>
                  <span style={{ fontSize: 16 }}>{acc.icon}</span>
                  <span style={{ color: toAccountId === acc.id ? acc.color : '#A0A8C0', fontSize: 12, fontWeight: 600 }}>{acc.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category */}
        {!isTransfer && (
          <div className="mb-4">
            <p className="text-text-sec text-xs font-semibold mb-2">Kategori</p>
            <div className="grid grid-cols-4 gap-2">
              {cats.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className="flex flex-col items-center gap-1 py-3 rounded-2xl border-2 card-press"
                  style={{ borderColor: category === cat.id ? cat.color : '#2A2D3E', background: category === cat.id ? cat.color + '20' : '#1E2235', cursor: 'pointer' }}>
                  <span style={{ fontSize: 22 }}>{cat.icon}</span>
                  <span style={{ color: category === cat.id ? cat.color : '#5A6080', fontSize: 9, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        <div className="mb-4">
          <p className="text-text-sec text-xs font-semibold mb-2">Catatan</p>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Tambahkan catatan..."
            className="w-full bg-surface border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-text-muted" />
        </div>

        {/* Date */}
        <div className="mb-4">
          <p className="text-text-sec text-xs font-semibold mb-2">Tanggal & Waktu</p>
          <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)}
            className="w-full bg-surface border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none"
            style={{ colorScheme: 'dark' }} />
        </div>

        {/* Balance info */}
        {selectedAcc && (
          <div className="mb-4 p-3 rounded-2xl" style={{ background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.2)' }}>
            <p style={{ color: '#00C896', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
              Saldo {selectedAcc.name}: {formatRp(selectedAcc.balance)}
            </p>
          </div>
        )}

        <Button onClick={handleSave}>Simpan Transaksi</Button>
      </div>
    </div>
  )
}
