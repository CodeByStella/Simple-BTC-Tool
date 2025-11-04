import { useMemo, useState } from 'react'
import { isValidBtcAddress, isValidWIF, isValidHexPriv, deriveFromWIF, deriveFromHex } from './btc'
import { fetchBalance, satsToBtc } from './balance'

export default function App() {
  return (
    <div className="min-h-screen relative bg-slate-950 text-cyan-50 overflow-hidden">
      <div className="digital-bg"></div>
      
      <header className="sticky top-0 bg-slate-900/80 backdrop-blur-md border-b-2 border-cyan-500/50 shadow-lg z-10">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg float relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              <span className="text-white font-bold text-xl relative z-10 glow-text">₿</span>
              <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-lg animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-cyan-300 glow-text">
                Bitcoin Address & Key Checker
              </h1>
              <span className="text-xs text-cyan-500/70">Runs locally in your browser</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-cyan-300 mb-3 glow-text">
            BITCOIN TOOLS
          </h2>
          <p className="text-cyan-400/80 text-lg">Validate addresses, check balances, and derive addresses from private keys</p>
          <div className="mt-4 flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
        <AddressCard />
        <PrivateKeyCard />
        <Notes />
      </main>
    </div>
  )
}

function AddressCard() {
  const [addr, setAddr] = useState('')
  const [valid, setValid] = useState(null)
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState(null)
  const [error, setError] = useState('')

  const isBech = useMemo(() => /^(bc1|tb1)/i.test(addr.trim()), [addr])

  const onValidate = () => {
    setError('')
    const ok = isValidBtcAddress(addr)
    setValid(ok)
    setBalance(null)
  }

  const onFetchBalance = async () => {
    setError('')
    setLoading(true)
    setBalance(null)
    try {
      const network = /^tb1|^[2mn]|^tb/i.test(addr) ? 'testnet' : 'mainnet'
      const b = await fetchBalance(addr.trim(), { network })
      setBalance(b)
    } catch (e) {
      setError('Failed to fetch balance. The address may be wrong, or the explorer is unavailable.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          <span className="text-white font-bold text-lg relative z-10 glow-text">1</span>
        </div>
        <h2 className="text-xl font-bold text-cyan-300 glow-text">Check an Address</h2>
      </div>
      <label className="label">Bitcoin address</label>
      <input 
        className="input mt-1 font-mono text-sm" 
        placeholder="bc1... or 1... or 3..." 
        value={addr} 
        onChange={e => setAddr(e.target.value)} 
      />
      <div className="mt-4 flex gap-3 flex-wrap">
        <button className="btn" onClick={onValidate}>Validate</button>
        <button className="btn" onClick={onFetchBalance} disabled={!valid || loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⟳</span>
              Checking…
            </span>
          ) : (
            'Get Balance'
          )}
        </button>
      </div>

      {valid === true && (
        <div className="mt-4 p-4 rounded-lg bg-emerald-900/30 border-2 border-emerald-500/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent animate-pulse"></div>
          <p className="badge bg-green-100 mb-0 relative z-10">
            <span className="text-lg">✓</span> Valid address {isBech ? '(bech32)' : '(base58)'}
          </p>
        </div>
      )}
      {valid === false && (
        <div className="mt-4 p-4 rounded-lg bg-red-900/30 border-2 border-red-500/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent animate-pulse"></div>
          <p className="badge bg-rose-100 mb-0 relative z-10">
            <span className="text-lg">✗</span> Invalid address
          </p>
        </div>
      )}

      {balance && (
        <div className="mt-6 p-5 rounded-lg bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-2 border-cyan-500/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent animate-pulse"></div>
          <h3 className="text-sm font-semibold text-cyan-300 mb-4 relative z-10 glow-text">Balance Information</h3>
          <div className="space-y-3 text-sm relative z-10">
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50 border border-cyan-500/30">
              <span className="text-cyan-400">Confirmed:</span>
              <span className="font-mono font-semibold text-cyan-200">
                {balance.confirmed.toLocaleString()} sats <span className="text-cyan-400/70">({satsToBtc(balance.confirmed)} BTC)</span>
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50 border border-cyan-500/30">
              <span className="text-cyan-400">Mempool (pending):</span>
              <span className="font-mono font-semibold text-cyan-200">
                {balance.mempool.toLocaleString()} sats <span className="text-cyan-400/70">({satsToBtc(balance.mempool)} BTC)</span>
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-2 border-cyan-400/50">
              <span className="text-cyan-300 font-semibold">Total:</span>
              <span className="font-mono font-bold text-cyan-200 glow-text">
                {balance.total.toLocaleString()} sats <span className="text-cyan-400">({satsToBtc(balance.total)} BTC)</span>
              </span>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-900/30 border-2 border-red-500/50">
          <p className="text-sm text-red-300 font-medium">{error}</p>
        </div>
      )}
    </section>
  )
}

function PrivateKeyCard() {
  const [priv, setPriv] = useState('')
  const [valid, setValid] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const detectFormat = (s) => {
    const t = s.trim()
    if (!t) return 'none'
    if (/^[5KL9c]/.test(t)) return 'wif' // rough (mainnet/testnet)
    if (/^(0x)?[0-9a-f]{64}$/i.test(t)) return 'hex'
    return 'unknown'
  }

  const onCheck = () => {
    setError('')
    setResult(null)

    const fmt = detectFormat(priv)
    try {
      if (fmt === 'wif') {
        if (!isValidWIF(priv.trim())) { setValid(false); return }
        const r = deriveFromWIF(priv.trim())
        setValid(true); setResult(r)
      } else if (fmt === 'hex') {
        if (!isValidHexPriv(priv.trim())) { setValid(false); return }
        // assume mainnet + compressed
        const r = deriveFromHex(priv.trim(), 'mainnet', true)
        setValid(true); setResult(r)
      } else {
        setValid(false)
      }
    } catch (e) {
      setValid(false)
      setError('Invalid key or unsupported format.')
    }
  }

  return (
    <section className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          <span className="text-white font-bold text-lg relative z-10 glow-text">2</span>
        </div>
        <h2 className="text-xl font-bold text-cyan-300 glow-text">Check a Private Key (local only)</h2>
      </div>
      <label className="label">Private key (WIF or 64-char hex)</label>
      <input 
        className="input mt-1 font-mono text-sm" 
        placeholder="L1..., Kz..., 5H... or 64-char hex" 
        value={priv} 
        onChange={e => setPriv(e.target.value)} 
        type="password"
      />
      <div className="mt-4">
        <button className="btn" onClick={onCheck}>Validate & Derive Addresses</button>
      </div>

      {valid === true && result && (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-lg bg-emerald-900/30 border-2 border-emerald-500/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent animate-pulse"></div>
            <div className="badge bg-green-100 mb-0 relative z-10">
              <span className="text-lg">✓</span> Private key looks valid
            </div>
          </div>
          <div className="p-5 rounded-lg bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-2 border-purple-500/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent animate-pulse"></div>
            <h3 className="text-sm font-semibold text-cyan-300 mb-4 relative z-10 glow-text">Derived Addresses</h3>
            <div className="space-y-3 text-sm relative z-10">
              <div>
                <div className="text-xs font-medium text-cyan-400 mb-1.5">Network:</div>
                <div className="font-mono text-base font-semibold text-cyan-200 bg-slate-800/60 rounded-lg px-3 py-2 border border-purple-500/30">
                  {result.network}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-cyan-400 mb-1.5">P2PKH (1…/m/n…):</div>
                <code className="block bg-slate-800/60 rounded-lg px-3 py-2 font-mono text-sm border border-purple-500/30 text-cyan-200 break-all">
                  {result.p2pkh}
                </code>
              </div>
              <div>
                <div className="text-xs font-medium text-cyan-400 mb-1.5">P2WPKH (bech32 bc1…/tb1…):</div>
                <code className="block bg-slate-800/60 rounded-lg px-3 py-2 font-mono text-sm border border-purple-500/30 text-cyan-200 break-all">
                  {result.p2wpkh}
                </code>
              </div>
              <div>
                <div className="text-xs font-medium text-cyan-400 mb-1.5">P2SH-P2WPKH (3…/2…):</div>
                <code className="block bg-slate-800/60 rounded-lg px-3 py-2 font-mono text-sm border border-purple-500/30 text-cyan-200 break-all">
                  {result.p2sh_p2wpkh}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
      {valid === false && (
        <div className="mt-4 p-4 rounded-lg bg-red-900/30 border-2 border-red-500/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent animate-pulse"></div>
          <p className="badge bg-rose-100 mb-0 relative z-10">
            <span className="text-lg">✗</span> Invalid or unsupported private key
          </p>
        </div>
      )}
      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-900/30 border-2 border-red-500/50">
          <p className="text-sm text-red-300 font-medium">{error}</p>
        </div>
      )}

      <div className="mt-6 p-4 rounded-lg bg-blue-900/30 border-2 border-blue-500/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent animate-pulse"></div>
        <p className="text-xs text-cyan-300 leading-relaxed relative z-10">
          <span className="font-semibold text-cyan-400 glow-text">🔒 Privacy:</span> Your key never leaves the browser. No network calls are made during validation or derivation.
        </p>
      </div>
    </section>
  )
}

function Notes() {
  return (
    <section className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          <span className="text-white text-lg relative z-10">ℹ</span>
        </div>
        <h3 className="text-lg font-bold text-cyan-300 glow-text">Notes & Safety</h3>
      </div>
      <ul className="space-y-3 text-sm text-cyan-200">
        <li className="flex items-start gap-3">
          <span className="text-cyan-400 mt-0.5 glow-text">▶</span>
          <span>Supports Base58 (P2PKH, P2SH) and bech32 (P2WPKH) address validation.</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-cyan-400 mt-0.5 glow-text">▶</span>
          <span>Private keys accepted as WIF or 32-byte hex; derived addresses shown for P2PKH, native SegWit (bech32), and P2SH-wrapped SegWit.</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-cyan-400 mt-0.5 glow-text">▶</span>
          <span>Balance is fetched via Blockstream explorer API; if it rate-limits or fails, try again later.</span>
        </li>
        <li className="flex items-start gap-3 p-3 rounded-lg bg-amber-900/30 border-2 border-amber-500/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent animate-pulse"></div>
          <span className="text-amber-400 mt-0.5 font-bold glow-text relative z-10">⚠</span>
          <span className="font-medium text-amber-300 relative z-10">Never paste real keys on an untrusted machine. Consider using this offline.</span>
        </li>
      </ul>
    </section>
  )
}
