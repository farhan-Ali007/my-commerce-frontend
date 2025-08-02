import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './store/index.js'
import { HelmetProvider } from 'react-helmet-async'
import { GlobalColorProvider } from './contexts/GlobalColorProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <GlobalColorProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </GlobalColorProvider>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>,
)
