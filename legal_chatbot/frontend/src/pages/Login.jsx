import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon, Mail, Lock, ArrowRight } from 'lucide-react'
import Logo from '../components/Logo'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignup, setIsSignup] = useState(false)

  const { login, signup } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignup) {
        await signup(name, email, password)
      } else {
        await login(email, password)
      }
      navigate('/chat')
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (isSignup
          ? 'Signup failed. Please try again.'
          : 'Login failed. Please try again.')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative bg-slate-50 dark:bg-slate-900">
      
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-6 h-6 text-slate-700 dark:text-slate-200" /> : <Moon className="w-6 h-6 text-slate-700" />}
      </button>

      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6 hover:opacity-80 transition">
            <Logo size="large" className="text-slate-900 dark:text-slate-50" />
          </Link>

          <h1 className="text-3xl font-serif font-semibold text-slate-900 dark:text-slate-50 mb-2">
            {isSignup ? 'Create Account' : 'Access Platform'}
          </h1>

          <p className="text-slate-600 dark:text-slate-300">
            {isSignup
              ? 'Register for legal research access'
              : 'Sign in to access the legal research database'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {error && (
              <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {isSignup && (
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="Enter full name"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <input type="checkbox" className="w-4 h-4 border-slate-400" />
                Remember me
              </label>
              <a href="#" className="text-slate-700 dark:text-slate-200 hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium transition disabled:opacity-50"
            >
              {loading ? (isSignup ? 'Creating account…' : 'Signing in…') : (
                <>
                  {isSignup ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Signup/Login */}
          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignup(!isSignup)
                setError('')
              }}
              className="font-medium text-slate-900 dark:text-slate-50 hover:underline"
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          By continuing, you agree to our{' '}
          <a href="#" className="underline">Terms of Service</a> and{' '}
          <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}
