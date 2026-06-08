import React, { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }) {
  const [fade, setFade] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 1800)
    const t2 = setTimeout(() => onDone(), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className={`fixed inset-0 bg-bg flex flex-col items-center justify-center z-50 transition-opacity duration-400 ${fade ? 'opacity-0' : 'opacity-100'}`}>
      {/* Logo */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #00C896 0%, #00A87E 100%)' }}>
          <span className="text-5xl">💰</span>
        </div>
        {/* F watermark */}
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-bg border-2 border-primary flex items-center justify-center">
          <span className="text-primary font-black text-sm">F</span>
        </div>
      </div>

      <h1 className="text-2xl font-black text-white tracking-tight mb-1">Finance Tracker</h1>
      <p className="text-text-muted text-sm">by Dncelzie</p>

      {/* Loading dots */}
      <div className="flex gap-2 mt-10">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-primary"
            style={{ animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
