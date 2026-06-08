import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'

const AppContext = createContext()

// ── Default Data ──────────────────────────────────────
const DEFAULT_STATE = {
  accounts: [
    { id: 'acc1', name: 'Tunai',    type: 'cash',    icon: '💵', color: '#A5D6A7', balance: 0, currency: 'IDR', createdAt: new Date().toISOString() },
    { id: 'acc2', name: 'Bank',     type: 'bank',    icon: '🏦', color: '#4FC3F7', balance: 0, currency: 'IDR', createdAt: new Date().toISOString() },
    { id: 'acc3', name: 'E-Wallet', type: 'ewallet', icon: '📱', color: '#CE93D8', balance: 0, currency: 'IDR', createdAt: new Date().toISOString() },
  ],
  transactions: [],
  budgets: [],
  debts: [],           // hutang piutang
  investments: [],     // portofolio investasi
  investmentHistory: [],// riwayat setoran/tarik investasi
  settings: {
    currency: 'IDR',
    name: 'Pengguna',
    pinEnabled: false,
    pin: '',
    hideBalance: false,
  },
  isLoaded: false,
}

// ── Reducer ───────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case 'LOAD': return { ...state, ...action.payload, isLoaded: true }

    // ── Transactions ──
    case 'ADD_TX': {
      const tx = action.payload
      const accounts = state.accounts.map(a => {
        if (a.id !== tx.accountId) return a
        return { ...a, balance: tx.type === 'income' ? a.balance + tx.amount : a.balance - tx.amount }
      })
      return { ...state, transactions: [tx, ...state.transactions], accounts }
    }
    case 'DELETE_TX': {
      const tx = state.transactions.find(t => t.id === action.payload)
      if (!tx) return state
      const accounts = state.accounts.map(a => {
        if (a.id !== tx.accountId) return a
        return { ...a, balance: tx.type === 'income' ? a.balance - tx.amount : a.balance + tx.amount }
      })
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload), accounts }
    }
    case 'UPDATE_TX': {
      const old = state.transactions.find(t => t.id === action.payload.id)
      if (!old) return state
      // Revert old, apply new
      const accounts = state.accounts.map(a => {
        let bal = a.balance
        if (a.id === old.accountId) bal = old.type === 'income' ? bal - old.amount : bal + old.amount
        if (a.id === action.payload.accountId) bal = action.payload.type === 'income' ? bal + action.payload.amount : bal - action.payload.amount
        return a.id === old.accountId || a.id === action.payload.accountId ? { ...a, balance: bal } : a
      })
      return { ...state, transactions: state.transactions.map(t => t.id === action.payload.id ? action.payload : t), accounts }
    }
    case 'BULK_ADD_TX': {
      const txs = action.payload
      let accounts = [...state.accounts]
      txs.forEach(tx => {
        accounts = accounts.map(a => {
          if (a.id !== tx.accountId) return a
          return { ...a, balance: tx.type === 'income' ? a.balance + tx.amount : a.balance - tx.amount }
        })
      })
      return { ...state, transactions: [...txs, ...state.transactions], accounts }
    }

    // ── Transfer ──
    case 'TRANSFER': {
      const { fromId, toId, amount, note, date } = action.payload
      const txOut = { id: Date.now() + '_out', type: 'expense', amount, category: 'other_exp', accountId: fromId, note: `Transfer ke ${action.payload.toName}`, date, isTransfer: true, createdAt: new Date().toISOString() }
      const txIn  = { id: Date.now() + '_in',  type: 'income',  amount, category: 'other_inc', accountId: toId,   note: `Transfer dari ${action.payload.fromName}`, date, isTransfer: true, createdAt: new Date().toISOString() }
      const accounts = state.accounts.map(a => {
        if (a.id === fromId) return { ...a, balance: a.balance - amount }
        if (a.id === toId)   return { ...a, balance: a.balance + amount }
        return a
      })
      return { ...state, transactions: [txOut, txIn, ...state.transactions], accounts }
    }

    // ── Accounts ──
    case 'ADD_ACC':    return { ...state, accounts: [...state.accounts, action.payload] }
    case 'UPDATE_ACC': return { ...state, accounts: state.accounts.map(a => a.id === action.payload.id ? action.payload : a) }
    case 'DELETE_ACC': return { ...state, accounts: state.accounts.filter(a => a.id !== action.payload), transactions: state.transactions.filter(t => t.accountId !== action.payload) }

    // ── Budgets ──
    case 'ADD_BUDGET':    return { ...state, budgets: [...state.budgets, action.payload] }
    case 'UPDATE_BUDGET': return { ...state, budgets: state.budgets.map(b => b.id === action.payload.id ? action.payload : b) }
    case 'DELETE_BUDGET': return { ...state, budgets: state.budgets.filter(b => b.id !== action.payload) }

    // ── Debts ──
    case 'ADD_DEBT':    return { ...state, debts: [...state.debts, action.payload] }
    case 'UPDATE_DEBT': return { ...state, debts: state.debts.map(d => d.id === action.payload.id ? action.payload : d) }
    case 'DELETE_DEBT': return { ...state, debts: state.debts.filter(d => d.id !== action.payload) }
    case 'PAY_DEBT': {
      const { debtId, amount, date, note } = action.payload
      return {
        ...state,
        debts: state.debts.map(d => {
          if (d.id !== debtId) return d
          const payments = [...(d.payments || []), { id: Date.now().toString(), amount, date, note }]
          const paid = payments.reduce((s, p) => s + p.amount, 0)
          return { ...d, payments, paid, remaining: d.total - paid, status: paid >= d.total ? 'lunas' : 'aktif' }
        })
      }
    }

    // ── Investments ──
    case 'ADD_INV':    return { ...state, investments: [...state.investments, action.payload] }
    case 'UPDATE_INV': return { ...state, investments: state.investments.map(i => i.id === action.payload.id ? action.payload : i) }
    case 'DELETE_INV': return { ...state, investments: state.investments.filter(i => i.id !== action.payload), investmentHistory: state.investmentHistory.filter(h => h.investmentId !== action.payload) }
    case 'ADD_INV_HISTORY': return { ...state, investmentHistory: [action.payload, ...state.investmentHistory] }

    // ── Settings ──
    case 'UPDATE_SETTINGS': return { ...state, settings: { ...state.settings, ...action.payload } }

    // ── Restore ──
    case 'RESTORE': return { ...action.payload, isLoaded: true }

    default: return state
  }
}

