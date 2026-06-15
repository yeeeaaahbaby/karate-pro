import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// firebase-messaging-sw.js supprimé - OneSignal gère les push via OneSignalSDKWorker.js
// L'initialisation OneSignal est dans App.jsx
