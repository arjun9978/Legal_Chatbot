import { useState } from 'react'

export default function SourcePanel({ sources, onClose }) {
  const [expandedSource, setExpandedSource] = useState(null)

  return (
    <div className="w-96 border-l border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-light-border dark:border-dark-border flex justify-between items-center">
        <h2 className="text-lg font-semibold">Source Citations</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {sources.length === 0 ? (
          <div className="text-center text-light-muted dark:text-dark-muted py-12">
            <span className="text-4xl mb-4 block">📄</span>
            <p>No source citations</p>
            <p className="text-sm mt-2">Citations will appear here after legal queries</p>
          </div>
        ) : (
          <>
            <div className="text-sm text-light-muted dark:text-dark-muted mb-4">
              {sources.length} source{sources.length > 1 ? 's' : ''} cited
            </div>
            {sources.map((source, index) => (
              <div key={index} className="card border-l-4 border-primary">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm font-semibold mb-1 text-primary">
                      Source {source.id || index + 1}
                    </div>
                    <div className="text-xs font-medium text-light-text dark:text-dark-text mb-1">
                      {source.source_file || 'Legal Database'}
                    </div>
                    {source.article_section && source.article_section !== 'N/A' && (
                      <div className="text-xs text-light-muted dark:text-dark-muted">
                        {source.article_section}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-light-muted dark:text-dark-muted leading-relaxed mt-3">
                  {expandedSource === index 
                    ? (source.full_content || source.content)
                    : (source.content?.substring(0, 200) || 'No content available')}
                  {source.content?.length > 200 && (
                    <button 
                      onClick={() => setExpandedSource(expandedSource === index ? null : index)}
                      className="text-primary text-xs font-medium hover:underline ml-2 mt-2 block"
                    >
                      {expandedSource === index ? 'Show less ↑' : 'Show more ↓'}
                    </button>
                  )}
                </div>
                
                {source.chunk_id && source.chunk_id !== 'N/A' && (
                  <div className="text-xs text-light-muted dark:text-dark-muted mt-3 pt-3 border-t border-light-border dark:border-dark-border">
                    Reference: {source.chunk_id}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
