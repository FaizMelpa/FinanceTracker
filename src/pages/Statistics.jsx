import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatRp, formatRpShort, MONTHS, MONTHS_SHORT, getCat } from '../utils/constants'
import { PageHeader } from '../components/UI'
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts'

export default function Statistics({ navigate }) {
  const { state, getMonthlyStats, getCatStats } = useApp()
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [catTab, setCatTab] = useState('expense')

  const prevMonth = () => {
    const d = new Date(selectedMonth)
    d.setMonth(d.getMonth() - 1)
    setSelectedMonth(d)
  }
  const nextMonth = () => {
    const d = new Date(selectedMonth)
    d.setMonth(d.getMonth() + 1)
    if (d <= new Date()) setSelectedMonth(d)
  }

  const { income, expense, net } = getMonthlyStats(selectedMonth)
  const catStats = getCatStats(catTab, selectedMonth)
  const totalCat = Object.values(catStats).reduce((s, v) => s + v, 0)

  // Last 6 months bar data
  const barData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const s = getMonthlyStats(d)
    return { month: MONTHS_SHORT[d.getMonth()], income: s.income, expense: s.expense }
  })

  const pieData = Object.entries(catStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, val]) => {
      const cat = getCat(id, catTab)
      return { name: cat.label, value: val, color: cat.color, icon: cat.icon }
    })

  // Daily spending this month
  const dailyMap = {}
  state.transactions
    .filter(t => t.type === 'expense' && !t.isTransfer)
    .filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === selectedMonth.getMonth() && d.getFullYear() === selectedMonth.getFullYear()
    })
    .forEach(t => {
      const day = new Date(t.date).getDate()
      dailyMap[day] = (dailyMap[day] || 0) + t.amount
    })

  const maxDaily = Math.max(...Object.values(dailyMap), 1)

  return (
    <div className="h-full flex flex-col bg-bg">
      <PageHeader title="Statistik" />

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 pb-6">
        {/* Month Navigator */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button onClick={prevMonth}
            className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center card-press"
            style={{ border: 'none', cursor: 'pointer', color: '#A0A8C0', fontSize: 18 }}>‹</button>
          <p className="text-white font-bold text-base" style={{ width: 150, textAlign: 'center' }}>
            {MONTHS[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
          </p>
          <button onClick={nextMonth}
            className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center card-press"
            style={{ border: 'none', cursor: 'pointer', color: '#A0A8C0', fontSize: 18 }}>›</button>
        </div>

        {/* Monthly Summary */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Pemasukan', val: income, color: '#00C896', border: 'rgba(0,200,150,0.3)' },
            { label: 'Pengeluaran', val: expense, color: '#FF6B6B', border: 'rgba(255,107,107,0.3)' },
            { label: 'Selisih', val: net, color: net >= 0 ? '#00C896' : '#FF6B6B', border: net >= 0 ? 'rgba(0,200,150,0.3)' : 'rgba(255,107,107,0.3)' },
          ].map((s, i) => (
            <div key={i} className="bg-card rounded-2xl p-3 border" style={{ borderColor: s.border }}>
              <div className="w-2 h-2 rounded-full mb-2" style={{ background: s.color }} />
              <p className="text-text-muted text-xs mb-1">{s.label}</p>
              <p className="font-black text-sm" style={{ color: s.color }}>{formatRpShort(Math.abs(s.val))}</p>
            </div>
          ))}
        </div>

        {/* Bar Chart 6 months */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-4">
          <p className="text-white font-bold text-sm mb-3">6 Bulan Terakhir</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} barGap={2} barCategoryGap="20%">
              <XAxis dataKey="month" tick={{ fill: '#5A6080', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v, name) => [formatRp(v), name === 'income' ? 'Pemasukan' : 'Pengeluaran']}
                contentStyle={{ background: '#22263A', border: '1px solid #2A2D3E', borderRadius: 10, color: '#fff', fontSize: 11 }} />
              <Bar dataKey="income" fill="#00C896" radius={[4, 4, 0, 0]} maxBarSize={16} />
              <Bar dataKey="expense" fill="#FF6B6B" radius={[4, 4, 0, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {[{ color: '#00C896', label: 'Pemasukan' }, { color: '#FF6B6B', label: 'Pengeluaran' }].map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                <span style={{ color: '#A0A8C0', fontSize: 11 }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-4">
          {/* Tab */}
          <div className="flex bg-elevated rounded-xl p-1 mb-4">
            {[['expense', '📤 Pengeluaran'], ['income', '📥 Pemasukan']].map(([k, l]) => (
              <button key={k} onClick={() => setCatTab(k)}
                className="flex-1 py-2 rounded-xl text-xs font-bold card-press"
                style={{ background: catTab === k ? '#1E2235' : 'transparent', color: catTab === k ? '#fff' : '#5A6080', border: 'none', cursor: 'pointer' }}>
                {l}
              </button>
            ))}
          </div>

          {pieData.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-6">Tidak ada data bulan ini</p>
          ) : (
            <>
              {/* Pie */}
              <div className="flex items-center mb-4">
                <ResponsiveContainer width={130} height={130}>
                  <PieChart>
                    <Pie data={pieData} cx={60} cy={60} innerRadius={32} outerRadius={58} dataKey="value" paddingAngle={3}>
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={v => formatRp(v)} contentStyle={{ background: '#22263A', border: '1px solid #2A2D3E', borderRadius: 10, color: '#fff', fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 pl-2">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-text-sec text-xs truncate" style={{ maxWidth: 90 }}>{d.name}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: d.color }}>
                        {totalCat ? Math.round((d.value / totalCat) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar list */}
              {Object.entries(catStats).sort((a, b) => b[1] - a[1]).map(([id, amount]) => {
                const cat = getCat(id, catTab)
                const pct = totalCat ? (amount / totalCat) * 100 : 0
                return (
                  <div key={id} className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cat.color + '20' }}>
                      <span style={{ fontSize: 17 }}>{cat.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-white text-xs font-semibold">{cat.label}</span>
                        <span className="text-xs font-bold" style={{ color: catTab === 'income' ? '#00C896' : '#FF6B6B' }}>{formatRpShort(amount)}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#2A2D3E' }}>
                        <div className="h-full rounded-full progress-bar" style={{ width: `${pct}%`, background: cat.color }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Daily Spending Heatmap */}
        {Object.keys(dailyMap).length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-4 mb-4">
            <p className="text-white font-bold text-sm mb-3">Pengeluaran Harian</p>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate() }, (_, i) => {
                const day = i + 1
                const val = dailyMap[day] || 0
                const intensity = val > 0 ? Math.max(0.15, val / maxDaily) : 0
                return (
                  <div key={day} className="flex flex-col items-center" style={{ width: 'calc(100%/7 - 4px)' }}>
                    <div className="w-full aspect-square rounded-lg mb-1" style={{ background: val > 0 ? `rgba(255,107,107,${intensity})` : '#1E2235', border: '1px solid #2A2D3E' }} title={val > 0 ? formatRp(val) : ''} />
                    <span style={{ color: '#5A6080', fontSize: 8 }}>{day}</span>
                  </div>
                )
              })}
            </div>
            <p className="text-text-muted text-xs mt-2 text-center">Semakin merah = semakin banyak pengeluaran</p>
          </div>
        )}
      </div>
    </div>
  )
}
