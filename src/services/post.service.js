import pb from './pb'

export const postService = {
  async getAll(page = 1, perPage = 20) {
    return await pb.collection('posts').getList(page, perPage, {
      sort: '-created',
      filter: 'status = "active"',
    })
  },

  async getPending(page = 1, perPage = 20) {
    return await pb.collection('posts').getList(page, perPage, {
      sort: 'created',
      filter: 'status = "pending"',
    })
  },

  async create(imageFile, description, category, subCategory, postedBy) {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('description', description)
    if (category) formData.append('category', category)
    if (subCategory) formData.append('sub_category', subCategory)
    formData.append('posted_by', postedBy)
    // Send to admin for verification
    formData.append('status', 'pending')

    return await pb.collection('posts').create(formData)
  },

  async updateStatus(postId, status, claimedBy = null) {
    const data = { status }
    if (status === 'claimed') {
      data.claimed_by = claimedBy
      data.claimed_at = new Date().toISOString()
    }
    return await pb.collection('posts').update(postId, data)
  },

  async delete(postId) {
    return await pb.collection('posts').delete(postId)
  },

  async createLostReport(userId, category, subCategory, description, dateLost) {
    return await pb.collection('lost_reports').create({
      user_id: userId,
      category,
      sub_category: subCategory,
      description,
      date_lost: dateLost,
      status: 'open'
    })
  },

  async getLostReports(page = 1, perPage = 50) {
    return await pb.collection('lost_reports').getList(page, perPage, {
      sort: '-created',
      expand: 'user_id'
    })
  },

  getImageUrl(post, filename) {
    return pb.files.getUrl(post, filename, { thumb: '400x400' })
  }
}
