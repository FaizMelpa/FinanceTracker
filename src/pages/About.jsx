import React from 'react'
import { PageHeader } from '../components/UI'
import { LOGO_CLEAN } from '../assets/logo_clean'

export default function About({ navigate }) {
  const features = [
    { icon: '💰', label: 'Catat Pemasukan & Pengeluaran' },
    { icon: '🏦', label: 'Multi Akun Tak Terbatas' },
    { icon: '🔄', label: 'Transfer Antar Akun' },
    { icon: '📊', label: 'Budget Tracker per Kategori' },
    { icon: '📈', label: 'Statistik & Grafik Lengkap' },
    { icon: '🤝', label: 'Hutang Piutang' },
    { icon: '💹', label: 'Portofolio Investasi' },
    { icon: '📷', label: 'Foto Struk Transaksi' },
    { icon: '💾', label: 'Backup & Restore' },
    { icon: '📤', label: 'Import dari Wallet Lain' },
    { icon: '🌙', label: 'Full Dark Mode' },
    { icon: '📴', label: '100% Offline' },
  ]

  return (
    <div className="h-full flex flex-col bg-bg">
      <PageHeader title="Tentang" onBack={() => navigate('dashboard')} />

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 pb-8">
        {/* App Identity */}
        <div className="flex flex-col items-center py-8">
          {/* Logo tanpa tulisan di dalamnya */}
          <div className="mb-4">
            <img
              src={LOGO_CLEAN}
              alt="Finance Tracker"
              style={{ width: 96, height: 96, objectFit: 'contain' }}
            />
          </div>

          {/* Tulisan tetap seperti bawaan */}
          <h1 className="text-white font-black text-2xl">Finance Tracker</h1>
          <p className="text-text-muted text-sm mt-1">Versi 1.0.0</p>

          {/* Quote — by Dncelzie diganti jadi Ali Bin Abi Thalib, warna putih */}
          <div className="mt-6 px-6 py-5 rounded-3xl border border-border text-center w-full" style={{ background: '#1A1D27' }}>
            <p className="font-semibold text-base mb-3 leading-relaxed" style={{ color: '#00C896' }}>
              "Apapun yang menjadi takdirmu akan mencari jalannya untuk menemukanmu"
            </p>
            <p className="text-white text-sm font-semibold">— Ali Bin Abi Thalib —</p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-4">
          <p className="text-white font-bold text-sm mb-3">✨ Fitur Lengkap</p>
          <div className="grid grid-cols-2 gap-2">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 py-2">
                <span style={{ fontSize: 16 }}>{f.icon}</span>
                <span className="text-text-sec text-xs font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-4">
          <p className="text-white font-bold text-sm mb-3">ℹ️ Informasi</p>
          {[
            { label: 'Versi', val: '1.0.0' },
            { label: 'Platform', val: 'Android' },
            { label: 'Penyimpanan', val: 'Lokal (Offline)' },
            { label: 'Package', val: 'com.financetracker.fz' },
            { label: 'Framework', val: 'React + Capacitor' },
            { label: 'by', val: 'Dncelzie' },
          ].map((item, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-border last:border-0">
              <span className="text-text-muted text-sm">{item.label}</span>
              <span className="text-white text-sm font-semibold">{item.val}</span>
            </div>
          ))}
        </div>

        {/* Privacy */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-white font-bold text-sm mb-2">🔒 Privasi</p>
          <p className="text-text-muted text-xs leading-relaxed">
            Semua data tersimpan 100% di perangkat lo sendiri. Tidak ada data yang dikirim ke server manapun. Aplikasi ini berjalan sepenuhnya secara offline.
          </p>
        </div>
      </div>
    </div>
  )
}
