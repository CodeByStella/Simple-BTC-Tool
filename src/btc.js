import * as bitcoin from 'bitcoinjs-lib'
import bs58check from 'bs58check'
import { bech32 } from 'bech32'

// -------- Address validation --------
export function isValidBase58(addr) {
  try {
    const payload = bs58check.decode(addr)
    // payload[0] is version: 0x00 (P2PKH), 0x05 (P2SH)
    return payload.length === 21 && (payload[0] === 0x00 || payload[0] === 0x05)
  } catch {
    return false
  }
}

export function isValidBech32(addr) {
  try {
    const { prefix, words } = bech32.decode(addr)
    if (prefix !== 'bc' && prefix !== 'tb') return false // mainnet/testnet
    const version = words[0]
    if (version < 0 || version > 16) return false
    const data = bech32.fromWords(words.slice(1))
    return data.length >= 2 && data.length <= 40 // witness program length
  } catch {
    return false
  }
}

export function isValidBtcAddress(addr) {
  if (!addr) return false
  const a = addr.trim()
  if (/^(bc1|tb1)/i.test(a)) return isValidBech32(a)
  return isValidBase58(a)
}

// -------- Private key validation --------
export function isValidWIF(wif, network = bitcoin.networks.bitcoin) {
  try {
    bitcoin.ECPair.fromWIF(wif, network)
    return true
  } catch {
    // try testnet as well (so users aren't confused)
    try {
      bitcoin.ECPair.fromWIF(wif, bitcoin.networks.testnet)
      return true
    } catch {
      return false
    }
  }
}

export function isValidHexPriv(hex) {
  try {
    const b = Buffer.from(hex.replace(/^0x/, ''), 'hex')
    if (b.length !== 32) return false
    // simple curve range check (low effort)
    return b.some(v => v !== 0)
  } catch {
    return false
  }
}

// -------- Derive addresses from private key --------
export function deriveFromWIF(wif) {
  // try mainnet then testnet
  let network = bitcoin.networks.bitcoin
  let keyPair
  try {
    keyPair = bitcoin.ECPair.fromWIF(wif, network)
  } catch {
    network = bitcoin.networks.testnet
    keyPair = bitcoin.ECPair.fromWIF(wif, network)
  }

  const pubkey = keyPair.publicKey

  const p2pkh = bitcoin.payments.p2pkh({ pubkey, network }).address
  const p2wpkh = bitcoin.payments.p2wpkh({ pubkey, network }).address
  const p2sh_p2wpkh = bitcoin.payments.p2sh({
    redeem: bitcoin.payments.p2wpkh({ pubkey, network }),
    network
  }).address

  return { network: network === bitcoin.networks.bitcoin ? 'mainnet' : 'testnet', p2pkh, p2wpkh, p2sh_p2wpkh }
}

export function deriveFromHex(hex, networkName = 'mainnet', compressed = true) {
  const network = networkName === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
  const d = Buffer.from(hex.replace(/^0x/, ''), 'hex')
  const keyPair = bitcoin.ECPair.fromPrivateKey(d, { compressed })
  const pubkey = keyPair.publicKey

  const p2pkh = bitcoin.payments.p2pkh({ pubkey, network }).address
  const p2wpkh = bitcoin.payments.p2wpkh({ pubkey, network }).address
  const p2sh_p2wpkh = bitcoin.payments.p2sh({
    redeem: bitcoin.payments.p2wpkh({ pubkey, network }),
    network
  }).address

  return { network: networkName, p2pkh, p2wpkh, p2sh_p2wpkh }
}
