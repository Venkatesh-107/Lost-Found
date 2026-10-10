// ─────────────────────────────────────────────────────────────────────────────
// src/services/post.service.js
// Post service — CRUD operations for the `posts` PocketBase collection
// ─────────────────────────────────────────────────────────────────────────────

import pb from './pb'

/** Name of the PocketBase collection */
const COLLECTION = 'posts'

/**
 * @typedef {Object} Post
 * @property {string}   id          - PocketBase record ID
 * @property {string}   image       - Image filename (resolved via getImageUrl)
 * @property {string}   description - Short item description
 * @property {'active'|'claimed'} status - Post status
 * @property {string}   posted_by   - User ID of the submitter
 * @property {string|null} claimed_by  - User ID of the claimant (if any)
 * @property {string|null} claimed_at  - ISO timestamp when claimed
 * @property {string}   created     - ISO timestamp of creation
 */

export const postService = {
  /**
   * Fetches a paginated list of posts ordered by newest first.
   *
   * @param {number} [page=1]       - Page number (1-indexed)
   * @param {number} [perPage=10]   - Records per page
   * @returns {Promise<{ items: Post[], totalItems: number, totalPages: number }>}
   */
  async getAll(page = 1, perPage = 10) {
    const result = await pb.collection(COLLECTION).getList(page, perPage, {
      sort: '-created',
    })
    return result
  },

  /**
   * Creates a new post with an image upload and description.
   *
   * @param {File}   imageFile   - The image file to upload
   * @param {string} description - Short description of the item
   * @param {string} postedBy    - User ID of the submitter
   * @returns {Promise<Post>}
   */
  async create(imageFile, description, postedBy) {
    const formData = new FormData()
    formData.append('image',       imageFile)
    formData.append('description', description)
    formData.append('posted_by',   postedBy)
    formData.append('status',      'active')

    return pb.collection(COLLECTION).create(formData)
  },

  /**
   * Updates a post's status (e.g., marking it as claimed).
   *
   * @param {string} postId                       - Post record ID
   * @param {'active'|'claimed'} status           - New status value
   * @param {string} [claimedBy]                  - User ID of claimant
   * @returns {Promise<Post>}
   */
  async updateStatus(postId, status, claimedBy) {
    const data = { status }
    if (status === 'claimed') {
      data.claimed_by = claimedBy
      data.claimed_at = new Date().toISOString()
    }
    return pb.collection(COLLECTION).update(postId, data)
  },

  /**
   * Deletes a post record (used by CLEANUP_AGENT or admin).
   *
   * @param {string} postId - Post record ID
   * @returns {Promise<boolean>}
   */
  async delete(postId) {
    return pb.collection(COLLECTION).delete(postId)
  },

  /**
   * Resolves the full URL for a post's image file.
   *
   * @param {Post}   post     - The post record
   * @param {string} filename - The image filename from the record
   * @returns {string} Full image URL
   */
  getImageUrl(post, filename) {
    return pb.files.getUrl(post, filename, { thumb: '600x0' })
  },
}
