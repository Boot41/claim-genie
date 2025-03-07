import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBars, FaTimes, FaUser } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import Button from '../components/common/Button'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, isLoading, logout: authLogout } = useAuth()
  const navigate = useNavigate()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleLogout = () => {
    authLogout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-primary-600 font-bold text-2xl">ClaimGenie</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Don't show menu items while authentication is loading */}
            {!isLoading && isAuthenticated ? (
              <>
            <Link to="/" className="px-3 py-2 rounded-md text-md font-medium text-gray-700 hover:text-primary-600">
              Home
            </Link>
                <Link to="/dashboard" className="px-3 py-2 rounded-md text-md font-medium text-gray-700 hover:text-primary-600">
                  Dashboard
                </Link>
                <Link to="/new-claim" className="px-3 py-2 rounded-md text-md font-medium text-gray-700 hover:text-primary-600">
                  New Claim
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-4 btn btn-outline"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
              onClick={toggleMenu}
            >
              Home
            </Link>
            {!isLoading && isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/new-claim"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                  onClick={toggleMenu}
                >
                  New Claim
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    toggleMenu()
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                  onClick={toggleMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar