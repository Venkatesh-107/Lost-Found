// ─────────────────────────────────────────────────────────────────────────────
// src/utils/validators.js
// Input validators for post uploads and claim forms
// ─────────────────────────────────────────────────────────────────────────────

/** Allowed image MIME types for post uploads */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** Maximum image file size in bytes (5 MB) */
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

/** Maximum description character length */
const MAX_DESCRIPTION_LENGTH = 200

/**
 * Validates an image file for post upload.
 *
 * @param {File} file - The image file to validate
 * @returns {{ valid: boolean, error?: string }}
 *
 * @example
 * const { valid, error } = validateImage(file)
 * if (!valid) showError(error)
 */
export function validateImage(file) {
  if (!file) {
    return { valid: false, error: 'Please select an image.' }
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG, or WEBP images are allowed.' }
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: 'Image must be smaller than 5 MB.' }
  }
  return { valid: true }
}

/**
 * Validates the description text for a post.
 *
 * @param {string} description - The description to validate
 * @returns {{ valid: boolean, error?: string }}
 *
 * @example
 * const { valid, error } = validateDescription(desc)
 */
export function validateDescription(description) {
  const trimmed = (description || '').trim()
  if (!trimmed) {
    return { valid: false, error: 'Description is required.' }
  }
  if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
    return {
      valid: false,
      error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`,
    }
  }
  return { valid: true }
}

/**
 * Validates a full post form (image + description).
 *
 * @param {File}   file        - Image file
 * @param {string} description - Post description
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePostForm(file, description) {
  const errors = []
  const imgResult  = validateImage(file)
  const descResult = validateDescription(description)

  if (!imgResult.valid)  errors.push(imgResult.error)
  if (!descResult.valid) errors.push(descResult.error)

  return { valid: errors.length === 0, errors }
}
