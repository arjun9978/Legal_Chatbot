import React from 'react'

// LegAI Logo Component - Open Law Book Symbol
// Minimal, flat design representing legal knowledge and research
const Logo = ({ size = "default", className = "" }) => {
  const sizes = {
    small: { width: 24, height: 24, textSize: "text-base" },
    default: { width: 32, height: 32, textSize: "text-xl" },
    large: { width: 40, height: 40, textSize: "text-2xl" }
  }

  const { width, height, textSize } = sizes[size] || sizes.default

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Open Book Icon - Minimal & Academic */}
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Book pages */}
        <path 
          d="M4 6C4 4.89543 4.89543 4 6 4H14V28H6C4.89543 28 4 27.1046 4 26V6Z" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          fill="none"
        />
        <path 
          d="M18 4H26C27.1046 4 28 4.89543 28 6V26C28 27.1046 27.1046 28 26 28H18V4Z" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          fill="none"
        />
        
        {/* Center binding line */}
        <line 
          x1="16" 
          y1="4" 
          x2="16" 
          y2="28" 
          stroke="currentColor" 
          strokeWidth="1.5"
        />
        
        {/* Text lines on left page */}
        <line x1="7" y1="9" x2="13" y2="9" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="7" y1="12" x2="13" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="7" y1="15" x2="11" y2="15" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        
        {/* Text lines on right page */}
        <line x1="19" y1="9" x2="25" y2="9" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="19" y1="12" x2="25" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="19" y1="15" x2="23" y2="15" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      </svg>

      {/* Brand Name */}
      <span className={`font-serif font-semibold tracking-tight ${textSize}`}>
        LegAI
      </span>
    </div>
  )
}

export default Logo
