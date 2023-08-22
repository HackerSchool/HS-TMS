import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import { SnackbarProvider } from "notistack"
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <SnackbarProvider 
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                maxSnack={5}
            >
                <App />
            </SnackbarProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
