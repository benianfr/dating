import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage'
import { storage } from './firebase'

const STORAGE_PATH = 'profile-photos'

export const storageService = {
  // Upload a profile photo
  async uploadPhoto(userId: string, file: File): Promise<string> {
    try {
      // Create a unique filename
      const timestamp = Date.now()
      const filename = `${userId}_${timestamp}_${file.name}`
      const storageRef = ref(storage, `${STORAGE_PATH}/${filename}`)
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file)
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      return downloadURL
    } catch (error) {
      console.error('Error uploading photo:', error)
      throw new Error('Failed to upload photo')
    }
  },

  // Delete a photo
  async deletePhoto(photoUrl: string): Promise<void> {
    try {
      // Extract the path from the URL
      const storageRef = ref(storage, photoUrl)
      await deleteObject(storageRef)
    } catch (error) {
      console.error('Error deleting photo:', error)
      throw new Error('Failed to delete photo')
    }
  },

  // Upload multiple photos
  async uploadMultiplePhotos(userId: string, files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadPhoto(userId, file))
    return Promise.all(uploadPromises)
  }
}
