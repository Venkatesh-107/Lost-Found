// ─────────────────────────────────────────────────────────────────────────────
// src/hooks/useFeed.js
// Feed hook — paginated post fetching with refresh and load-more support
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { postService } from '@/services/post.service'

const PER_PAGE = 10

/**
 * Manages the paginated post feed for the Home page.
 *
 * @returns {{
 *   posts:     import('@/services/post.service').Post[],
 *   isLoading: boolean,
 *   error:     string|null,
 *   loadMore:  Function,
 *   refresh:   Function,
 * }}
 *
 * @example
 * const { posts, isLoading, loadMore, refresh } = useFeed()
 */
export function useFeed() {
  const [posts,     setPosts]     = useState([])
  const [page,      setPage]      = useState(1)
  const [total,     setTotal]     = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState(null)

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchPage = useCallback(async (pageNum, replace = false) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await postService.getAll(pageNum, PER_PAGE)
      setPosts((prev) => replace ? result.items : [...prev, ...result.items])
      setTotal(result.totalItems)
      setPage(pageNum)
    } catch (err) {
      setError(err.message || 'Failed to load posts.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => { fetchPage(1, true) }, [fetchPage])

  // ── Public API ───────────────────────────────────────────────────────────

  /** Load the next page of posts (appended to existing list) */
  function loadMore() {
    if (!isLoading && posts.length < total) {
      fetchPage(page + 1, false)
    }
  }

  /** Reset to page 1 and reload (after upload or claim) */
  function refresh() { fetchPage(1, true) }

  return { posts, isLoading, error, loadMore, refresh }
}
