import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HiPlus, HiChatAlt2, HiTrash } from 'react-icons/hi'
import Logo from './Logo'

export default function Sidebar({ onNewChat, onSelectChat, currentChatId }) {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch chat history from backend
  useEffect(() => {
    fetchChats()
  }, [])

  const fetchChats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setChats(data.chats || [])
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation()
    
    try {
      const response = await fetch(`http://localhost:5000/api/chats/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        // Remove from local state
        setChats(chats.filter(chat => chat.id !== chatId))
        
        // If deleted chat is the current one, trigger new chat
        if (currentChatId === chatId) {
          onNewChat()
        }
      } else {
        console.error('Failed to delete chat')
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  const handleNewChatClick = () => {
    onNewChat()
    // Refresh chat list after a short delay to allow new chat to be saved
    setTimeout(() => fetchChats(), 500)
  }

  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900">
      {/* Logo */}
      <div className="p-4">
        <Link to="/">
          <Logo size="default" className="text-primary dark:text-white" />
        </Link>
      </div>

      {/* New Chat Button */}
      <div className="px-3 mb-2">
        <button 
          onClick={handleNewChatClick}
          className="w-full flex items-center space-x-2 px-3 py-2.5 border border-primary dark:border-accent-gold hover:bg-primary hover:text-white dark:hover:bg-accent-gold dark:hover:text-primary transition text-sm font-medium text-primary dark:text-accent-gold"
        >
          <HiPlus className="w-5 h-5" />
          <span>New Research Session</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-3">
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
            Loading research history...
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
            No research history
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition group flex items-start justify-between ${
                  currentChatId === chat.id 
                    ? 'bg-gray-100 dark:bg-gray-800' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <HiChatAlt2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="text-sm truncate">{chat.title}</div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                    {formatTime(chat.time)}
                  </div>
                </div>
                <button 
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                >
                  <HiTrash className="w-4 h-4 text-gray-400" />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
