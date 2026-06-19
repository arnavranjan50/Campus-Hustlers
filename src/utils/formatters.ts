export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateRange(start: string, end: string): string {
  if (!start && !end) return 'Dates TBA'

  const startDate = new Date(start)
  const endDate = new Date(end)

  const startValid = !isNaN(startDate.getTime())
  const endValid = !isNaN(endDate.getTime())

  if (startValid && endValid) {
    const startFormatted = startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    const endFormatted = endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    return `${startFormatted} — ${endFormatted}`
  }
  if (startValid) {
    return startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  // If dates aren't parseable but contain text, show the raw text
  if (start && end) return `${start} — ${end}`
  if (start) return start
  if (end) return end
  return 'Dates TBA'
}

export function getCountdown(deadline: string): string {
  if (!deadline) return 'Open'

  const now = new Date()
  const target = new Date(deadline)

  if (isNaN(target.getTime())) return 'Open'

  const diff = target.getTime() - now.getTime()

  if (diff <= 0) return 'Registration Closed'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 30) {
    const months = Math.floor(days / 30)
    return `${months} month${months > 1 ? 's' : ''} left`
  }
  if (days > 0) return `${days}d ${hours}h left`
  return `${hours}h left`
}

export function getTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) return formatDate(dateString)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length).trimEnd() + '...'
}

export function generateStars(rating: number): string {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0)
  return '★'.repeat(fullStars) + (hasHalf ? '½' : '') + '☆'.repeat(emptyStars)
}
