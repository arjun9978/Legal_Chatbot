import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import MessageComposer from '../components/MessageComposer'
import SourcePanel from '../components/SourcePanel'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Sun, Moon, FileText, LogOut, Settings, ChevronDown } from 'lucide-react'

export default function Chat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [sources, setSources] = useState([])
  const [showSources, setShowSources] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentChatId, setCurrentChatId] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  const handleNewChat = () => {
    setMessages([])
    setSources([])
    setShowSources(false)
    setCurrentChatId(Date.now())
  }

  const handleSelectChat = async (chatId) => {
    setCurrentChatId(chatId)
    setLoading(true)
    
    try {
      const response = await fetch(`http://localhost:5000/api/chats/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        setSources(data.sources || [])
      }
    } catch (error) {
      console.error('Error loading chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (query) => {
    // Create new chat ID if this is the first message in a new chat
    let activeChatId = currentChatId
    if (!activeChatId) {
      activeChatId = Date.now()
      setCurrentChatId(activeChatId)
    }
    
    const userMessage = { role: 'user', content: query, id: Date.now() }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          query,
          chat_id: activeChatId 
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const aiMessage = {
        role: 'assistant',
        content: data.response,
        sources: data.sources || [],
        id: Date.now() + 1
      }

      setMessages(prev => [...prev, aiMessage])
      if (data.sources && data.sources.length > 0) {
        setSources(data.sources)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        id: Date.now() + 1
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create chat ID if this is first interaction
    let activeChatId = currentChatId
    if (!activeChatId) {
      activeChatId = Date.now()
      setCurrentChatId(activeChatId)
    }

    setUploadingFile(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('chat_id', activeChatId)

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        const uploadMessage = {
          role: 'system',
          content: `📎 Uploaded: ${data.filename} (${Math.round(data.text_length / 1000)}K characters)`,
          id: Date.now()
        }
        setMessages(prev => [...prev, uploadMessage])
      } else {
        alert(data.message || 'Failed to upload file')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading file')
    } finally {
      setUploadingFile(false)
      e.target.value = '' // Reset file input
    }
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        currentChatId={currentChatId}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center bg-white dark:bg-dark-surface">
          <h1 className="text-xl font-serif font-semibold text-primary dark:text-white">Legal Research Workspace</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {isDark ? <Sun className="w-5 h-5 text-gray-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
            <button
              onClick={() => setShowSources(!showSources)}
              className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm font-medium flex items-center space-x-2 text-gray-700 dark:text-gray-300"
            >
              <FileText className="w-4 h-4" />
              <span>{showSources ? 'Hide' : 'View'} Source Citations</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      navigate('/settings')
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      logout()
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Chat Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Chat Area - adjust width when sources are visible */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatWindow messages={messages} loading={loading} />
            <MessageComposer 
              onSend={handleSendMessage} 
              onFileUpload={handleFileUpload}
              disabled={loading} 
              uploadingFile={uploadingFile}
            />
          </div>

          {/* Source Panel - Fixed width sidebar */}
          {showSources && (
            <SourcePanel sources={sources} onClose={() => setShowSources(false)} />
          )}
        </div>
      </div>
    </div>
  )
}
