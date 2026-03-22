import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Chat from './pages/Chat'
import Settings from './pages/Settings'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
