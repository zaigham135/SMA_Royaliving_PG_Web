// Browser-side ImageKit helpers. Do not import server SDK here.

// Check if ImageKit is properly configured via Vite env
const isImageKitConfigured = () => {
  const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY
  const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT
  return !!publicKey && !publicKey.includes('public_key') && !!urlEndpoint && !urlEndpoint.includes('your_endpoint')
}

// Upload file to ImageKit via server-provided auth + ImageKit upload API
export const uploadToImageKit = async (file, folder = 'pg-students') => {
  try {
    if (!isImageKitConfigured()) {
      // Fallback: local blob URL for preview
      const blobUrl = URL.createObjectURL(file)
      return { url: blobUrl, fileId: `local_${Date.now()}`, name: file.name, isLocal: true }
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

    // Get auth params from server
    const authResp = await fetch(`${API_URL}/api/imagekit/auth`)
    if (!authResp.ok) throw new Error('Failed to get ImageKit auth parameters from server')
    const auth = await authResp.json()

    // Prepare form data for ImageKit upload
    const form = new FormData()
    form.append('file', file)
    form.append('fileName', `${Date.now()}_${file.name}`)
    if (folder) form.append('folder', folder)
  // ImageKit direct upload requires publicKey + signature/token/expire for authenticated uploads
  if (auth.publicKey) form.append('publicKey', auth.publicKey)
  if (auth.token) form.append('token', auth.token)
  if (auth.signature) form.append('signature', auth.signature)
  if (auth.expire) form.append('expire', auth.expire)

    // Use explicit upload endpoint if provided, otherwise default to ImageKit upload API
  // Use either configured upload endpoint or fallback to standard ImageKit upload URL
  const uploadUrl = import.meta.env.VITE_IMAGEKIT_UPLOAD_ENDPOINT || auth.urlEndpoint?.replace(/https?:\/\//, 'https://upload.') || 'https://upload.imagekit.io/api/v1/files/upload'
    const uploadResp = await fetch(uploadUrl, { method: 'POST', body: form })
    if (!uploadResp.ok) {
      const text = await uploadResp.text()
      throw new Error('ImageKit upload failed: ' + text)
    }

    const result = await uploadResp.json()

    // Normalize returned URL: ImageKit may return `filePath` (relative) or full `url`.
    let finalUrl = result.url || result.filePath || result.fileUrl || ''
    if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
      // Prepend the configured urlEndpoint (from auth or env) when filePath is relative
      const base = auth.urlEndpoint || import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || ''
      if (base) {
        finalUrl = base.replace(/\/$/, '') + (finalUrl.startsWith('/') ? finalUrl : '/' + finalUrl)
      }
    }

    return { url: finalUrl, fileId: result.fileId || result.file_id || result.fileId, name: result.name || file.name, isLocal: false }
  } catch (error) {
    console.error('ImageKit upload error:', error)
    const blobUrl = URL.createObjectURL(file)
    return { url: blobUrl, fileId: `local_${Date.now()}`, name: file.name, isLocal: true }
  }
}

// Delete file from ImageKit by calling server delete endpoint or ImageKit API
export const deleteFromImageKit = async (fileId) => {
  try {
    if (!isImageKitConfigured() || !fileId || fileId.startsWith('local_')) return true
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    // Call server-side deletion via API if available
    const resp = await fetch(`${API_URL}/api/imagekit/delete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileId }) })
    if (resp.ok) return true
    // Fallback: try direct delete (unlikely to work without private key)
    return false
  } catch (error) {
    console.error('ImageKit delete error:', error)
    return false
  }
}

// Get ImageKit authentication parameters from server
export const getImageKitAuth = async () => {
  try {
    if (!isImageKitConfigured()) return { token: 'fallback', expire: Date.now() + 3600000 }
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const response = await fetch(`${API_URL}/api/imagekit/auth`)
    if (!response.ok) throw new Error('Auth fetch failed')
    return await response.json()
  } catch (error) {
    console.error('ImageKit auth error:', error)
    return { token: 'fallback', expire: Date.now() + 3600000 }
  }
}

// Format image URL with transformations
export const getOptimizedImageUrl = (url, width = 400, height = 400, quality = 80) => {
  if (!url) return ''
  if (url.startsWith('blob:')) return url
  try {
    // If URL already includes ImageKit transformation segment, return as-is
    if (url.includes('/tr:')) return url

    const transformations = `w-${width},h-${height},q-${quality}`

    // If it's an ImageKit URL, inject the `tr:` segment after the imagekit id
    const parsed = new URL(url)
    if (parsed.hostname.includes('imagekit.io')) {
      // pathname = /<imagekit_id>/path/to/file.jpg
      const parts = parsed.pathname.split('/').filter(Boolean)
      if (parts.length >= 2) {
        const id = parts.shift()
        const rest = parts.join('/')
        parsed.pathname = `/${id}/tr:${transformations}/${rest}`
        return parsed.toString()
      }
    }
    // Fallback: append query param (some CDNs may accept it)
    return `${url}?tr:${transformations}`
  } catch (err) {
    return url
  }
}

// Validate file type and size
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (!allowedTypes.includes(file.type)) throw new Error('Please upload a valid image file (JPEG, PNG, or WebP)')
  if (file.size > maxSize) throw new Error('Image size should be less than 5MB')
  return true
}

export const isImageKitAvailable = () => isImageKitConfigured()