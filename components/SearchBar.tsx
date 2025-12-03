'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  defaultValue?: string
  className?: string
}

export default function SearchBar({ defaultValue = '', className = '' }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-400 pointer-events-none">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Chercher un concert, un marché, un atelier…"
          className="w-full bg-white border-2 border-bg-2 text-ink placeholder:text-muted-400
            pl-12 pr-4 py-4 text-base
            focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand
            transition-all duration-200"
          style={{ borderRadius: 'var(--radius-input)' }}
        />
      </div>
    </form>
  )
}
