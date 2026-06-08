import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatRp, formatRpShort, formatDate, INVESTMENT_TYPES, getInvestmentType } from '../utils/constants'
import { PageHeader, BottomSheet, Button, ProgressBar, EmptyState, ConfirmDialog, showToast } from '../components/UI'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const EMPTY_INV = { name: '', type: 'stock', modal: '', currentValue: '', note: '', startDate: new Date().toISOString().slice(0, 10) }

export default function Investments({ navigate }) {
  const { state, dispatch, getTotalInvestment } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(null)
  const [showUpdateValue, setShowUpdateValue] = useState(null)
  const [form, setForm] = useState(EMPTY_INV)
  const [newValue, setNewValue] = useState('')
  const [histForm, setHistForm] = useState({ type: 'setor', amount: '', note: '', date: new Date().toISOString().slice(0, 10) })
  const [deleteId, setDeleteId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const portfolio = getTotalInvestment()

  const pieData = state.investments.map(inv => {
    const t = getInvestmentType(inv.type)
    return { name: inv.name, value: inv.currentValue || 0, color: t.color }
  }).filter(d => d.value > 0)

  const handleSave = () => {
    if (!form.name || !form.modal) { showToast('Lengkapi data', 'error'); return }
    const modal = parseInt(form.modal.replace(/\D/g, ''))
    const currentValue = parseInt(form.currentValue.replace(/\D/g, '') || form.modal.replace(/\D/g, ''))
    dispatch({
      type: 'ADD_INV',
      payload: { id: Date.now().toString(), name: form.name, type: form.type, modal, currentValue, note: form.note, startDate: form.startDate, createdAt: new Date().toISOString() }
    })
    setForm(EMPTY_INV)
    setShowForm(false)
    showToast('Investasi ditambahkan!')
  }

  const handleUpdateValue = () => {
    if (!newValue) { showToast('Masukkan nilai', 'error'); return }
    const val = parseInt(newValue.replace(/\D/g, ''))
    dispatch({ type: 'UPDATE_INV', payload: { ...showUpdateValue, currentValue: val } })
    setShowUpdateValue(null)
    setNewValue('')
    showToast('Nilai diperbarui!')
  }

  const handleAddHistory = () => {
    if (!histForm.amount) { showToast('Masukkan jumlah', 'error'); return }
    const amount = parseInt(histForm.amount.replace(/\D/g, ''))
    const inv = showHistory
    // Update modal if setor
    if (histForm.type === 'setor') {
      dispatch({ type: 'UPDATE_INV', payload: { ...inv, modal: inv.modal + amount, currentValue: inv.currentValue + amount } })
    } else {
      dispatch({ type: 'UPDATE_INV', payload: { ...inv, currentValue: Math.max(0, inv.currentValue - amount) } })
    }
    dispatch({ type: 'ADD_INV_HISTORY', payload: { id: Date.now().toString(), investmentId: inv.id, ...histForm, amount, createdAt: new Date().toISOString() } })
    setHistForm({ type: 'setor', amount: '', note: '', date: new Date().toISOString().slice(0, 10) })
    setShowHistory(null)
    showToast('Riwayat dicatat!')
  }

  return (
    <div className="h-full flex flex-col bg-bg">
      <PageHeader title="Investasi" onBack={() => navigate('dashboard')} right={
        <button onClick={() => setShowForm(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center card-press"
          style={{ background: 'rgba(0,200,150,0.15)', border: 'none', color: '#00C896', fontSize: 22, cursor: 'pointer' }}>+</button>
      } />

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 pb-6">
        {/* Portfolio Summary */}
        <div className="rounded-3xl p-5 mb-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1E2235 0%, #22263A 100%)', border: '1px solid #2A2D3E' }}>
          <p className="text-text-muted text-xs mb-1">Total Portofolio</p>
          <p className="text-white font-black text-3xl mb-3">{formatRpShort(portfolio.totalNow)}</p>
          <div className="flex gap-4">
            <div><p className="text-text-muted text-xs">Modal</p><p className="text-white font-bold text-sm">{formatRpShort(portfolio.totalModal)}</p></div>
            <div><p className="text-text-muted text-xs">Profit/Loss</p>
              <p className="font-bold text-sm" style={{ color: portfolio.profit >= 0 ? '#00C896' : '#FF6B6B' }}>
                {portfolio.profit >= 0 ? '+' : ''}{formatRpShort(portfolio.profit)} ({portfolio.pct.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-4 mb-4">
            <p className="text-white font-bold text-sm mb-3">Alokasi Aset</p>
            <div className="flex items-center">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={pieData} cx={55} cy={55} innerRadius={30} outerRadius={55} dataKey="value" paddingAngle={3}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={v => formatRp(v)} contentStyle={{ background: '#22263A', border: '1px solid #2A2D3E', borderRadius: 10, color: '#fff', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 pl-3">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-text-sec text-xs">{d.name}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: d.color }}>
                      {portfolio.totalNow > 0 ? Math.round((d.value / portfolio.totalNow) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Investment list */}
        {state.investments.length === 0 ? (
          <EmptyState emoji="📈" title="Belum ada investasi" subtitle="Mulai catat portofolio investasi lo" action="Tambah Investasi" onAction={() => setShowForm(true)} />
        ) : (
          state.investments.map(inv => {
            const t = getInvestmentType(inv.type)
            const profit = inv.currentValue - inv.modal
            const pct = inv.modal > 0 ? (profit / inv.modal) * 100 : 0
            const isExpanded = expandedId === inv.id
            const history = state.investmentHistory.filter(h => h.investmentId === inv.id)
            return (
              <div key={inv.id} className="bg-card rounded-2xl border border-border p-4 mb-3">
                <div className="flex items-center justify-between mb-3" onClick={() => setExpandedId(isExpanded ? null : inv.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: t.color + '20' }}>
                      <span style={{ fontSize: 22 }}>{t.icon}</span>
                    </div>
                    <div>
                      <p className="text-white font-bold">{inv.name}</p>
                      <p className="text-text-muted text-xs">{t.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black">{formatRpShort(inv.currentValue)}</p>
                    <p className="text-xs font-bold" style={{ color: profit >= 0 ? '#00C896' : '#FF6B6B' }}>
                      {profit >= 0 ? '+' : ''}{formatRpShort(profit)} ({pct.toFixed(1)}%)
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mb-2">
                  <div><p className="text-text-muted text-xs">Modal</p><p className="text-white text-sm font-semibold">{formatRp(inv.modal)}</p></div>
                  <div className="text-right"><p className="text-text-muted text-xs">Nilai Sekarang</p><p className="text-white text-sm font-semibold">{formatRp(inv.currentValue)}</p></div>
                </div>

                <ProgressBar pct={Math.min(((inv.currentValue / inv.modal) * 100), 200)} color={profit >= 0 ? '#00C896' : '#FF6B6B'} />

                {isExpanded && (
                  <div className="mt-3 animate-fade-in">
                    {/* History */}
                    {history.length > 0 && (
                      <div className="p-3 rounded-xl mb-3" style={{ background: '#0F1117' }}>
                        <p className="text-text-sec text-xs font-semibold mb-2">Riwayat</p>
                        {history.slice(0, 5).map(h => (
                          <div key={h.id} className="flex justify-between py-1">
                            <span className="text-text-muted text-xs">{formatDate(h.date)} · {h.type === 'setor' ? '📥' : '📤'} {h.note || h.type}</span>
                            <span className="text-xs font-bold" style={{ color: h.type === 'setor' ? '#00C896' : '#FF6B6B' }}>
                              {h.type === 'setor' ? '+' : '-'}{formatRp(h.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button onClick={() => { setShowUpdateValue(inv); setNewValue(inv.currentValue.toString()) }}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold card-press"
                        style={{ background: 'rgba(255,204,2,0.15)', color: '#FFCC02', border: '1px solid rgba(255,204,2,0.2)', cursor: 'pointer' }}>
                        📝 Update Nilai
                      </button>
                      <button onClick={() => setShowHistory(inv)}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold card-press"
                        style={{ background: 'rgba(0,200,150,0.15)', color: '#00C896', border: '1px solid rgba(0,200,150,0.2)', cursor: 'pointer' }}>
                        💰 Setor/Tarik
                      </button>
                      <button onClick={() => setDeleteId(inv.id)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center card-press"
                        style={{ background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.2)', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Add Investment */}
      <BottomSheet show={showForm} onClose={() => setShowForm(false)} title="Tambah Investasi">
        <div className="p-4 space-y-4">
          <div>
            <p className="text-text-sec text-xs font-semibold mb-2">Nama</p>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Contoh: BBCA, Bitcoin, Reksa Dana X..."
              className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-text-muted" />
          </div>
          <div>
            <p className="text-text-sec text-xs font-semibold mb-2">Tipe</p>
            <div className="grid grid-cols-4 gap-2">
              {INVESTMENT_TYPES.map(t => (
                <button key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-2xl border-2 card-press"
                  style={{ borderColor: form.type === t.id ? t.color : '#2A2D3E', background: form.type === t.id ? t.color + '20' : '#1E2235', cursor: 'pointer' }}>
                  <span style={{ fontSize: 20 }}>{t.icon}</span>
                  <span style={{ color: form.type === t.id ? t.color : '#5A6080', fontSize: 9, fontWeight: 600, textAlign: 'center' }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-text-sec text-xs font-semibold mb-2">Modal Awal</p>
            <input type="text" inputMode="numeric" value={form.modal ? new Intl.NumberFormat('id-ID').format(parseInt(form.modal.replace(/\D/g,'') || 0)) : ''} onChange={e => setForm(f => ({ ...f, modal: e.target.value.replace(/\D/g,'') }))} placeholder="0"
              className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-text-muted" />
          </div>
          <div>
            <p className="text-text-sec text-xs font-semibold mb-2">Nilai Sekarang (opsional)</p>
            <input type="text" inputMode="numeric" value={form.currentValue ? new Intl.NumberFormat('id-ID').format(parseInt(form.currentValue.replace(/\D/g,'') || 0)) : ''} onChange={e => setForm(f => ({ ...f, currentValue: e.target.value.replace(/\D/g,'') }))} placeholder="Kosongkan jika sama dengan modal"
              className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-text-muted" />
          </div>
          <div>
            <p className="text-text-sec text-xs font-semibold mb-2">Tanggal Mulai</p>
            <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none" style={{ colorScheme: 'dark' }} />
          </div>
          <Button onClick={handleSave}>Simpan</Button>
        </div>
      </BottomSheet>

      {/* Update Value */}
      <BottomSheet show={!!showUpdateValue} onClose={() => setShowUpdateValue(null)} title="Update Nilai Investasi">
        <div className="p-4 space-y-4">
          <p className="text-text-sec text-sm">Masukkan nilai terkini dari <span className="text-white font-bold">{showUpdateValue?.name}</span></p>
          <input type="text" inputMode="numeric" value={newValue ? new Intl.NumberFormat('id-ID').format(parseInt(newValue.replace(/\D/g,'') || 0)) : ''} onChange={e => setNewValue(e.target.value.replace(/\D/g,''))} placeholder="0"
            className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-text-muted" />
          <Button onClick={handleUpdateValue}>Update</Button>
        </div>
      </BottomSheet>

      {/* History */}
      <BottomSheet show={!!showHistory} onClose={() => setShowHistory(null)} title="Setor / Tarik">
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            {['setor', 'tarik'].map(t => (
              <button key={t} onClick={() => setHistForm(f => ({ ...f, type: t }))}
                className="flex-1 py-2.5 rounded-2xl border-2 card-press text-sm font-bold"
                style={{ borderColor: histForm.type === t ? '#00C896' : '#2A2D3E', background: histForm.type === t ? 'rgba(0,200,150,0.15)' : 'transparent', color: histForm.type === t ? '#00C896' : '#A0A8C0', cursor: 'pointer' }}>
                {t === 'setor' ? '📥 Setor' : '📤 Tarik'}
              </button>
            ))}
          </div>
          <input type="text" inputMode="numeric" value={histForm.amount ? new Intl.NumberFormat('id-ID').format(parseInt(histForm.amount.replace(/\D/g,'') || 0)) : ''} onChange={e => setHistForm(f => ({ ...f, amount: e.target.value.replace(/\D/g,'') }))} placeholder="Jumlah"
            className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-text-muted" />
          <input type="date" value={histForm.date} onChange={e => setHistForm(f => ({ ...f, date: e.target.value }))}
            className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none" style={{ colorScheme: 'dark' }} />
          <input value={histForm.note} onChange={e => setHistForm(f => ({ ...f, note: e.target.value }))} placeholder="Catatan (opsional)"
            className="w-full bg-elevated border border-border rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-text-muted" />
          <Button onClick={handleAddHistory}>Simpan</Button>
        </div>
      </BottomSheet>

      <ConfirmDialog show={!!deleteId} title="Hapus Investasi" message="Riwayat investasi ini juga akan dihapus. Yakin?" danger onConfirm={() => { dispatch({ type: 'DELETE_INV', payload: deleteId }); setDeleteId(null); showToast('Dihapus') }} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
