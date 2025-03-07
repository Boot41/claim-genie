import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'

const RegisterSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First name is required'),
  lastName: Yup.string()
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  agreeTerms: Yup.boolean()
    .oneOf([true], 'You must agree to the terms and conditions')
})

function Register() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (values) => {
    setIsLoading(true)
    
    try {
      // Register with the backend
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.email,  // Using email as username
          email: values.email,
          password: values.password,
          password2: values.confirmPassword,
          first_name: values.firstName,
          last_name: values.lastName
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Registration failed')
      }
      
      // Registration successful
      toast.success('Registration successful! Please log in.')
      navigate('/login')  // Redirect to login page instead of dashboard
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="card">
        <h1 className="text-2xl font-bold text-center mb-6">Create Your ClaimGenie Account</h1>
        
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            agreeTerms: false
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <Field
                    type="text"
                    name="firstName"
                    id="firstName"
                    className="input"
                    placeholder="John"
                  />
                  <ErrorMessage name="firstName" component="div" className="form-error" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <Field
                    type="text"
                    name="lastName"
                    id="lastName"
                    className="input"
                    placeholder="Doe"
                  />
                  <ErrorMessage name="lastName" component="div" className="form-error" />
                </div>
              </div>
              
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
                <label htmlFor="password" className="form-label">Password</label>
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
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <Field
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  className="input"
                  placeholder="••••••••"
                />
                <ErrorMessage name="confirmPassword" component="div" className="form-error" />
              </div>
              
              <div className="form-group">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <Field
                      type="checkbox"
                      name="agreeTerms"
                      id="agreeTerms"
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreeTerms" className="text-gray-700">
                      I agree to the{' '}
                      <Link to="#" className="text-primary-600 hover:text-primary-500">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="#" className="text-primary-600 hover:text-primary-500">
                        Privacy Policy
                      </Link>
                    </label>
                    <ErrorMessage name="agreeTerms" component="div" className="form-error" />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isSubmitting || isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
        
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-500">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register