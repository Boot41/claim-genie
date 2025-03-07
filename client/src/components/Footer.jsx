import { Link } from 'react-router-dom'
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa'

function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between gap-8">

          {/* Footer About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ClaimGenie</h3>
            <p className="text-gray-300 text-md">
              Simplifying insurance claims with AI assistance.
            </p>
          </div>
          
          {/* Footer Quick Links */}
          <div className='flex gap-36'>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white text-md">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white text-md">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/new-claim" className="text-gray-300 hover:text-white text-md">
                  New Claim
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-gray-300 hover:text-white text-md">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white text-md">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white text-md">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
          </div>
          
          {/* Footer Socials*/}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <FaTwitter size={24} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FaFacebook size={24} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FaInstagram size={24} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300 text-md">
          <p>&copy; {currentYear} ClaimGenie. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer