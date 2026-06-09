<div align="center">

<img src="public/logo_apk.png" width="120" alt="Finance Tracker Logo" />

# Finance Tracker

**Aplikasi keuangan personal yang berjalan 100% offline di Android**

[![Build Status](https://github.com/FaizMelpa/FinanceTracker/actions/workflows/build-apk.yml/badge.svg)](https://github.com/FaizMelpa/FinanceTracker/actions)
![Platform](https://img.shields.io/badge/platform-Android-3DDC84?logo=android&logoColor=white)
![Made With](https://img.shields.io/badge/made%20with-React%20%2B%20Capacitor-61DAFB?logo=react&logoColor=white)
![License](https://img.shields.io/badge/license-Private-FF6B6B)

---

*"Apapun yang menjadi takdirmu akan mencari jalannya untuk menemukanmu"*
**— Ali Bin Abi Thalib —**

---

</div>

## ✦ Fitur

| Fitur | Deskripsi |
|-------|-----------|
| 💰 **Transaksi** | Catat pemasukan & pengeluaran harian |
| 🏦 **Multi Akun** | Bank, e-wallet, tunai — tak terbatas |
| 🔄 **Transfer** | Transfer antar akun dengan saldo otomatis |
| 📊 **Budget** | Anggaran per kategori + notifikasi batas |
| 📈 **Statistik** | Bar chart, pie chart, heatmap aktivitas |
| 🤝 **Hutang Piutang** | Catat, bayar, tambah hutang per orang |
| 💹 **Investasi** | Portofolio saham, kripto, reksa dana, dll |
| 💾 **Backup** | Simpan & restore data ke file `.json` |
| 📤 **Import** | Import dari Monefy & wallet lain (CSV) |
| 🌙 **Dark Mode** | Full dark mode — nyaman di malam hari |
| 📴 **Offline** | Zero internet — data 100% di HP sendiri |

---

## 🚀 Cara Build APK

> Build dilakukan otomatis via **GitHub Actions** — tidak perlu laptop, cukup HP.

### 1. Upload ke GitHub
```
Buat repo baru → upload semua file project ini
```

### 2. Trigger Build
```
Tab Actions → Build Android APK → Run workflow
```
> Build juga otomatis jalan setiap kali ada commit baru.

### 3. Download APK
```
Tab Actions → pilih run yang ✅ → Artifacts → Finance-Tracker-APK → Download
```

### 4. Install di HP
```
Buka file .apk → izinkan install dari sumber tidak dikenal → Install
```

---

## 📁 Struktur Project

```
FinanceTrackerApp/
│
├── 📁 .github/workflows/
│   └── build-apk.yml          ← CI/CD GitHub Actions
│
├── 📁 icons/                  ← Icon APK semua resolusi
│   ├── mipmap-mdpi/
│   ├── mipmap-hdpi/
│   ├── mipmap-xhdpi/
│   ├── mipmap-xxhdpi/
│   └── mipmap-xxxhdpi/
│
├── 📁 public/
│   └── logo_*.png             ← Asset logo
│
├── 📁 src/
│   ├── 📁 assets/             ← Logo base64 (splash & about)
│   ├── 📁 components/
│   │   ├── BottomNav.jsx      ← Navigasi bawah
│   │   └── UI.jsx             ← Komponen reusable
│   ├── 📁 context/
│   │   └── AppContext.jsx     ← Global state & reducer
│   ├── 📁 pages/
│   │   ├── Dashboard.jsx
│   │   ├── Transactions.jsx
│   │   ├── AddTransaction.jsx
│   │   ├── Accounts.jsx
│   │   ├── Budget.jsx
│   │   ├── Statistics.jsx
│   │   ├── Debts.jsx
│   │   ├── Investments.jsx
│   │   ├── BackupRestore.jsx
│   │   ├── About.jsx
│   │   └── SplashScreen.jsx
│   └── 📁 utils/
│       └── constants.js       ← Kategori, tipe akun, helpers
│
├── capacitor.config.js        ← Konfigurasi Capacitor
├── gen_icons.py               ← Script override icon APK
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🎨 Kustomisasi

```js
// Ganti warna utama → tailwind.config.js
colors: {
  primary: '#00C896',   // ← ganti warna ini
}

// Ganti nama & package → capacitor.config.js
appId: 'com.financetracker.fz',
appName: 'Finance Tracker',

// Tambah kategori → src/utils/constants.js
// Ganti icon APK → icons/mipmap-*/ic_launcher.png
```

---

## 🛠️ Tech Stack

```
React 18          → UI framework
Vite 5            → Bundler
Tailwind CSS 3    → Styling
Capacitor 5       → Native Android bridge
Recharts          → Grafik & chart
localStorage      → Penyimpanan data lokal
GitHub Actions    → Build CI/CD
```

---

<div align="center">

Built with 🖤 by **Dncelzie**

</div>
