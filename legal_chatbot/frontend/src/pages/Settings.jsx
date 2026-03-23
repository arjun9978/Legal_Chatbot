import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ArrowLeft, User, Mail, Lock, Save } from 'lucide-react'
import { getApiUrl } from '../services/api'

const API_URL = getApiUrl()

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDark } = useTheme()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  })
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfileData({
          name: data.user.name || '',
          email: data.user.email || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch(`${API_URL}/user/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        // Update local user data
        const updatedUser = { ...user, ...profileData }
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      setLoading(false)
      return
    }

    if (passwordData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_URL}/user/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' })
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        })
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to change password' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error changing password' })
    } finally {
      setLoading(false)
    }
  }

 return (
  <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
    {/* Header */}
    <div className="bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/chat')}
          className="p-2 rounded-md hover:bg-light-hover dark:hover:bg-dark-hover transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-xl font-serif font-semibold text-primary dark:text-white">
          Account Settings
        </h1>
      </div>
    </div>

    {/* Content */}
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Message */}
      {message.text && (
        <div className={`px-4 py-3 text-sm border ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile */}
      <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border p-8">
        <h2 className="text-lg font-serif font-semibold text-primary dark:text-white mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-legal-slate" />
          Profile Information
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-legal-charcoal dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-legal-border dark:border-dark-border bg-white dark:bg-dark-bg text-legal-charcoal dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-legal-charcoal dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-legal-border dark:border-dark-border bg-white dark:bg-dark-bg text-legal-charcoal dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border p-8">
        <h2 className="text-lg font-serif font-semibold text-primary dark:text-white mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-legal-slate" />
          Change Password
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-5">
          {['current_password', 'new_password', 'confirm_password'].map((field, i) => (
            <input
              key={i}
              type="password"
              placeholder={
                field === 'current_password'
                  ? 'Current password'
                  : field === 'new_password'
                  ? 'New password'
                  : 'Confirm new password'
              }
              value={passwordData[field]}
              onChange={(e) =>
                setPasswordData({ ...passwordData, [field]: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-legal-border dark:border-dark-border bg-white dark:bg-dark-bg text-legal-charcoal dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              required
            />
          ))}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 border border-primary dark:border-accent-gold px-5 py-2.5 text-sm font-medium text-primary dark:text-accent-gold hover:bg-primary hover:text-white dark:hover:bg-accent-gold dark:hover:text-primary disabled:opacity-50 transition-colors"
          >
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  </div>
)
}