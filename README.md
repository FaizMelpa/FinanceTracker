# 💰 Finance Tracker

Aplikasi catatan keuangan personal — React + Vite + Tailwind + Capacitor.

**by Dncelzie**

---

## ✨ Fitur

- 💰 Catat pemasukan & pengeluaran
- 🏦 Multi akun tak terbatas (bank, e-wallet, tunai, dll)
- 🔄 Transfer antar akun
- 📊 Budget tracker per kategori + warning
- 📈 Statistik & grafik (bar chart, pie chart, heatmap)
- 🤝 Hutang piutang (bayar sebagian, riwayat pembayaran)
- 💹 Portofolio investasi lengkap
- 📷 Foto struk per transaksi
- 💾 Backup & restore ke Excel
- 📤 Import dari wallet lain (Monefy CSV)
- 🌙 Full dark mode
- 📴 100% offline

---

## 🚀 Cara Build APK (dari HP)

### 1. Fork / Upload ke GitHub
- Buka [github.com](https://github.com) di HP
- Buat repo baru → upload semua file project ini

### 2. Aktifkan GitHub Actions
- Buka repo → tab **Actions**
- Kalau ada prompt "enable workflows" → klik **Enable**

### 3. Trigger Build
- Setiap kali lo push/commit kode → build otomatis jalan
- Atau manual: tab **Actions** → **Build Android APK** → **Run workflow**

### 4. Download APK
- Tab **Actions** → pilih workflow yang sudah selesai ✅
- Scroll ke bawah → **Artifacts** → **Finance-Tracker-APK**
- Download → extract → install di HP

### 5. Install APK
- Pindahkan APK ke HP
- Buka file manager → tap APK
- Kalau muncul "install dari sumber tidak dikenal" → izinkan

---

## 📁 Struktur Project

```
FinanceTrackerApp/
├── .github/
│   └── workflows/
│       └── build-apk.yml     ← GitHub Actions
├── src/
│   ├── context/
│   │   └── AppContext.jsx    ← Global state
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Transactions.jsx
│   │   ├── AddTransaction.jsx
│   │   ├── Budget.jsx
│   │   ├── Statistics.jsx
│   │   ├── Accounts.jsx
│   │   ├── Debts.jsx
│   │   ├── Investments.jsx
│   │   ├── BackupRestore.jsx
│   │   ├── About.jsx
│   │   └── SplashScreen.jsx
│   ├── components/
│   │   ├── BottomNav.jsx
│   │   └── UI.jsx
│   └── utils/
│       └── constants.js
├── index.html
├── vite.config.js
├── tailwind.config.js
├── capacitor.config.js
└── package.json
```

---

## 🛠️ Kustomisasi

- **Warna utama** → `tailwind.config.js` → `colors.primary`
- **Nama app** → `capacitor.config.js` → `appName`
- **Package ID** → `capacitor.config.js` → `appId`
- **Tambah kategori** → `src/utils/constants.js`
- **Watermark** → `src/pages/About.jsx`
