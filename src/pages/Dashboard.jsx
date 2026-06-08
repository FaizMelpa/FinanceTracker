import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatRp, formatRpShort, formatDateShort, MONTHS, getCat } from '../utils/constants'
import { Card, EmptyState } from '../components/UI'

export default function Dashboard({ navigate }) {
  const { state, getTotalBalance, getMonthlyStats } = useApp()
  const [hideBalance, setHideBalance] = useState(state.settings.hideBalance)
  const now = new Date()
  const { income, expense } = getMonthlyStats(now)
  const total = getTotalBalance()
  const recent = state.transactions.filter(t => !t.isTransfer).slice(0, 6)

  const mask = (val) => hideBalance ? '••••••' : formatRp(val)
  const maskShort = (val) => hideBalance ? '•••' : formatRpShort(val)

  return (
    <div className="h-full overflow-y-auto scrollbar-none pb-4">
      {/* Header */}
      <div className="px-4 pt-safe-top" style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-text-muted text-xs">Selamat datang 👋</p>
            <h1 className="text-white font-black text-xl">{MONTHS[now.getMonth()]} {now.getFullYear()}</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setHideBalance(!hideBalance)}
              className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center card-press"
              style={{ border: 'none', cursor: 'pointer' }}>
              <span style={{ fontSize: 16 }}>{hideBalance ? '🙈' : '👁️'}</span>
            </button>
            <button onClick={() => navigate('about')}
              className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center card-press"
              style={{ border: 'none', cursor: 'pointer' }}>
              <span style={{ fontSize: 16 }}>⚙️</span>
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="rounded-3xl p-5 mb-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #00C896 0%, #00A87E 100%)', boxShadow: '0 8px 32px rgba(0,200,150,0.35)' }}>
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10" style={{ background: '#fff' }} />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10" style={{ background: '#fff' }} />

          <p className="text-white/70 text-xs mb-1">Total Saldo</p>
          <p className="text-white font-black text-4xl mb-4 tracking-tight">{mask(total)}</p>

          <div className="flex gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.25)' }}>
                <span style={{ fontSize: 14 }}>⬇️</span>
              </div>
              <div>
                <p className="text-white/70 text-xs">Pemasukan</p>
                <p className="text-white font-bold text-sm">{maskShort(income)}</p>
              </div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <span style={{ fontSize: 14 }}>⬆️</span>
              </div>
              <div>
                <p className="text-white/70 text-xs">Pengeluaran</p>
                <p className="text-white font-bold text-sm">{maskShort(expense)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { icon: '➕', label: 'Tambah', color: '#00C896', bg: 'rgba(0,200,150,0.15)', action: () => navigate('add-tx', { type: 'expense' }) },
            { icon: '💸', label: 'Transfer', color: '#FFB347', bg: 'rgba(255,179,71,0.15)', action: () => navigate('add-tx', { type: 'transfer' }) },
            { icon: '🔴', label: 'Hutang', color: '#FF6B6B', bg: 'rgba(255,107,107,0.15)', action: () => navigate('debts') },
            { icon: '📈', label: 'Investasi', color: '#FFCC02', bg: 'rgba(255,204,2,0.15)', action: () => navigate('investments') },
          ].map((a, i) => (
            <button key={i} onClick={a.action}
              className="flex flex-col items-center gap-2 card-press"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: a.bg }}>
                <span style={{ fontSize: 24 }}>{a.icon}</span>
              </div>
              <span style={{ color: '#A0A8C0', fontSize: 10, fontWeight: 600 }}>{a.label}</span>
            </button>
          ))}
        </div>

        {/* More Actions */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { icon: '📊', label: 'Statistik', color: '#4FC3F7', bg: 'rgba(79,195,247,0.15)', action: () => navigate('statistics') },
            { icon: '💼', label: 'Anggaran', color: '#CE93D8', bg: 'rgba(206,147,216,0.15)', action: () => navigate('budget') },
            { icon: '💾', label: 'Backup', color: '#80DEEA', bg: 'rgba(128,222,234,0.15)', action: () => navigate('backup') },
            { icon: '🏦', label: 'Akun', color: '#A5D6A7', bg: 'rgba(165,214,167,0.15)', action: () => navigate('accounts') },
          ].map((a, i) => (
            <button key={i} onClick={a.action}
              className="flex flex-col items-center gap-2 card-press"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: a.bg }}>
                <span style={{ fontSize: 24 }}>{a.icon}</span>
              </div>
              <span style={{ color: '#A0A8C0', fontSize: 10, fontWeight: 600 }}>{a.label}</span>
            </button>
          ))}
        </div>

        {/* Accounts */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-base">Akun</h2>
            <button onClick={() => navigate('accounts')} style={{ background: 'none', border: 'none', color: '#00C896', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Lihat Semua</button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
            {state.accounts.map(acc => (
              <div key={acc.id} className="flex-shrink-0 bg-card rounded-2xl p-4 border border-border" style={{ minWidth: 130 }}>
                <span style={{ fontSize: 28 }}>{acc.icon}</span>
                <p className="text-text-muted text-xs mt-2">{acc.name}</p>
                <p className="font-bold text-sm mt-1" style={{ color: acc.color }}>{mask(acc.balance)}</p>
              </div>
            ))}
            <button onClick={() => navigate('accounts')}
              className="flex-shrink-0 bg-card rounded-2xl border border-dashed border-border flex flex-col items-center justify-center gap-1 card-press"
              style={{ minWidth: 80, cursor: 'pointer' }}>
              <span style={{ fontSize: 24, color: '#5A6080' }}>+</span>
              <span style={{ color: '#5A6080', fontSize: 10, fontWeight: 600 }}>Tambah</span>
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-base">Transaksi Terbaru</h2>
            <button onClick={() => navigate('transactions')} style={{ background: 'none', border: 'none', color: '#00C896', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Lihat Semua</button>
          </div>
          {recent.length === 0 ? (
            <EmptyState emoji="💸" title="Belum ada transaksi" subtitle="Tap + untuk catat transaksi pertama" action="Catat Sekarang" onAction={() => navigate('add-tx', { type: 'expense' })} />
          ) : (
            <div className="flex flex-col">
              {recent.map(tx => {
                const cat = getCat(tx.category, tx.type)
                const acc = state.accounts.find(a => a.id === tx.accountId)
                return (
                  <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-border/50">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: cat.color + '20' }}>
                      <span style={{ fontSize: 20 }}>{cat.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{cat.label}</p>
                      <p className="text-text-muted text-xs mt-0.5 truncate">{acc?.name}{tx.note ? ` · ${tx.note}` : ''}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm" style={{ color: tx.type === 'income' ? '#00C896' : '#FF6B6B' }}>
                        {tx.type === 'income' ? '+' : '-'}{formatRpShort(tx.amount)}
                      </p>
                      <p className="text-text-muted text-xs mt-0.5">{formatDateShort(tx.date)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button onClick={() => navigate('add-tx', { type: 'expense' })}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl card-press z-40"
        style={{ background: 'linear-gradient(135deg, #00C896, #00A87E)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,200,150,0.4)' }}>
        <span style={{ fontSize: 28, color: '#fff' }}>+</span>
      </button>
    </div>
  )
}
