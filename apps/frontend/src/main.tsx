import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const bootstrap = (): void => {
  const container = document.getElementById('root')
  if (!container) {
    throw new Error('Missing #root element for React mount.')
  }

  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

bootstrap()
