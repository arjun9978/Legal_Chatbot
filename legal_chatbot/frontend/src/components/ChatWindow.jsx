import { useEffect, useRef } from 'react'
import ShapeGrid from './ShapeGrid'

export default function ChatWindow({ messages, loading, onSuggestionClick }) {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* ShapeGrid Background */}
        <div className="absolute inset-0 z-0">
          <ShapeGrid 
            speed={0.5}
            squareSize={40}
            direction="diagonal"
            borderColor="#212121"
            hoverFillColor="#222222"
            shape="square"
            hoverTrailAmount={0}
          />
        </div>
        
        <div className="text-center max-w-3xl relative z-10">
          <h2 className="text-3xl font-semibold mb-8 text-gray-800 dark:text-gray-200">Hey, I am your Legal Assistant. 
            How may I help you?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            <button 
              onClick={() => onSuggestionClick?.('What are Fundamental Rights?')}
              className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm text-left"
            >
              <div className="text-gray-700 dark:text-gray-300">What are Fundamental Rights?</div>
            </button>
            <button 
              onClick={() => onSuggestionClick?.('Explain Article 21')}
              className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm text-left"
            >
              <div className="text-gray-700 dark:text-gray-300">Explain Article 21</div>
            </button>
            <button 
              onClick={() => onSuggestionClick?.('Punishment for theft?')}
              className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm text-left"
            >
              <div className="text-gray-700 dark:text-gray-300">Punishment for theft?</div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* ShapeGrid Background - Fixed within this container, doesn't scroll */}
      <div className="absolute inset-0 z-0">
        <ShapeGrid 
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#212121"
          hoverFillColor="#222222"
          shape="square"
          hoverTrailAmount={0}
        />
      </div>
      
      {/* Scrollable Messages Container */}
      <div className="absolute inset-0 z-10 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 shadow-sm">
              {message.role === 'assistant' && (
                <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">L</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">LegAI</span>
                </div>
              )}
              {message.role === 'user' && (
                <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-7 h-7 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">U</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">You</span>
                </div>
              )}
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-gray-800 dark:text-gray-200">{message.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Analyzing your legal query...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
