# Simple BTC Tool

A lightweight React + Vite application for validating Bitcoin addresses, checking balances via the Blockstream explorer, and deriving addresses from private keys. All key operations run locally in the browser so that sensitive data never leaves the client.

## Features

- **Address validation** – supports Base58 (P2PKH & P2SH) and bech32 (SegWit) formats with instant feedback.
- **Balance lookup** – fetches confirmed, mempool, and total balances from the Blockstream API for mainnet and testnet addresses.
- **Private key checks** – accepts WIF and 64 character hex keys, validates them locally, and derives P2PKH, P2WPKH, and P2SH-P2WPKH addresses.
- **Copy helpers** – quickly copy the input address or derived outputs to the clipboard with accessible status messaging.
- **UI enhancements** – responsive layout, improved form semantics, validation states, and clear error handling for a smoother UX.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   Vite will print a local URL where you can open the app in your browser.
3. Run a production build (optional):
   ```bash
   npm run build
   ```

## Privacy & security

- Private keys are validated and derived entirely client-side. No network requests are performed with key material.
- Balance lookups query the public Blockstream API. If the service is unavailable or rate limited, simply try again later.
- Never paste real private keys on an untrusted device. For maximum safety consider running this tool offline.

## Project structure

- `src/App.jsx` – React components and UI logic.
- `src/btc.js` – validation helpers and address derivation utilities built on `bitcoinjs-lib`.
- `src/balance.js` – balance fetching helpers for the Blockstream API.
- `src/index.css` – Tailwind-powered design tokens and component styles.

## License

This project is provided as-is without warranty. Use at your own risk.
