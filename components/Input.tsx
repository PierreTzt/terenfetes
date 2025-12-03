import React from 'react'
import { LucideIcon } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: LucideIcon
  error?: string
  helperText?: string
}

export default function Input({
  label,
  icon: Icon,
  error,
  helperText,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block small font-medium text-ink mb-2"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-400">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <input
          id={inputId}
          className={`w-full bg-white border-2 border-bg-2 text-ink placeholder:text-muted-400
            ${Icon ? 'pl-10 pr-4' : 'px-4'} py-3
            focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-alert focus:ring-alert focus:border-alert' : ''}
            ${className}`}
          style={{ borderRadius: 'var(--radius-input)' }}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1 small text-alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-1 small text-muted-400">
          {helperText}
        </p>
      )}
    </div>
  )
}

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block small font-medium text-ink mb-2"
        >
          {label}
        </label>
      )}

      <textarea
        id={inputId}
        className={`w-full bg-white border-2 border-bg-2 text-ink placeholder:text-muted-400
          px-4 py-3
          focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-alert focus:ring-alert focus:border-alert' : ''}
          ${className}`}
        style={{ borderRadius: 'var(--radius-input)' }}
        {...props}
      />

      {error && (
        <p className="mt-1 small text-alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-1 small text-muted-400">
          {helperText}
        </p>
      )}
    </div>
  )
}
