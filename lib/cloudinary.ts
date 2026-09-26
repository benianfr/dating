// Cloudinary service for image upload using Next.js API route
const API_URL = '/api/upload'

export const cloudinaryService = {
  // Upload a single image to Cloudinary via API route
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error)
      throw new Error('Failed to upload image to Cloudinary')
    }
  },

  // Upload multiple images
  async uploadMultipleImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file))
    return Promise.all(uploadPromises)
  },

  // Delete image (requires additional API route)
  async deleteImage(publicId: string): Promise<void> {
    // Note: This requires a separate API route for deletion
    // For now, we'll just log it - deletion can be handled via Cloudinary dashboard
    console.log('Image deletion requested:', publicId)
    // TODO: Implement server-side deletion API route
  },

  // Validate if API route is available
  isConfigured(): boolean {
    return true // API route is always available if the app is running
  }
}
