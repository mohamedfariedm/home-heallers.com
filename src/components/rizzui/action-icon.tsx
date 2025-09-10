"use client"

import type React from "react"

interface ActionIconProps {
  children: React.ReactNode
  onClick?: () => void
  size?: "sm" | "md" | "lg"
  variant?: "text" | "outline" | "filled"
  className?: string
}

export function ActionIcon({ children, onClick, size = "md", variant = "text", className = "" }: ActionIconProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }

  const variantClasses = {
    text: "hover:bg-gray-100",
    outline: "border border-gray-300 hover:bg-gray-50",
    filled: "bg-gray-100 hover:bg-gray-200",
  }

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center justify-center rounded-md transition-colors
        ${sizeClasses[size]} 
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
