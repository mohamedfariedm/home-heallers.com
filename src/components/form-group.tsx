import type React from "react"

interface FormGroupProps {
  title: string
  children: React.ReactNode
  className?: string
}

export default function FormGroup({ title, children, className = "" }: FormGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">{title}</label>
      {children}
    </div>
  )
}
