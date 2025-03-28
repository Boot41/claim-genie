import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import ChatBot from './pages/ChatBot'

// Layouts
import MainLayout from './layouts/MainLayout'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NewClaim from './pages/NewClaim'
import ClaimDetails from './pages/ClaimDetails'
import AddPolicy from './pages/AddPolicy'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="*" element={<MainLayout />}>
          <Route path='*' element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="new-claim" element={<NewClaim />} />
          <Route path="claims/:id" element={<ClaimDetails />} />
          <Route path="add-policy" element={<AddPolicy />} />
          <Route path="chatting" element={<ChatBot />} />
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  )
}

export default App