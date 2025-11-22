/* 
Functions:
createRoot -> Entry point of the web application. 
  Creates the React root, and then renders the <App/> component
Inputs: None
Outputs: Injects the entire React component tree into the DOM
Authors: Colin Treanor
Creation Date: 10/20/2025
*/

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
