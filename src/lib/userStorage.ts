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
  Timestamp,
  addDoc,
  writeBatch,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';

export interface SimpleNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Simple Notes Firestore Functions
export const loadSimpleNotes = async (userId: string): Promise<SimpleNote[]> => {
  try {
    const notesRef = collection(db, 'users', userId, 'simpleNotes');
    const q = query(notesRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    } as SimpleNote));
  } catch (error) {
    console.error('Error loading simple notes:', error);
    return [];
  }
};

export const addSimpleNote = async (
  userId: string,
  note: Omit<SimpleNote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<SimpleNote | null> => {
  try {
    const notesRef = collection(db, 'users', userId, 'simpleNotes');
    const now = new Date().toISOString();
    
    const docRef = await addDoc(notesRef, {
      ...note,
      createdAt: now,
      updatedAt: now,
    });

    return {
      ...note,
      id: docRef.id,
      userId,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Error adding simple note:', error);
    return null;
  }
};

export const updateSimpleNote = async (
  userId: string,
  noteId: string,
  updates: Partial<SimpleNote>
): Promise<SimpleNote | null> => {
  try {
    const noteRef = doc(db, 'users', userId, 'simpleNotes', noteId);
    const now = new Date().toISOString();
    
    await updateDoc(noteRef, {
      ...updates,
      updatedAt: now,
    });

    const snapshot = await getDoc(noteRef);
    return {
      ...snapshot.data(),
      id: noteId,
    } as SimpleNote;
  } catch (error) {
    console.error('Error updating simple note:', error);
    return null;
  }
};

export const deleteSimpleNote = async (userId: string, noteId: string): Promise<void> => {
  try {
    const noteRef = doc(db, 'users', userId, 'simpleNotes', noteId);
    await deleteDoc(noteRef);
  } catch (error) {
    console.error('Error deleting simple note:', error);
  }
};

// Study Notes Migration to Firestore
export const migrateStudyNotes = async (userId: string, notes: any[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const notesRef = collection(db, 'users', userId, 'studyNotes');

    notes.forEach((note) => {
      const docRef = doc(notesRef);
      batch.set(docRef, {
        ...note,
        userId,
        createdAt: note.createdAt || new Date().toISOString(),
        updatedAt: note.updatedAt || new Date().toISOString(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error migrating study notes:', error);
  }
};

export const loadStudyNotesFromFirestore = async (userId: string): Promise<any[]> => {
  try {
    const notesRef = collection(db, 'users', userId, 'studyNotes');
    const q = query(notesRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));
  } catch (error) {
    console.error('Error loading study notes from Firestore:', error);
    return [];
  }
};

export const addStudyNoteToFirestore = async (userId: string, note: any): Promise<any | null> => {
  try {
    const notesRef = collection(db, 'users', userId, 'studyNotes');
    const now = new Date().toISOString();
    
    const docRef = await addDoc(notesRef, {
      ...note,
      userId,
      createdAt: now,
      updatedAt: now,
    });

    return {
      ...note,
      id: docRef.id,
      userId,
    };
  } catch (error) {
    console.error('Error adding study note to Firestore:', error);
    return null;
  }
};

export const updateStudyNoteInFirestore = async (
  userId: string,
  noteId: string,
  updates: any
): Promise<any | null> => {
  try {
    const noteRef = doc(db, 'users', userId, 'studyNotes', noteId);
    const now = new Date().toISOString();
    
    await updateDoc(noteRef, {
      ...updates,
      updatedAt: now,
    });

    const snapshot = await getDoc(noteRef);
    return {
      ...snapshot.data(),
      id: noteId,
    };
  } catch (error) {
    console.error('Error updating study note in Firestore:', error);
    return null;
  }
};

export const deleteStudyNoteFromFirestore = async (userId: string, noteId: string): Promise<void> => {
  try {
    const noteRef = doc(db, 'users', userId, 'studyNotes', noteId);
    await deleteDoc(noteRef);
  } catch (error) {
    console.error('Error deleting study note from Firestore:', error);
  }
};
