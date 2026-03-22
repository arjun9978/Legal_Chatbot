import { useEffect, useRef } from 'react'

export default function ChatWindow({ messages, loading }) {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-3xl">
          <h2 className="text-3xl font-semibold mb-8 text-gray-800 dark:text-gray-200">Hey, I am your Legal Assistant. 
            How can I help you today?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            <button className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm text-left">
              <div className="text-gray-700 dark:text-gray-300">What are Fundamental Rights?</div>
            </button>
            <button className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm text-left">
              <div className="text-gray-700 dark:text-gray-300">Explain Article 21</div>
            </button>
            <button className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm text-left">
              <div className="text-gray-700 dark:text-gray-300">Punishment for theft?</div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900">
      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-3xl ${message.role === 'user' ? 'bg-primary text-white rounded-2xl px-5 py-3 shadow-md' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 shadow-sm'}`}>
            {message.role === 'assistant' && (
              <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="w-7 h-7 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">L</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">LegAI</span>
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
  )
}
