import axios from 'axios'

// Returns { confirmed, mempool, total } in satoshis
export async function fetchBalance(address, { network = 'mainnet' } = {}) {
  // Blockstream explorer API (no key). Has CORS enabled.
  const base = network === 'testnet'
    ? 'https://blockstream.info/testnet/api'
    : 'https://blockstream.info/api'
  const url = `${base}/address/${address}`
  const { data } = await axios.get(url, { timeout: 15000 })
  const confirmed = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum
  const mempool = data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum
  return { confirmed, mempool, total: confirmed + mempool }
}

export function satsToBtc(sats) {
  return (sats / 1e8).toFixed(8)
}
