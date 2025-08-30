import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import DashboardPage from './Page/DashboardPage'
import LoginPage from './Page/LoginPage'
import RegisterPage from './Page/RegisterPage'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './context/ProtectedRoute'
import { useEffect, useState } from 'react'
import { generteTOken, messaging } from './firebase'
import { onMessage } from 'firebase/messaging'



function App() {




  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path='/' element={<DashboardPage />} />
            </Route>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster position='top-right' reverseOrder={false} />
      </AuthProvider>
    </>
  )
}

export default App
