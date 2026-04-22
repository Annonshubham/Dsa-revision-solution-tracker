export interface StudyNote {
  id: string;
  title: string;
  content: string;
  category: 'Arrays' | 'Strings' | 'Trees' | 'Graphs' | 'DP' | 'Greedy' | 'Design' | 'Other';
  tags: string[];
  priority: 'Low' | 'Medium' | 'High';
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

const STUDY_NOTES_KEY = 'dsa_study_notes';

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Load all study notes
export const loadStudyNotes = (): StudyNote[] => {
  try {
    const data = localStorage.getItem(STUDY_NOTES_KEY);
    const notes = data ? JSON.parse(data) : [];
    // Migrate old notes to include new fields
    return notes.map((note: any) => ({
      ...note,
      tags: note.tags || [],
      priority: note.priority || 'Medium',
      isPinned: note.isPinned || false,
    }));
  } catch (error) {
    console.error('Error loading study notes:', error);
    return [];
  }
};

// Save study notes
export const saveStudyNotes = (notes: StudyNote[]): void => {
  try {
    localStorage.setItem(STUDY_NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving study notes:', error);
  }
};

// Add a new study note
export const addStudyNote = (note: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>): StudyNote => {
  const notes = loadStudyNotes();
  const newNote: StudyNote = {
    ...note,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  notes.push(newNote);
  saveStudyNotes(notes);
  return newNote;
};

// Update a study note
export const updateStudyNote = (id: string, updates: Partial<StudyNote>): StudyNote | null => {
  const notes = loadStudyNotes();
  const index = notes.findIndex(n => n.id === id);
  if (index === -1) return null;

  notes[index] = {
    ...notes[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveStudyNotes(notes);
  return notes[index];
};

// Delete a study note
export const deleteStudyNote = (id: string): void => {
  const notes = loadStudyNotes();
  const filtered = notes.filter(n => n.id !== id);
  saveStudyNotes(filtered);
};

// Toggle pin status
export const togglePinNote = (id: string): StudyNote | null => {
  const notes = loadStudyNotes();
  const index = notes.findIndex(n => n.id === id);
  if (index === -1) return null;

  notes[index].isPinned = !notes[index].isPinned;
  notes[index].updatedAt = new Date().toISOString();
  saveStudyNotes(notes);
  return notes[index];
};
