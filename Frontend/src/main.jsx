import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

// Google OAuth Client ID for SpaceLink Authentication
const clientId = "40512885165-6tm5icspl5ccbpocv2qdjco9l0p0507d.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* Wrap the entire app with GoogleOAuthProvider to enable Google Login anywhere */}
        <GoogleOAuthProvider clientId={clientId}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </GoogleOAuthProvider>
    </StrictMode>,
)