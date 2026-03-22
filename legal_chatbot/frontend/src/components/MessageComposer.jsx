import { useState, useRef } from 'react'
import { HiPaperAirplane, HiPaperClip } from 'react-icons/hi'

export default function MessageComposer({ onSend, onFileUpload, disabled, uploadingFile }) {
  const [message, setMessage] = useState('')
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    if (onFileUpload) {
      onFileUpload(e)
    }
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-dark-surface">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative flex items-end space-x-2">
          <button
            type="button"
            onClick={handleFileClick}
            disabled={disabled || uploadingFile}
            className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            title={uploadingFile ? "Uploading..." : "Attach PDF, DOCX, or TXT files"}
          >
            <HiPaperClip className={`w-5 h-5 ${uploadingFile ? 'animate-spin' : ''}`} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.docx,.txt"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your legal research query..."
            rows="1"
            disabled={disabled}
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary border-0 placeholder-gray-500 dark:placeholder-gray-400"
            style={{ minHeight: '48px', maxHeight: '200px' }}
          />
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="p-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
          >
            <HiPaperAirplane className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Press Enter to submit query • Shift+Enter for new line
        </div>
      </form>
    </div>
  )
}
