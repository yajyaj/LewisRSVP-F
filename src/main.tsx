import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { siteConfig } from './siteConfig'
import './styles.css'
import './invitation-foundation.css'

document.title = `${siteConfig.name} - ${siteConfig.tagline}`

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
