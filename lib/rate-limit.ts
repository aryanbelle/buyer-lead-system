// Simple in-memory rate limiting for demo purposes
// In production, you'd use Redis or similar

interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

export function rateLimit(
  identifier: string, 
  limit: number = 10, 
  windowMs: number = 60000 // 1 minute
): { success: boolean; limit: number; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = store.get(identifier)
  
  // Clean up expired entries
  if (entry && now > entry.resetTime) {
    store.delete(identifier)
  }
  
  const current = store.get(identifier)
  
  if (!current) {
    // First request
    store.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetTime: now + windowMs
    }
  }
  
  if (current.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime: current.resetTime
    }
  }
  
  // Increment count
  current.count++
  store.set(identifier, current)
  
  return {
    success: true,
    limit,
    remaining: limit - current.count,
    resetTime: current.resetTime
  }
}

export function getRateLimitHeaders(result: ReturnType<typeof rateLimit>) {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
  }
}