// ── Provider ──────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ft_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        dispatch({ type: 'LOAD', payload: parsed })
      } else {
        dispatch({ type: 'LOAD', payload: {} })
      }
    } catch {
      dispatch({ type: 'LOAD', payload: {} })
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (!state.isLoaded) return
    const toSave = {
      accounts: state.accounts,
      transactions: state.transactions,
      budgets: state.budgets,
      debts: state.debts,
      investments: state.investments,
      investmentHistory: state.investmentHistory,
      settings: state.settings,
    }
    localStorage.setItem('ft_data', JSON.stringify(toSave))
  }, [state.accounts, state.transactions, state.budgets, state.debts, state.investments, state.investmentHistory, state.settings, state.isLoaded])

  // ── Computed helpers ──
  const getTotalBalance = useCallback(() =>
    state.accounts.filter(a => a.type !== 'debt').reduce((s, a) => s + a.balance, 0)
  , [state.accounts])

  const getMonthlyStats = useCallback((date = new Date()) => {
    const txs = state.transactions.filter(t => isSameMonth(t.date, date))
    const income  = txs.filter(t => t.type === 'income' && !t.isTransfer).reduce((s, t) => s + t.amount, 0)
    const expense = txs.filter(t => t.type === 'expense' && !t.isTransfer).reduce((s, t) => s + t.amount, 0)
    return { income, expense, net: income - expense, transactions: txs }
  }, [state.transactions])

  const getBudgetStatus = useCallback((date = new Date()) => {
    return state.budgets.map(b => {
      const spent = state.transactions
        .filter(t => t.type === 'expense' && t.category === b.category && isSameMonth(t.date, date))
        .reduce((s, t) => s + t.amount, 0)
      const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0
      return { ...b, spent, remaining: b.limit - spent, pct }
    })
  }, [state.budgets, state.transactions])

  const getCatStats = useCallback((type = 'expense', date = new Date()) => {
    const txs = state.transactions.filter(t => t.type === type && !t.isTransfer && isSameMonth(t.date, date))
    const map = {}
    txs.forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount })
    return map
  }, [state.transactions])

  const getTotalInvestment = useCallback(() => {
    const totalModal = state.investments.reduce((s, i) => s + (i.modal || 0), 0)
    const totalNow   = state.investments.reduce((s, i) => s + (i.currentValue || 0), 0)
    return { totalModal, totalNow, profit: totalNow - totalModal, pct: totalModal > 0 ? ((totalNow - totalModal) / totalModal) * 100 : 0 }
  }, [state.investments])

  const getDebtStats = useCallback(() => {
    const active = state.debts.filter(d => d.status !== 'lunas')
    const totalDebt = active.filter(d => d.direction === 'dipinjam').reduce((s, d) => s + d.remaining, 0)
    const totalReceivable = active.filter(d => d.direction === 'meminjamkan').reduce((s, d) => s + d.remaining, 0)
    return { totalDebt, totalReceivable, active: active.length }
  }, [state.debts])

  return (
    <AppContext.Provider value={{
      state, dispatch,
      getTotalBalance, getMonthlyStats, getBudgetStatus, getCatStats,
      getTotalInvestment, getDebtStats,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)

// helper used in context
function isSameMonth(d, ref = new Date()) {
  const date = new Date(d)
  return date.getMonth() === ref.getMonth() && date.getFullYear() === ref.getFullYear()
}
