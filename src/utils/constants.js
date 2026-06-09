// ── Currency ─────────────────────────────────────────
export const formatRp = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)

export const formatRpShort = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)

// ── Date ──────────────────────────────────────────────
export const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
export const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

export const formatDate = (d) => {
  const date = new Date(d)
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}
export const formatDateShort = (d) => {
  const date = new Date(d)
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`
}
export const formatTime = (d) => {
  const date = new Date(d)
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
export const isSameMonth = (d, ref = new Date()) => {
  const date = new Date(d)
  return date.getMonth() === ref.getMonth() && date.getFullYear() === ref.getFullYear()
}
export const isSameDay = (d1, d2 = new Date()) => {
  const a = new Date(d1), b = new Date(d2)
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
}

// ── Expense Categories ────────────────────────────────
export const EXPENSE_CATS = [
  { id: 'food',          label: 'Makanan & Minum', icon: '🍔', color: '#FF8C69' },
  { id: 'breakfast',     label: 'Sarapan',          icon: '🍳', color: '#FFB347' },
  { id: 'snack',         label: 'Jajan',             icon: '🍿', color: '#FFD54F' },
  { id: 'transport',     label: 'Transportasi',      icon: '🚗', color: '#4FC3F7' },
  { id: 'fuel',          label: 'Bensin',            icon: '⛽', color: '#29B6F6' },
  { id: 'shopping',      label: 'Belanja',           icon: '🛍️', color: '#CE93D8' },
  { id: 'online_shop',   label: 'Belanja Online',    icon: '📦', color: '#BA68C8' },
  { id: 'bills',         label: 'Tagihan',           icon: '📄', color: '#EF9A9A' },
  { id: 'electricity',   label: 'Listrik & Air',     icon: '💡', color: '#FFF176' },
  { id: 'internet',      label: 'Internet/Pulsa',    icon: '📶', color: '#80DEEA' },
  { id: 'health',        label: 'Kesehatan',         icon: '💊', color: '#80CBC4' },
  { id: 'entertainment', label: 'Hiburan',           icon: '🎮', color: '#A5D6A7' },
  { id: 'education',     label: 'Pendidikan',        icon: '📚', color: '#90CAF9' },
  { id: 'beauty',        label: 'Kecantikan',        icon: '💄', color: '#F48FB1' },
  { id: 'laundry',       label: 'Laundry',           icon: '👕', color: '#B0BEC5' },
  { id: 'haircut',       label: 'Pangkas Rambut',    icon: '✂️', color: '#BCAAA4' },
  { id: 'family',        label: 'Keluarga',          icon: '👨‍👩‍👧', color: '#FFAB91' },
  { id: 'travel',        label: 'Perjalanan',        icon: '✈️', color: '#80CBC4' },
  { id: 'vehicle',       label: 'Kendaraan',         icon: '🔧', color: '#78909C' },
  { id: 'daily',         label: 'Sehari-hari',       icon: '🏠', color: '#A5D6A7' },
  { id: 'other_exp',     label: 'Lainnya',           icon: '📦', color: '#B0BEC5' },
]

// ── Income Categories ─────────────────────────────────
export const INCOME_CATS = [
  { id: 'salary',     label: 'Gaji',        icon: '💼', color: '#A5D6A7' },
  { id: 'freelance',  label: 'Freelance',   icon: '💻', color: '#80DEEA' },
  { id: 'business',   label: 'Bisnis',      icon: '🏪', color: '#FFAB91' },
  { id: 'investment', label: 'Investasi',   icon: '📈', color: '#FFCC02' },
  { id: 'gift',       label: 'Hadiah',      icon: '🎁', color: '#F48FB1' },
  { id: 'bonus',      label: 'Bonus/THR',   icon: '🎉', color: '#FFD54F' },
  { id: 'other_inc',  label: 'Lainnya',     icon: '💰', color: '#B0BEC5' },
]

// ── Account Types ─────────────────────────────────────
export const ACCOUNT_TYPES = [
  { id: 'cash',       label: 'Tunai',        icon: '💵', color: '#A5D6A7' },
  { id: 'bank',       label: 'Bank',         icon: '🏦', color: '#4FC3F7' },
  { id: 'ewallet',    label: 'E-Wallet',     icon: '📱', color: '#CE93D8' },
  { id: 'savings',    label: 'Tabungan',     icon: '🐓', color: '#FFD54F' },
  { id: 'investment', label: 'Investasi',    icon: '📊', color: '#FFCC02' },
  { id: 'debt',       label: 'Hutang',       icon: '🔴', color: '#EF9A9A' },
  { id: 'credit',     label: 'Kartu Kredit', icon: '💳', color: '#FF8A65' },
]

// ── Investment Types ──────────────────────────────────
export const INVESTMENT_TYPES = [
  { id: 'stock',      label: 'Saham',        icon: '📈', color: '#FF5252' },
  { id: 'rd_pasar',   label: 'RD Pasar Uang', icon: '💵', color: '#00C896' },
  { id: 'rd_saham',   label: 'RD Saham',      icon: '📊', color: '#CE93D8' },
  { id: 'rd_obligasi',label: 'RD Obligasi',   icon: '📄', color: '#FFD54F' },
  { id: 'crypto',     label: 'Crypto',       icon: '🪙', color: '#FFD54F' },
  { id: 'gold',       label: 'Emas',         icon: '🥇', color: '#FFCC02' },
  { id: 'deposito',   label: 'Deposito',     icon: '🏦', color: '#80DEEA' },
  { id: 'p2p',        label: 'P2P Lending',  icon: '🤝', color: '#CE93D8' },
  { id: 'property',   label: 'Properti',     icon: '🏠', color: '#FFAB91' },
  { id: 'other',      label: 'Lainnya',      icon: '💼', color: '#B0BEC5' },
]

// ── Helpers ───────────────────────────────────────────
export const getCat = (id, type = 'expense') => {
  const list = type === 'expense' ? EXPENSE_CATS : INCOME_CATS
  return list.find(c => c.id === id) || { label: id, icon: '💰', color: '#B0BEC5' }
}

export const getAccountType = (id) =>
  ACCOUNT_TYPES.find(t => t.id === id) || ACCOUNT_TYPES[0]

export const getInvestmentType = (id) =>
  INVESTMENT_TYPES.find(t => t.id === id) || INVESTMENT_TYPES[INVESTMENT_TYPES.length - 1]

export const ACCOUNT_COLORS = [
  '#A5D6A7','#4FC3F7','#CE93D8','#EF9A9A',
  '#FFD54F','#FFAB91','#80DEEA','#FFCC02',
  '#F48FB1','#80CBC4','#90CAF9','#FF8A65',
]

// ── Monefy CSV Category Mapping ───────────────────────
export const MONEFY_CAT_MAP = {
  'sarapan': 'breakfast',
  'jajan': 'snack',
  'makan': 'food',
  'shope': 'online_shop',
  'shopee': 'online_shop',
  'sehari-hari': 'daily',
  'gaji': 'salary',
  'dll': 'other_inc',
  'internet': 'internet',
  'telepon': 'internet',
  'ortu': 'family',
  'dikampung': 'travel',
  'loundry': 'laundry',
  'laundry': 'laundry',
  'pangkas rambut': 'haircut',
  'investasi': 'investment',
  'bank aladin': 'bank',
  'hutang': 'debt',
}
