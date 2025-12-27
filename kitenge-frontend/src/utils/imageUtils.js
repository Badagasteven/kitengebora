/**
 * Centralized image URL helper
 * Handles both relative and absolute image paths
 */

const getImageBaseUrl = () => {
  // Get API base URL from environment or default
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8082/api'
  
  // Remove /api suffix if present to get base server URL
  const baseUrl = apiUrl.replace('/api', '')
  
  return baseUrl
}

/**
 * Get full image URL from image path
 * @param {string} imagePath - The image path (can be relative, absolute, or full URL)
 * @returns {string} - Full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/placeholder.png'
  }

  // If already a full URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // If starts with /, it's an absolute path from server root
  if (imagePath.startsWith('/')) {
    return `${getImageBaseUrl()}${imagePath}`
  }

  // Otherwise, it's a relative path
  return `${getImageBaseUrl()}/${imagePath}`
}

/**
 * Get placeholder image URL
 * @returns {string} - Placeholder image URL
 */
export const getPlaceholderImage = () => {
  return '/placeholder.png'
}

