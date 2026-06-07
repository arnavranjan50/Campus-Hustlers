import { useState, useCallback, useMemo } from 'react'

export function useSearch<T>(
  items: T[],
  searchFields: (keyof T)[],
  delay: number = 200
) {
  const [query, setQuery] = useState('')
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback(
    (value: string) => {
      if (debounceTimer) clearTimeout(debounceTimer)
      const timer = setTimeout(() => {
        setQuery(value)
      }, delay)
      setDebounceTimer(timer)
    },
    [debounceTimer, delay]
  )

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items
    const lowerQuery = query.toLowerCase()
    return items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field]
        if (typeof value === 'string') return value.toLowerCase().includes(lowerQuery)
        if (Array.isArray(value)) return value.some((v) => String(v).toLowerCase().includes(lowerQuery))
        return false
      })
    )
  }, [items, query, searchFields])

  return { query, setQuery: handleSearch, filteredItems, rawQuery: query }
}
