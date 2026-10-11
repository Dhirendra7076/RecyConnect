import client from './client'

/**
 * Upload a single image. Returns { url }.
 * Uses FormData so the browser sets the multipart boundary automatically.
 */
export async function uploadImage(file) {
  const fd = new FormData()
  fd.append('file', file)
  // Note: don't set Content-Type — axios lets the browser set it for FormData,
  // including the required multipart boundary.
  return client.post('/uploads', fd, {
    headers: { 'Content-Type': undefined },
  })
}