import { Link, useNavigate } from 'react-router-dom'
import { FaRobot, FaClipboardCheck, FaVideo, FaShieldAlt } from 'react-icons/fa'
import Button from '../components/common/Button'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Simplify Your Insurance Claims with AI
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              ClaimGenie helps you understand your coverage and generate accurate insurance claims in minutes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {!user && <Button text="Get Started" primary={true} onclick={() => navigate('/register')}/>}
              <button className='border-2 border-white text-white hover:bg-white hover:text-primary-700 px-8 py-3 text-lg btn' onClick={() => navigate(user? '/dashboard' : '/login')}>{user? "Go to Dashboard":"Login"}</button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How ClaimGenie Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform simplifies the insurance claim process from start to finish.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary-100 p-4 rounded-full">
                  <FaClipboardCheck className="text-primary-600 text-3xl" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Simple Questionnaire</h3>
              <p className="text-gray-600">
                Answer a few questions about your incident and insurance policy.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary-100 p-4 rounded-full">
                  <FaRobot className="text-primary-600 text-3xl" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Our AI analyzes your coverage and generates a comprehensive claim.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary-100 p-4 rounded-full">
                  <FaVideo className="text-primary-600 text-3xl" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Live Assistance</h3>
              <p className="text-gray-600">
                Get real-time help via video chat if you need additional support.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary-100 p-4 rounded-full">
                  <FaShieldAlt className="text-primary-600 text-3xl" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Submission</h3>
              <p className="text-gray-600">
                Review and submit your claim directly to your insurance provider.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Thousands of people have simplified their insurance claims with ClaimGenie.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-gray-500 text-sm">Auto Insurance Claim</p>
                </div>
              </div>
              <p className="text-gray-600">
                "ClaimGenie made filing my auto insurance claim so easy. The AI helped me understand my coverage and generated a perfect claim in minutes."
              </p>
            </div>
            
            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Michael Rodriguez</h4>
                  <p className="text-gray-500 text-sm">Home Insurance Claim</p>
                </div>
              </div>
              <p className="text-gray-600">
                "After storm damage to my home, I was dreading the claims process. ClaimGenie walked me through everything and made it painless."
              </p>
            </div>
            
            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Jennifer Lee</h4>
                  <p className="text-gray-500 text-sm">Health Insurance Claim</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The video chat feature was a lifesaver when I needed help understanding some complex health insurance terms. Highly recommend!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Simplify Your Insurance Claims?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied users who have made their insurance claims process easier with ClaimGenie.
          </p>
          <Button text="Get Started for Free" primary={true} onclick={() => navigate('/register')} />
        </div>
      </section>
    </div>
  )
}

export default Home