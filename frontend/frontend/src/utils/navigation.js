import { navItems } from '../constants/appData'

export function getHashPage() {
  if (typeof window === 'undefined') {
    return 'overview'
  }

  const candidate = window.location.hash.replace(/^#\/?/, '') || 'overview'
  return navItems.some((item) => item.id === candidate) ? candidate : 'overview'
}

export function navigateWithHash(page) {
  if (typeof window === 'undefined') {
    return
  }

  window.location.hash = `/${page}`
}
