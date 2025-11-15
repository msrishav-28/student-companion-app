import { db, auth, storage } from './config'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'

export class FirebaseClient {
  /**
   * Get a document by ID
   */
  async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    const docRef = doc(db, collectionName, docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T
    }
    return null
  }

  /**
   * Query documents with filters
   */
  async queryDocuments<T>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    const q = query(collection(db, collectionName), ...constraints)
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[]
  }

  /**
   * Get all documents in a collection
   */
  async getAllDocuments<T>(collectionName: string): Promise<T[]> {
    const querySnapshot = await getDocs(collection(db, collectionName))
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[]
  }

  /**
   * Create a new document
   */
  async createDocument<T>(
    collectionName: string,
    data: Partial<T>,
    docId?: string
  ): Promise<string> {
    const dataWithTimestamp = {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    }

    if (docId) {
      await setDoc(doc(db, collectionName, docId), dataWithTimestamp)
      return docId
    } else {
      const docRef = await addDoc(collection(db, collectionName), dataWithTimestamp)
      return docRef.id
    }
  }

  /**
   * Update a document
   */
  async updateDocument<T>(
    collectionName: string,
    docId: string,
    data: Partial<T>
  ): Promise<void> {
    const docRef = doc(db, collectionName, docId)
    await updateDoc(docRef, {
      ...data,
      updated_at: serverTimestamp()
    })
  }

  /**
   * Delete a document
   */
  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    await deleteDoc(doc(db, collectionName, docId))
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return auth.currentUser
  }

  /**
   * Get auth instance
   */
  getAuth() {
    return auth
  }

  /**
   * Get db instance
   */
  getDb() {
    return db
  }

  /**
   * Get storage instance
   */
  getStorage() {
    return storage
  }
}

// Export singleton instance
export const firebaseClient = new FirebaseClient()

// Export helper functions
export { 
  query, 
  where, 
  orderBy, 
  limit, 
  collection, 
  doc,
  serverTimestamp,
  Timestamp
}
