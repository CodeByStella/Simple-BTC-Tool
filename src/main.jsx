import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Buffer polyfill for the browser
import { Buffer } from 'buffer'
window.Buffer = Buffer

// Init ECC backend for bitcoinjs-lib v6+
import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from '@bitcoinerlab/secp256k1'
bitcoin.initEccLib(ecc)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
