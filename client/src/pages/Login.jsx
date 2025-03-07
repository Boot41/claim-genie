import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
})

function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (values) => {
    setIsLoading(true)
    
    try {
      // Make real API call to authenticate with backend
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.email,
          password: values.password
        })
      })
      
      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Store refresh token in localStorage if available
      if (data.refresh) {
        localStorage.setItem('refreshToken', data.refresh)
      }
      
      // Set the user in auth context with token
      login({ email: values.email }, data.access)
      
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="card">
        <h1 className="text-2xl font-bold text-center mb-6">Log In to ClaimGenie</h1>
        
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  className="input"
                  placeholder="your@email.com"
                />
                <ErrorMessage name="email" component="div" className="form-error" />
              </div>
              
              <div className="form-group">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="form-label">Password</label>
                  <Link to="#" className="text-sm text-primary-600 hover:text-primary-500">
                    Forgot password?
                  </Link>
                </div>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  className="input"
                  placeholder="••••••••"
                />
                <ErrorMessage name="password" component="div" className="form-error" />
              </div>
              
              <div className="form-group">
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isSubmitting || isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Log In'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
        
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login