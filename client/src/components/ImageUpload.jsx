import React, { useState, useRef } from 'react'
import { uploadToImageKit, validateImageFile, getOptimizedImageUrl, isImageKitAvailable } from '../utils/imagekit'

const ImageUpload = ({ 
  onImageUpload, 
  currentImageUrl, 
  folder = 'pg-students',
  maxSize = 5,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImageUrl || '')
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      setError('')
      setUploading(true)

      // Validate file
      validateImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)

      // Upload to ImageKit (or fallback to local)
      const result = await uploadToImageKit(file, folder)
      
      // Call parent callback with image data
      onImageUpload({
        url: result.url,
        fileId: result.fileId,
        name: result.name,
        optimizedUrl: getOptimizedImageUrl(result.url, 400, 400, 80),
        isLocal: result.isLocal || false
      })

    } catch (err) {
      setError(err.message)
      setPreview('')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onImageUpload(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add('drag-over')
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      fileInputRef.current.files = files
      handleFileSelect({ target: { files } })
    }
  }

  const isImageKitReady = isImageKitAvailable()

  return (
    <div className="image-upload-container">
      {!isImageKitReady && (
        <div className="imagekit-notice">
          <p>⚠️ ImageKit not configured. Images will be stored locally for preview only.</p>
          <p>For full functionality, please configure ImageKit credentials.</p>
        </div>
      )}
      
      <div 
        className={`image-upload-area ${uploading ? 'uploading' : ''} ${preview ? 'has-image' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="image-preview">
            <img src={preview} alt="Preview" />
            <div className="image-overlay">
              <button 
                type="button" 
                className="remove-image" 
                onClick={handleRemoveImage}
                disabled={uploading}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">📷</div>
            <p>Click to upload or drag & drop</p>
            <p className="upload-hint">
              {allowedTypes.join(', ').toUpperCase()} • Max {maxSize}MB
            </p>
            {!isImageKitReady && (
              <p className="upload-hint">⚠️ Local preview only</p>
            )}
          </div>
        )}

        {uploading && (
          <div className="upload-progress">
            <div className="spinner"></div>
            <p>Uploading...</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          className="file-input"
          disabled={uploading}
        />
      </div>

      {error && (
        <div className="upload-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      <div className="upload-info">
        <p>Supported formats: {allowedTypes.join(', ').toUpperCase()}</p>
        <p>Maximum size: {maxSize}MB</p>
        {!isImageKitReady && (
          <p>⚠️ Configure ImageKit for cloud storage</p>
        )}
      </div>
    </div>
  )
}

export default ImageUpload 