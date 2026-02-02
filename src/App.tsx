import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

interface Vibe {
  id: string
  name: string
  emoji: string
  price: number
  change: number
  history: number[]
  volume: number
  sentiment: 'bullish' | 'bearish' | 'neutral'
}

const initialVibes: Vibe[] = [
  { id: 'euphoria', name: 'EUPHORIA', emoji: '✨', price: 847.32, change: 12.4, history: [780, 795, 810, 825, 830, 847], volume: 2847291, sentiment: 'bullish' },
  { id: 'chaos', name: 'CHAOS', emoji: '🌀', price: 666.66, change: -6.66, history: [720, 700, 690, 680, 670, 666], volume: 1337420, sentiment: 'bearish' },
  { id: 'serenity', name: 'SERENITY', emoji: '🌊', price: 420.69, change: 4.20, history: [400, 405, 410, 415, 418, 420], volume: 696969, sentiment: 'bullish' },
  { id: 'melancholy', name: 'MELANCHOLY', emoji: '🌧️', price: 234.56, change: -2.34, history: [250, 248, 245, 240, 238, 234], volume: 543210, sentiment: 'bearish' },
  { id: 'nostalgia', name: 'NOSTALGIA', emoji: '📼', price: 1999.00, change: 19.99, history: [1920, 1940, 1960, 1975, 1985, 1999], volume: 909090, sentiment: 'bullish' },
  { id: 'anxiety', name: 'ANXIETY', emoji: '⚡', price: 999.99, change: 0.01, history: [998, 999, 998, 1000, 999, 999], volume: 4444444, sentiment: 'neutral' },
]

