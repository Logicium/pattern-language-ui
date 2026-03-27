/**
 * Shared formatting utility functions
 */

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

export const getInitials = (name: string) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const getResourceLink = (resource: any) => {
  if (resource.type === 'pattern') return `/patterns/${resource.id}`
  if (resource.type === 'challenge') return `/challenges/${resource.id}`
  if (resource.type === 'story') return `/stories/${resource.id}`
  return '#'
}
