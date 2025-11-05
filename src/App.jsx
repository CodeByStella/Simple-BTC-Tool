import { useMemo, useState } from 'react'
import { isValidBtcAddress, isValidWIF, isValidHexPriv, deriveFromWIF, deriveFromHex } from './btc'
import { fetchBalance, satsToBtc } from './balance'

export default function App() {
  return (
    <div className="min-h-screen relative premium-app text-slate-100">
      <div className="digital-bg"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <header className="relative z-20">
        <div className="max-w-5xl mx-auto px-6 pt-8 pb-6">
          <div className="header-shell">
            <div className="header-brand">
              <div className="logo-glass">
                <span className="text-2xl font-black">₿</span>
                <div className="logo-glass__shine" aria-hidden="true"></div>
              </div>
              <div className="header-copy">
                <p className="header-eyebrow">Simple BTC Tool</p>
                <h1 className="header-title">Premium Bitcoin Intelligence Suite</h1>
                <p className="header-subtitle">Client-side analysis. No sign-ups, no tracking.</p>
              </div>
            </div>
            <div className="header-actions">
              <div className="header-badge">
                <span className="header-status" aria-hidden="true"></span>
                <span>Runs entirely in your browser</span>
              </div>
              <a
                className="star-btn"
                href="https://github.com/victorevc/Simple-BTC-Tool"
                target="_blank"
                rel="noreferrer noopener"
              >
                <svg
                  className="star-btn__icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 3.75 14.31 9l5.19.38-3.9 3.36 1.18 5.13L12 15.96l-4.78 1.91L8.4 12.74l-3.9-3.36L9.69 9 12 3.75z" />
                </svg>
                <span>Star this repository</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-16 relative z-20">
        <Hero />
        <div className="grid gap-8 lg:grid-cols-2">
          <AddressCard />
          <PrivateKeyCard />
        </div>
        <Notes />
      </main>
    </div>
  )
}