function MiniChart({ history, isUp }: { history: number[], isUp: boolean }) {
  const min = Math.min(...history)
  const max = Math.max(...history)
  const range = max - min || 1
  const points = history.map((val, i) => {
    const x = (i / (history.length - 1)) * 100
    const y = 100 - ((val - min) / range) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox="0 0 100 100" className="mini-chart" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${isUp ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isUp ? '#00ff88' : '#ff0066'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={isUp ? '#00ff88' : '#ff0066'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,100 ${points} 100,100`}
        fill={`url(#grad-${isUp ? 'up' : 'down'})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? '#00ff88' : '#ff0066'}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function VibeCard({ vibe, onClick, isSelected }: { vibe: Vibe, onClick: () => void, isSelected: boolean }) {
  const isUp = vibe.change >= 0

  return (
    <motion.div
      className={`vibe-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <div className="vibe-card-header">
        <span className="vibe-emoji">{vibe.emoji}</span>
        <span className="vibe-name">{vibe.name}</span>
        <span className={`vibe-sentiment ${vibe.sentiment}`}>
          {vibe.sentiment === 'bullish' ? '▲' : vibe.sentiment === 'bearish' ? '▼' : '◆'}
        </span>
      </div>
      <div className="vibe-card-body">
        <div className="vibe-price">${vibe.price.toFixed(2)}</div>
        <div className={`vibe-change ${isUp ? 'up' : 'down'}`}>
          {isUp ? '+' : ''}{vibe.change.toFixed(2)}%
        </div>
      </div>
      <div className="vibe-chart-container">
        <MiniChart history={vibe.history} isUp={isUp} />
      </div>
      <div className="vibe-volume">
        VOL: {(vibe.volume / 1000000).toFixed(2)}M
      </div>
    </motion.div>
  )
}

function TradePanel({ vibe, onClose, onTrade }: { vibe: Vibe, onClose: () => void, onTrade: (type: 'buy' | 'sell', amount: number) => void }) {
  const [amount, setAmount] = useState(1)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')

  return (
    <motion.div
      className="trade-panel-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="trade-panel"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="trade-panel-header">
          <span className="trade-emoji">{vibe.emoji}</span>
          <h2>{vibe.name}</h2>
          <div className="trade-price">${vibe.price.toFixed(2)}</div>
        </div>

        <div className="trade-type-toggle">
          <button
            className={`toggle-btn ${tradeType === 'buy' ? 'active buy' : ''}`}
            onClick={() => setTradeType('buy')}
          >
            BUY
          </button>
          <button
            className={`toggle-btn ${tradeType === 'sell' ? 'active sell' : ''}`}
            onClick={() => setTradeType('sell')}
          >
            SELL
          </button>
        </div>

        <div className="amount-input-group">
          <label>QUANTITY</label>
          <div className="amount-controls">
            <button onClick={() => setAmount(Math.max(1, amount - 1))}>−</button>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <button onClick={() => setAmount(amount + 1)}>+</button>
          </div>
        </div>

        <div className="trade-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${(vibe.price * amount).toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Vibe Fee (0.69%)</span>
            <span>${(vibe.price * amount * 0.0069).toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${(vibe.price * amount * 1.0069).toFixed(2)}</span>
          </div>
        </div>

        <motion.button
          className={`execute-trade-btn ${tradeType}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTrade(tradeType, amount)}
        >
          {tradeType === 'buy' ? 'ACQUIRE VIBE' : 'RELEASE VIBE'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

function Portfolio({ holdings }: { holdings: { [key: string]: number } }) {
  const totalValue = Object.entries(holdings).reduce((sum, [id, qty]) => {
    const vibe = initialVibes.find(v => v.id === id)
    return sum + (vibe ? vibe.price * qty : 0)
  }, 0)

  return (
    <div className="portfolio">
      <h3>YOUR VIBES</h3>
      <div className="portfolio-value">
        <span className="label">PORTFOLIO VALUE</span>
        <span className="value">${totalValue.toFixed(2)}</span>
      </div>
      <div className="holdings-list">
        {Object.entries(holdings).map(([id, qty]) => {
          const vibe = initialVibes.find(v => v.id === id)
          if (!vibe || qty === 0) return null
          return (
            <div key={id} className="holding-item">
              <span className="holding-emoji">{vibe.emoji}</span>
              <span className="holding-name">{vibe.name}</span>
              <span className="holding-qty">×{qty}</span>
              <span className="holding-value">${(vibe.price * qty).toFixed(2)}</span>
            </div>
          )
        })}
        {Object.values(holdings).every(v => v === 0) && (
          <div className="empty-portfolio">No vibes yet. Start trading!</div>
        )}
      </div>
    </div>
  )
}

function Ticker({ vibes }: { vibes: Vibe[] }) {
  return (
    <div className="ticker-wrapper">
      <div className="ticker">
        <div className="ticker-content">
          {[...vibes, ...vibes].map((vibe, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-emoji">{vibe.emoji}</span>
              <span className="ticker-name">{vibe.name}</span>
              <span className={`ticker-change ${vibe.change >= 0 ? 'up' : 'down'}`}>
                {vibe.change >= 0 ? '+' : ''}{vibe.change.toFixed(2)}%
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function App() {
  const [vibes, setVibes] = useState(initialVibes)
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null)
  const [holdings, setHoldings] = useState<{ [key: string]: number }>({})
  const [notifications, setNotifications] = useState<{ id: number, message: string, type: 'success' | 'error' }[]>([])

  const addNotification = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 3000)
  }, [])

  const handleTrade = useCallback((type: 'buy' | 'sell', amount: number) => {
    if (!selectedVibe) return

    if (type === 'sell' && (holdings[selectedVibe.id] || 0) < amount) {
      addNotification('Insufficient vibes to sell!', 'error')
      return
    }

    setHoldings(prev => ({
      ...prev,
      [selectedVibe.id]: (prev[selectedVibe.id] || 0) + (type === 'buy' ? amount : -amount)
    }))

    addNotification(
      `${type === 'buy' ? 'Acquired' : 'Released'} ${amount} ${selectedVibe.name} ${selectedVibe.emoji}`,
      'success'
    )
    setSelectedVibe(null)
  }, [selectedVibe, holdings, addNotification])

  // Simulate price changes
  useEffect(() => {
    const interval = setInterval(() => {
      setVibes(prev => prev.map(vibe => {
        const change = (Math.random() - 0.5) * 10
        const newPrice = Math.max(1, vibe.price + change)
        const newHistory = [...vibe.history.slice(1), newPrice]
        const newChange = ((newPrice - vibe.history[0]) / vibe.history[0]) * 100
        return {
          ...vibe,
          price: newPrice,
          history: newHistory,
          change: newChange,
          sentiment: newChange > 2 ? 'bullish' : newChange < -2 ? 'bearish' : 'neutral'
        }
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="app">
      <div className="scanlines" />
      <div className="noise" />

      <header className="header">
        <motion.div
          className="logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="logo-icon">◈</span>
          <span className="logo-text">VIBE</span>
          <span className="logo-accent">EXCHANGE</span>
        </motion.div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-label">MARKET CAP</span>
            <span className="stat-value">$4.20B</span>
          </div>
          <div className="stat">
            <span className="stat-label">24H VOLUME</span>
            <span className="stat-value">$69.42M</span>
          </div>
          <div className="stat live">
            <span className="live-dot" />
            <span className="stat-label">LIVE</span>
          </div>
        </div>
      </header>

      <Ticker vibes={vibes} />

      <main className="main">
        <motion.section
          className="trading-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="section-title">
            <span className="title-line" />
            TRENDING VIBES
            <span className="title-line" />
          </h2>
          <div className="vibes-grid">
            {vibes.map((vibe, i) => (
              <motion.div
                key={vibe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <VibeCard
                  vibe={vibe}
                  onClick={() => setSelectedVibe(vibe)}
                  isSelected={selectedVibe?.id === vibe.id}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.aside
          className="sidebar"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Portfolio holdings={holdings} />

          <div className="market-mood">
            <h3>MARKET MOOD</h3>
            <div className="mood-meter">
              <div className="mood-bar" style={{ width: '65%' }} />
            </div>
            <div className="mood-labels">
              <span>FEAR</span>
              <span>GREED</span>
            </div>
            <div className="mood-value">EXTREME VIBES</div>
          </div>
        </motion.aside>
      </main>

      <AnimatePresence>
        {selectedVibe && (
          <TradePanel
            vibe={selectedVibe}
            onClose={() => setSelectedVibe(null)}
            onTrade={handleTrade}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        <div className="notifications">
          {notifications.map(notif => (
            <motion.div
              key={notif.id}
              className={`notification ${notif.type}`}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
            >
              {notif.message}
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      <footer className="footer">
        <span>Requested by @WhaleTonyOVO · Built by @clonkbot</span>
      </footer>
    </div>
  )
}

export default App