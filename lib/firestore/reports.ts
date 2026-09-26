import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy
} from 'firebase/firestore'
import { db } from '../firebase'
import { Report } from '@/types'

const REPORTS_COLLECTION = 'reports'

export const reportService = {
  // Create a report
  async createReport(reportData: Omit<Report, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const reportRef = doc(collection(db, REPORTS_COLLECTION))
    const data: Omit<Report, 'id'> = {
      ...reportData,
      createdAt: new Date(),
      status: 'pending'
    }
    await setDoc(reportRef, data)
    return reportRef.id
  },

  // Get report by ID
  async getReportById(reportId: string): Promise<Report | null> {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId)
    const reportSnap = await getDoc(reportRef)
    
    if (reportSnap.exists()) {
      return { id: reportSnap.id, ...reportSnap.data() } as Report
    }
    return null
  },

  // Get all reports made by a user
  async getUserReports(userId: string): Promise<Report[]> {
    const q = query(
      collection(db, REPORTS_COLLECTION),
      where('reporterId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Report)
  },

  // Get all reports against a user
  async getReportsAgainstUser(userId: string): Promise<Report[]> {
    const q = query(
      collection(db, REPORTS_COLLECTION),
      where('reportedUserId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Report)
  },

  // Get all pending reports (for admin)
  async getPendingReports(): Promise<Report[]> {
    const q = query(
      collection(db, REPORTS_COLLECTION),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Report)
  },

  // Update report status
  async updateReportStatus(reportId: string, status: 'pending' | 'reviewed' | 'resolved'): Promise<void> {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId)
    await updateDoc(reportRef, { status })
  }
}