function Hero() {
  const features = [
    {
      title: 'Format savant',
      text: 'Understands legacy Base58, nested SegWit, native SegWit, and taproot bech32m instantly.',
      icon: '🎯',
    },
    {
      title: 'Balance pulse',
      text: 'Pulls confirmed, unconfirmed, and total balances from Blockstream with graceful fallbacks.',
      icon: '📡',
    },
    {
      title: 'Secure derivation',
      text: 'Derives P2PKH, P2WPKH, and P2SH-P2WPKH locally—keys never leave your browser.',
      icon: '🔐',
    },
  ]

  const metrics = [
    { label: 'Supported networks', value: 'Mainnet & Testnet' },
    { label: 'Checks completed', value: 'Instant feedback in <1s' },
    { label: 'Clipboard helpers', value: 'Accessible copy confirmations' },
  ]

  return (
    <section className="hero-card">
      <div className="hero-card__glow" aria-hidden="true"></div>
      <div className="hero-card__content">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="hero-eyebrow">Ultra glass experience</div>
            <h2 className="hero-title">
              Validate Bitcoin addresses & keys with <span className="gradient-text">immersive clarity</span>.
            </h2>
            <p className="hero-lead">
              A cinematic dashboard that pairs luminous gradients with precise tooling. Inspect addresses, surface balances, and
              verify private keys without sending any data away.
            </p>
            <div className="hero-actions">
              <a className="btn btn-glow" href="#address-tool">
                <span>Start validating</span>
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="hero-action__icon"
                >
                  <path
                    d="M5 10h10M11 6l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <div className="hero-pills">
                <span className="pill">Offline Ready</span>
                <span className="pill">Open Source</span>
              </div>
            </div>
            <dl className="hero-metrics">
              {metrics.map(metric => (
                <div key={metric.label} className="hero-metric">
                  <dt>{metric.label}</dt>
                  <dd>{metric.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="hero-showcase">
            {features.map(feature => (
              <div key={feature.title} className="hero-feature">
                <div className="hero-feature__accent"></div>
                <div className="hero-feature__icon" aria-hidden="true">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="hero-feature__title">{feature.title}</h3>
                  <p className="hero-feature__text">{feature.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function AddressCard() {
  const [addr, setAddr] = useState('')
  const [valid, setValid] = useState(null)
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState(null)
  const [error, setError] = useState('')
  const [copyMsg, setCopyMsg] = useState('')

  const isBech = useMemo(() => /^(bc1|tb1)/i.test(addr.trim()), [addr])

  const resetCopyMsg = () => setCopyMsg('')

  const onAddrChange = (value) => {
    setAddr(value)
    setValid(null)
    setBalance(null)
    setError('')
    resetCopyMsg()
  }

  const onValidate = () => {
    setError('')
    const ok = isValidBtcAddress(addr)
    setValid(ok)
    setBalance(null)
  }

  const onFetchBalance = async () => {
    const normalized = addr.trim()
    if (!normalized || !valid) {
      setError('Validate the address before fetching the balance.')
      return
    }
    setError('')
    setLoading(true)
    setBalance(null)
    try {
      const network = /^(tb1|[2mn]|tb)/i.test(normalized) ? 'testnet' : 'mainnet'
      const b = await fetchBalance(normalized, { network })
      setBalance(b)
    } catch (e) {
      setError('Failed to fetch balance. The address may be wrong, or the explorer is unavailable.')
    } finally {
      setLoading(false)
    }
  }

  const onCopyAddress = async () => {
    const value = addr.trim()
    if (!value) return
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof window !== 'undefined' && window.isSecureContext) {
        await navigator.clipboard.writeText(value)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = value
        textarea.style.position = 'fixed'
        textarea.style.top = '-1000px'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopyMsg('Address copied to clipboard')
      setTimeout(() => resetCopyMsg(), 2500)
    } catch (err) {
      setCopyMsg('Unable to copy automatically—please copy manually.')
      setTimeout(() => resetCopyMsg(), 3500)
    }
  }

  return (
    <section id="address-tool" className="card" aria-labelledby="address-card-heading">
      <div className="card__glow" aria-hidden="true"></div>
      <div className="card__content">
        <header className="card-header">
          <div className="card-icon">①</div>
          <div>
            <h2 id="address-card-heading" className="card-title">Bitcoin address intelligence</h2>
            <p className="card-subtitle">Validate any address format and surface balances in one sweep.</p>
          </div>
        </header>

        <label className="label" htmlFor="btc-address-input">Bitcoin address</label>
        <div className="input-shell">
          <span className="input-shell__icon" aria-hidden="true">₿</span>
          <input
            id="btc-address-input"
            className="input"
            placeholder="bc1... or 1... or 3..."
            value={addr}
            onChange={e => onAddrChange(e.target.value)}
            onBlur={() => addr && setAddr(addr.trim())}
            autoComplete="off"
            spellCheck="false"
            aria-invalid={valid === false}
          />
        </div>

        <div className="action-row">
          <button className="btn" type="button" onClick={onValidate} disabled={!addr.trim()}>
            Validate address
          </button>
          <button className="btn btn-outline" type="button" onClick={onFetchBalance} disabled={!valid || loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="spinner" aria-hidden="true"></span>
                Checking…
              </span>
            ) : (
              'Get balance'
            )}
          </button>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={onCopyAddress}
            disabled={!addr.trim()}
          >
            Copy
          </button>
        </div>

        {valid === true && (
          <div className="callout callout--success" role="status">
            <div className="callout__glow" aria-hidden="true"></div>
            <div>
              <p className="callout__title">Address is valid {isBech ? '(bech32)' : '(base58)'}</p>
              <p className="callout__text">You can now pull live balances or share confidently.</p>
            </div>
          </div>
        )}
        {valid === false && (
          <div className="callout callout--error" role="alert">
            <div className="callout__glow" aria-hidden="true"></div>
            <div>
              <p className="callout__title">Invalid address</p>
              <p className="callout__text">Double-check characters or confirm the format being used.</p>
            </div>
          </div>
        )}

        {balance && (
          <div className="metrics">
            <div className="metrics__header">
              <h3 className="metrics__title">Balance insights</h3>
              <span className="metrics__tag">Live via Blockstream</span>
            </div>
            <div className="metrics__grid">
              <MetricCard label="Confirmed" sats={balance.confirmed} />
              <MetricCard label="Mempool" sats={balance.mempool} />
              <MetricCard label="Total" sats={balance.total} highlight />
            </div>
          </div>
        )}

        {error && (
          <div className="callout callout--warning" role="alert">
            <div className="callout__glow" aria-hidden="true"></div>
            <p className="callout__title">{error}</p>
          </div>
        )}

        {copyMsg && (
          <p className="copy-feedback" role="status" aria-live="polite">{copyMsg}</p>
        )}
      </div>
    </section>
  )
}

function MetricCard({ label, sats, highlight }) {
  return (
    <div className={`metric ${highlight ? 'metric--highlight' : ''}`}>
      <div className="metric__label">{label}</div>
      <div className="metric__value">{sats.toLocaleString()} <span className="metric__unit">sats</span></div>
      <div className="metric__secondary">{satsToBtc(sats)} BTC</div>
    </div>
  )
}

function PrivateKeyCard() {
  const [priv, setPriv] = useState('')
  const [valid, setValid] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [showPriv, setShowPriv] = useState(false)
  const [copiedField, setCopiedField] = useState('')

  const detectFormat = (s) => {
    const t = s.trim()
    if (!t) return 'none'
    if (/^[5KL9c]/.test(t)) return 'wif' // rough (mainnet/testnet)
    if (/^(0x)?[0-9a-f]{64}$/i.test(t)) return 'hex'
    return 'unknown'
  }

  const onPrivChange = (value) => {
    setPriv(value)
    setValid(null)
    setResult(null)
    setError('')
    setCopiedField('')
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

  const copyValue = async (value, field) => {
    if (!value) return
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof window !== 'undefined' && window.isSecureContext) {
        await navigator.clipboard.writeText(value)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = value
        textarea.style.position = 'fixed'
        textarea.style.top = '-1000px'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopiedField(field)
      setTimeout(() => setCopiedField(''), 2500)
    } catch (err) {
      setError('Copy failed. Please copy manually.')
    }
  }

  return (
    <section className="card" aria-labelledby="private-key-card-heading">
      <div className="card__glow" aria-hidden="true"></div>
      <div className="card__content">
        <header className="card-header">
          <div className="card-icon">②</div>
          <div>
            <h2 id="private-key-card-heading" className="card-title">Private key analysis (local)</h2>
            <p className="card-subtitle">Derive multiple address types without a single network call.</p>
          </div>
        </header>

        <label className="label" htmlFor="priv-key-input">Private key (WIF or 64-char hex)</label>
        <div className="input-shell">
          <span className="input-shell__icon" aria-hidden="true">⚷</span>
          <input
            id="priv-key-input"
            className="input pr-28"
            placeholder="L1..., Kz..., 5H... or 64-char hex"
            value={priv}
            onChange={e => onPrivChange(e.target.value)}
            type={showPriv ? 'text' : 'password'}
            spellCheck="false"
            autoComplete="off"
            aria-invalid={valid === false}
          />
          <button
            type="button"
            className="toggle-visibility"
            onClick={() => setShowPriv(s => !s)}
          >
            {showPriv ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="input-hint">No data leaves your browser. Toggle visibility to double-check before deriving.</p>

        <div className="action-row">
          <button className="btn" type="button" onClick={onCheck} disabled={!priv.trim()}>
            Validate & derive
          </button>
        </div>

        {valid === true && result && (
          <div className="space-y-4">
            <div className="callout callout--success" role="status">
              <div className="callout__glow" aria-hidden="true"></div>
              <div>
                <p className="callout__title">Private key recognised</p>
                <p className="callout__text">Addresses below map to common spend paths.</p>
              </div>
            </div>
            <div className="derived">
              <div>
                <div className="derived__label">Network</div>
                <div className="derived__value">{result.network}</div>
              </div>
              <div>
                <div className="derived__label">P2PKH (1…/m/n…)</div>
                <CopyRow value={result.p2pkh} label="p2pkh" copiedField={copiedField} copyValue={copyValue} />
              </div>
              <div>
                <div className="derived__label">P2WPKH (bc1…/tb1…)</div>
                <CopyRow value={result.p2wpkh} label="p2wpkh" copiedField={copiedField} copyValue={copyValue} />
              </div>
              <div>
                <div className="derived__label">P2SH-P2WPKH (3…/2…)</div>
                <CopyRow value={result.p2sh_p2wpkh} label="p2sh" copiedField={copiedField} copyValue={copyValue} />
              </div>
            </div>
          </div>
        )}

        {valid === false && (
          <div className="callout callout--error" role="alert">
            <div className="callout__glow" aria-hidden="true"></div>
            <div>
              <p className="callout__title">Invalid or unsupported private key</p>
              <p className="callout__text">Check the length, prefix, or compression flags.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="callout callout--warning" role="alert">
            <div className="callout__glow" aria-hidden="true"></div>
            <p className="callout__title">{error}</p>
          </div>
        )}

        <div className="privacy-blurb" role="note">
          <div className="privacy-blurb__icon" aria-hidden="true">🔒</div>
          <p className="privacy-blurb__text">
            Keys never leave this page. Network access is only used when you explicitly fetch balances for a validated address.
          </p>
        </div>
      </div>
    </section>
  )
}

function CopyRow({ value, label, copiedField, copyValue }) {
  return (
    <div className="copy-row">
      <code className="code-block">{value}</code>
      <button className="btn btn-ghost" type="button" onClick={() => copyValue(value, label)}>
        {copiedField === label ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

function Notes() {
  const notes = [
    {
      title: 'Format coverage',
      text: 'Supports Base58 (P2PKH & P2SH) plus bech32 (P2WPKH) validation with strict checksum checks.',
    },
    {
      title: 'Key derivations',
      text: 'Accepts both compressed & uncompressed private keys in WIF or raw hex and derives common spend paths.',
    },
    {
      title: 'Balance sourcing',
      text: 'Balances are queried via the official Blockstream explorer. If the API times out, simply try again.',
    },
    {
      title: 'Security mindset',
      text: 'Never paste secrets on untrusted machines and consider using this offline for maximum safety.',
      highlight: true,
    },
  ]

  return (
    <section className="card" aria-labelledby="notes-heading">
      <div className="card__glow" aria-hidden="true"></div>
      <div className="card__content space-y-6">
        <header className="card-header">
          <div className="card-icon">ℹ</div>
          <div>
            <h2 id="notes-heading" className="card-title">Notes & best practices</h2>
            <p className="card-subtitle">Keep these in mind as you validate addresses or derive keys.</p>
          </div>
        </header>
        <div className="note-grid">
          {notes.map(note => (
            <div key={note.title} className={`note ${note.highlight ? 'note--highlight' : ''}`}>
              <h3 className="note__title">{note.title}</h3>
              <p className="note__text">{note.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
