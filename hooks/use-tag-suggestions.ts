import { useState, useEffect } from "react"

export function useTagSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/buyers/tags")
        
        if (!response.ok) {
          throw new Error("Failed to fetch tags")
        }
        
        const data = await response.json()
        setSuggestions(data.tags || [])
        setError(null)
      } catch (err) {
        console.error("Error fetching tag suggestions:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch tags")
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTags()
  }, [])

  return { suggestions, isLoading, error }
}
