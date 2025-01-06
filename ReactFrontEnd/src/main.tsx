import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'primeicons/primeicons.css'; 
import { PrimeReactProvider } from 'primereact/api';
import Root from './Routes/Root.tsx';



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrimeReactProvider>
     <Root/>
    </PrimeReactProvider>
  </StrictMode>,
)
