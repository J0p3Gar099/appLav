/**
 * main.tsx — Punto de entrada del bundle
 *
 * Aquí montamos React en el DOM y envolvemos la app en BrowserRouter.
 *
 * ¿Por qué BrowserRouter va aquí y no en App.tsx?
 * Porque Router es infraestructura (como un Provider de contexto global).
 * App.tsx debe poder "no saber" dónde vive en la jerarquía del router.
 * Esto también facilita testing: en tests puedes usar MemoryRouter en lugar
 * de BrowserRouter sin tocar App.tsx.
 *
 * StrictMode: en desarrollo monta/desmonta componentes dos veces para
 * detectar side-effects no puros. Si ves efectos duplicados, es esto.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('#root no encontrado en index.html')

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
