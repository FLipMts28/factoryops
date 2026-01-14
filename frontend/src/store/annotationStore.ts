import { create } from 'zustand';
import { Annotation } from '../types';
import { annotationsApi } from '../services/api';
import { indexedDBService } from '../services/indexedDB';

interface AnnotationStore {
  annotations: Annotation[];
  isLoading: boolean;
  error: string | null;
  
  fetchAnnotations: (machineId: string) => Promise<void>;
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, annotation: Annotation) => void;
  removeAnnotation: (id: string) => void;
  saveAnnotationOffline: (annotation: any) => Promise<void>;
}

export const useAnnotationStore = create<AnnotationStore>((set, get) => ({
  annotations: [],
  isLoading: false,
  error: null,

  fetchAnnotations: async (machineId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await annotationsApi.getByMachine(machineId);
      set({ annotations: response.data, isLoading: false });
    } catch (error) {
      // Try to load from IndexedDB
      const offlineAnnotations = await indexedDBService.getAnnotationsByMachine(machineId);
      set({ annotations: offlineAnnotations as Annotation[], isLoading: false });
    }
  },

  addAnnotation: (annotation) => {
    set((state) => ({
      annotations: [...state.annotations, annotation],
    }));
  },

  updateAnnotation: (id, annotation) => {
    set((state) => ({
      annotations: state.annotations.map((a) =>
        a.id === id ? annotation : a
      ),
    }));
  },

  removeAnnotation: (id) => {
    set((state) => ({
      annotations: state.annotations.filter((a) => a.id !== id),
    }));
  },

  saveAnnotationOffline: async (annotation) => {
    await indexedDBService.saveAnnotation(annotation);
    await indexedDBService.addPendingSync({
      id: `annotation-${Date.now()}`,
      type: 'annotation',
      action: 'create',
      data: annotation,
      timestamp: Date.now(),
    });
  },
}));
