import React, { lazy, useEffect } from 'react'
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { themeChange } from 'theme-change'
import checkAuth from './app/auth';
import initializeApp from './app/init';

// Importing pages
const Layout = lazy(() => import('./containers/Layout'))
const Login = lazy(() => import('./pages/Login'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Register = lazy(() => import('./pages/Register'))
const Documentation = lazy(() => import('./pages/Documentation'))

// Initializing different libraries
initializeApp()

// Check for login and initialize axios
const token = checkAuth()

function App() {

  useEffect(() => {
    // 👆 daisy UI themes initialization
    themeChange(false)
  }, [])

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Adding route for package details */}
       

          {/* Layout for other app routes */}
          <Route path="/app/*" element={<Layout />} />

          {/* Redirect to dashboard or login based on auth token */}
          <Route path="*" element={<Navigate to={token ? "/app/dashboard" : "/login"} replace />} />
        </Routes>
      </Router>
    </>
  )
}

export default App;
