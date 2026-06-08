import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatRp, formatRpShort, formatDate } from '../utils/constants'
import { PageHeader, BottomSheet, Button, ProgressBar, EmptyState, ConfirmDialog, showToast } from '../components/UI'

const EMPTY_DEBT = { name: '', total: '', direction: 'meminjamkan', note: '', date: new Date().toISOString().slice(0, 10), accountId: '' }

export default function Debts({ navigate }) {
  const { state, dispatch, getDebtStats } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [showPayForm, setShowPayForm] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState(null)
  const [payTab, setPayTab] = useState('bayar') // 'bayar' | 'tambah'
  const [form, setForm] = useState(EMPTY_DEBT)
  const [payForm, setPayForm] = useState({ amount: '', note: '', date: new Date().toISOString().slice(0, 10), accountId: '' })
  const [tambahForm, setTambahForm] = useState({ amount: '', note: '', date: new Date().toISOString().slice(0, 10), accountId: '' })
  const [tab, setTab] = useState('aktif')
  const [deleteId, setDeleteId] = useState(null)

  const stats = getDebtStats()
  const debts = state.debts.filter(d => tab === 'aktif' ? d.status !== 'lunas' : d.status === 'lunas')

  // ── Account Picker ────────────────────────────────────
  const AccountPicker = ({ value, onChange, label }) => (
    <div>
      <p className="text-text-sec text-xs font-semibold mb-2">{label}</p>
      <div className="space-y-2">
        {state.accounts.map(acc => (
          <button key={acc.id} onClick={() => onChange(acc.id)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 card-press text-left"
            style={{ borderColor: value === acc.id ? '#00C896' : '#2A2D3E', background: value === acc.id ? 'rgba(0,200,150,0.1)' : '#1E2235', cursor: 'pointer' }}>
            <span style={{ fontSize: 20 }}>{acc.icon}</span>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">{acc.name}</p>
              <p className="text-text-muted text-xs">{formatRp(acc.balance)}</p>
            </div>
            {value === acc.id && <span style={{ color: '#00C896' }}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  )

  // ── Save new debt ─────────────────────────────────────
  const handleSave = () => {
    if (!form.name || !form.total) { showToast('Lengkapi data', 'error'); return }
    if (!form.accountId) { showToast('Pilih akun', 'error'); return }
    const total = parseInt(form.total.replace(/\D/g, ''))
    dispatch({
      type: 'ADD_DEBT_WITH_TRANSFER',
      payload: {
        debt: { id: Date.now().toString(), name: form.name, total, remaining: total, paid: 0, direction: form.direction, note: form.note, date: form.date, accountId: form.accountId, payments: [], status: 'aktif', createdAt: new Date().toISOString() },
        accountId: form.accountId, amount: total, direction: form.direction, date: form.date,
      }
    })
    setForm(EMPTY_DEBT)
    setShowForm(false)
    showToast('Hutang ditambahkan!')
  }

  // ── Catat pembayaran ──────────────────────────────────
  const handlePay = () => {
    if (!payForm.amount) { showToast('Masukkan jumlah', 'error'); return }
    if (!payForm.accountId) { showToast('Pilih akun', 'error'); return }
    const amount = parseInt(payForm.amount.replace(/\D/g, ''))
    dispatch({ type: 'PAY_DEBT_WITH_TRANSFER', payload: { debtId: selectedDebt.id, amount, note: payForm.note, date: payForm.date, accountId: payForm.accountId } })
    setShowPayForm(false)
    showToast('Pembayaran dicatat!')
  }

  // ── Tambah hutang (nambah jumlah hutang yang ada) ─────
  const handleTambahHutang = () => {
    if (!tambahForm.amount) { showToast('Masukkan jumlah', 'error'); return }
    if (!tambahForm.accountId) { showToast('Pilih akun', 'error'); return }
    const amount = parseInt(tambahForm.amount.replace(/\D/g, ''))
    dispatch({
      type: 'TAMBAH_HUTANG',
      payload: { debtId: selectedDebt.id, amount, note: tambahForm.note, date: tambahForm.date, accountId: tambahForm.accountId, direction: selectedDebt.direction }
    })
    setShowPayForm(false)
    showToast('Hutang ditambahkan!')
  }

  const openPayForm = (debt) => {
    setSelectedDebt(debt)
    setPayTab('bayar')
    setPayForm({ amount: '', note: '', date: new Date().toISOString().slice(0, 10), accountId: debt.accountId || '' })
    setTambahForm({ amount: '', note: '', date: new Date().toISOString().slice(0, 10), accountId: debt.accountId || '' })
    setShowPayForm(true)
  }

  return (
    <div className="h-full flex flex-col bg-bg">
      <PageHeader title="Hutang Piutang" onBack={() => navigate('dashboard')} right={
        <button onClick={() => setShowForm(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center card-press"
          style={{ background: 'rgba(0,200,150,0.15)', border: 'none', color: '#00C896', fontSize: 22, cursor: 'pointer' }}>+</button>
      } />

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 pb-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-text-muted text-xs mb-1">💰 Piutang (dipinjamkan)</p>
            <p className="font-black text-lg" style={{ color: '#00C896' }}>{formatRpShort(stats.totalReceivable)}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-text-muted text-xs mb-1">🔴 Hutang (dipinjam)</p>
            <p className="font-black text-lg" style={{ color: '#FF6B6B' }}>{formatRpShort(stats.totalDebt)}</p>
          </div>
        </div>

        {/* Tab aktif/lunas */}
        <div className="flex bg-surface rounded-2xl border border-border p-1 mb-4">
          {['aktif', 'lunas'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-xl font-semibold text-sm card-press"
              style={{ background: tab === t ? '#22263A' : 'transparent', color: tab === t ? '#fff' : '#5A6080', border: 'none', cursor: 'pointer' }}>
              {t === 'aktif' ? '🔴 Aktif' : '✅ Lunas'}
            </button>
          ))}
        </div>

        {/* List */}
        {debts.length === 0 ? (
          <EmptyState emoji={tab === 'aktif' ? '🤝' : '✅'} title={tab === 'aktif' ? 'Tidak ada hutang aktif' : 'Belum ada yang lunas'} action={tab === 'aktif' ? 'Tambah Hutang' : undefined} onAction={() => setShowForm(true)} />
        ) : (
          debts.map(debt => {
            const pct = debt.total > 0 ? (debt.paid / debt.total) * 100 : 0
            const isMeminjamkan = debt.direction === 'meminjamkan'
            const acc = state.accounts.find(a => a.id === debt.accountId)
            return (
              <div key={debt.id} className="bg-card rounded-2xl border border-border p-4 mb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: isMeminjamkan ? 'rgba(0,200,150,0.15)' : 'rgba(255,107,107,0.15)' }}>
                      <span style={{ fontSize: 22 }}>{isMeminjamkan ? '💸' : '🤝'}</span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-base">{debt.name}</p>
                      <p className="text-xs font-semibold" style={{ color: isMeminjamkan ? '#00C896' : '#FF6B6B' }}>
                        {isMeminjamkan ? 'Lo meminjamkan' : 'Lo meminjam'}
                      </p>
                      {acc && <p className="text-text-muted text-xs mt-0.5">{acc.icon} {acc.name}</p>}
                    </div>
                  </div>
                  <button onClick={() => setDeleteId(debt.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
                </div>

                <div className="flex justify-between mb-2">
                  <div><p className="text-text-muted text-xs">Total</p><p className="text-white font-bold">{formatRp(debt.total)}</p></div>
                  <div className="text-right"><p className="text-text-muted text-xs">Sudah Dibayar</p><p className="font-bold" style={{ color: '#00C896' }}>{formatRp(debt.paid)}</p></div>
                  <div className="text-right"><p className="text-text-muted text-xs">Sisa</p><p className="font-bold" style={{ color: '#FF6B6B' }}>{formatRp(debt.remaining)}</p></div>
                </div>

                <ProgressBar pct={pct} color={isMeminjamkan ? '#00C896' : '#FF6B6B'} />
                <p className="text-text-muted text-xs mt-1 mb-3">{Math.round(pct)}% terbayar</p>

                {/* Riwayat */}
                {debt.payments?.length > 0 && (
                  <div className="mb-3 p-3 rounded-xl" style={{ background: '#0F1117' }}>
                    <p className="text-text-sec text-xs font-semibold mb-2">Riwayat</p>
                    {debt.payments.slice(-3).map(p => {
                      const pAcc = state.accounts.find(a => a.id === p.accountId)
                      return (
                        <div key={p.id} className="flex justify-between py-1">
                          <span className="text-text-muted text-xs">
                            {p.isTambah ? '➕' : '💰'} {formatDate(p.date)}{p.note ? ` · ${p.note}` : ''}{pAcc ? ` · ${pAcc.icon}${pAcc.name}` : ''}
                          </span>
                          <span className="text-xs font-bold" style={{ color: p.isTambah ? '#FF6B6B' : '#00C896' }}>
                            {p.isTambah ? '+Hutang' : '+Bayar'} {formatRp(p.amount)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {debt.note && <p className="text-text-muted text-xs mb-3">📝 {debt.note}</p>}

                {debt.status !== 'lunas' && (
                  <button onClick={() => openPayForm(debt)}
                    className="w-full py-2.5 rounded-xl font-bold text-sm card-press"
                    style={{ background: 'linear-gradient(135deg, #00C896, #00A87E)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    💰 Catat Pembayaran / Tambah Hutang
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* ── Tambah Hutang/Piutang Form ── */}
      <BottomSheet show={showForm} onClose={() => setShowForm(false)} title="Tambah Hutang/Piutang">
        <div className="p-4 space-y-4">
          <div>
            <p className="text-text-sec text-xs font-semibold mb-2">Jenis</p>
            <div className="flex gap-2">
              {[
                { key: 'meminjamkan', label: '💸 Gue meminjamkan', color: '#00C896' },
                { key: 'dipinjam', label: '🤝 Gue meminjam', color: '#FF6B6B' }
              ].map(d => (
                <button key={d.key} onClick={() => setForm(f => ({ ...f, direction: d.key }))}
                  className="flex-1 py-2.5 rounded-2xl border-2 card-press text-xs font-bold"
                  style={{ borderColor: form.direction === d.key ? d.color : '#2A2D3E', background: form.direction === d.key ? d.color + '20' : 'transparent', color: form.direction === d.key ? d.color : '#A0A8C0', cursor: 'pointer' }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <AccountPicker
            value={form.accountId}
            onChange={id => setForm(f => ({ ...f, accountId: id }))}
            label={form.direction === 'meminjamkan' ? '🏦 Dari Akun (uang keluar)' : '🏦 Ke Akun (uang masuk)'}
          />

          <div>
            <p className="text-text-sec text-xs font-semibold mb-2">Nama Orang</p>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama peminjam/pemberi..."
              className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-text-muted" />
          </div>

          <div>
            <p className="text-text-sec text-xs font-semibold mb-2">Jumlah</p>
            <input type="text" inputMode="numeric"
              value={form.total ? new Intl.NumberFormat('id-ID').format(parseInt(form.total.replace(/\D/g,'') || 0)) : ''}
              onChange={e => setForm(f => ({ ...f, total: e.target.value.replace(/\D/g,'') }))} placeholder="0"
              className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-text-muted" />
          </div>

          <div>
            <p className="text-text-sec text-xs font-semibold mb-2">Tanggal</p>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none" style={{ colorScheme: 'dark' }} />
          </div>

          <div>
            <p className="text-text-sec text-xs font-semibold mb-2">Catatan</p>
            <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Keterangan tambahan..."
              className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-text-muted" />
          </div>

          <Button onClick={handleSave}>Simpan</Button>
        </div>
      </BottomSheet>

      {/* ── Bayar / Tambah Hutang Form ── */}
      <BottomSheet show={showPayForm} onClose={() => setShowPayForm(false)} title={`${selectedDebt?.name || ''}`}>
        <div className="p-4">
          {/* Tab bayar vs tambah hutang */}
          <div className="flex bg-surface rounded-2xl border border-border p-1 mb-4">
            <button onClick={() => setPayTab('bayar')}
              className="flex-1 py-2 rounded-xl font-semibold text-sm card-press"
              style={{ background: payTab === 'bayar' ? '#22263A' : 'transparent', color: payTab === 'bayar' ? '#00C896' : '#5A6080', border: 'none', cursor: 'pointer' }}>
              💰 Catat Bayar
            </button>
            <button onClick={() => setPayTab('tambah')}
              className="flex-1 py-2 rounded-xl font-semibold text-sm card-press"
              style={{ background: payTab === 'tambah' ? '#22263A' : 'transparent', color: payTab === 'tambah' ? '#FF6B6B' : '#5A6080', border: 'none', cursor: 'pointer' }}>
              ➕ Tambah Hutang
            </button>
          </div>

          {payTab === 'bayar' ? (
            <div className="space-y-4">
              <p className="text-text-muted text-xs">Catat pembayaran dari <span className="text-white font-semibold">{selectedDebt?.name}</span></p>
              <AccountPicker
                value={payForm.accountId}
                onChange={id => setPayForm(f => ({ ...f, accountId: id }))}
                label="🏦 Akun Transfer"
              />
              <div>
                <p className="text-text-sec text-xs font-semibold mb-2">Jumlah Bayar</p>
                <input type="text" inputMode="numeric"
                  value={payForm.amount ? new Intl.NumberFormat('id-ID').format(parseInt(payForm.amount.replace(/\D/g,'') || 0)) : ''}
                  onChange={e => setPayForm(f => ({ ...f, amount: e.target.value.replace(/\D/g,'') }))} placeholder="0"
                  className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-text-muted" />
              </div>
              <div>
                <p className="text-text-sec text-xs font-semibold mb-2">Tanggal</p>
                <input type="date" value={payForm.date} onChange={e => setPayForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none" style={{ colorScheme: 'dark' }} />
              </div>
              <div>
                <p className="text-text-sec text-xs font-semibold mb-2">Catatan</p>
                <input value={payForm.note} onChange={e => setPayForm(f => ({ ...f, note: e.target.value }))} placeholder="Transfer, cash, dll..."
                  className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-text-muted" />
              </div>
              <Button onClick={handlePay}>Simpan Pembayaran</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-text-muted text-xs">Tambah jumlah hutang untuk <span className="text-white font-semibold">{selectedDebt?.name}</span> — misalnya dia ngutang lagi</p>
              <AccountPicker
                value={tambahForm.accountId}
                onChange={id => setTambahForm(f => ({ ...f, accountId: id }))}
                label={selectedDebt?.direction === 'meminjamkan' ? '🏦 Dari Akun (uang keluar lagi)' : '🏦 Ke Akun (uang masuk lagi)'}
              />
              <div>
                <p className="text-text-sec text-xs font-semibold mb-2">Jumlah Tambahan</p>
                <input type="text" inputMode="numeric"
                  value={tambahForm.amount ? new Intl.NumberFormat('id-ID').format(parseInt(tambahForm.amount.replace(/\D/g,'') || 0)) : ''}
                  onChange={e => setTambahForm(f => ({ ...f, amount: e.target.value.replace(/\D/g,'') }))} placeholder="0"
                  className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-text-muted" />
              </div>
              <div>
                <p className="text-text-sec text-xs font-semibold mb-2">Tanggal</p>
                <input type="date" value={tambahForm.date} onChange={e => setTambahForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none" style={{ colorScheme: 'dark' }} />
              </div>
              <div>
                <p className="text-text-sec text-xs font-semibold mb-2">Catatan</p>
                <input value={tambahForm.note} onChange={e => setTambahForm(f => ({ ...f, note: e.target.value }))} placeholder="Alasan tambahan hutang..."
                  className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-text-muted" />
              </div>
              <Button onClick={handleTambahHutang}>Tambah Hutang</Button>
            </div>
          )}
        </div>
      </BottomSheet>

      <ConfirmDialog show={!!deleteId} title="Hapus Hutang" message="Yakin ingin menghapus data hutang ini?" danger
        onConfirm={() => { dispatch({ type: 'DELETE_DEBT', payload: deleteId }); setDeleteId(null); showToast('Dihapus') }}
        onCancel={() => setDeleteId(null)} />
    </div>
  )
}
