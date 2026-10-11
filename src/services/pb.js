import PocketBase from 'pocketbase'

// The backend URL is retrieved from the Vite environment variable, or defaults to local
const pb = new PocketBase(import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090')

// Keep the internal auth store state from resetting on every hot reload or duplicate request
pb.autoCancellation(false)

export default pb
