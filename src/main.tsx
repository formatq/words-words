import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { validateData } from './lib/combos'
import './index.css'

if (import.meta.env.DEV) {
  const errors = validateData()
  if (errors.length > 0) {
    console.error('phrasal-verbs.json: invariant violations:\n' + errors.join('\n'))
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
