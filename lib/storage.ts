import { FormData, SavedProject } from '@/types';

const STORAGE_KEY = 'tourism-proposal-projects';

export function saveProject(name: string, formData: FormData): SavedProject {
  const projects = getSavedProjects();
  const newProject: SavedProject = {
    id: Date.now().toString(),
    name,
    formData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  projects.push(newProject);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return newProject;
}

export function getSavedProjects(): SavedProject[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const projects = JSON.parse(stored);
    return projects.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));
  } catch {
    return [];
  }
}

export function deleteProject(id: string): void {
  const projects = getSavedProjects();
  const filtered = projects.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function updateProject(id: string, name: string, formData: FormData): SavedProject | null {
  const projects = getSavedProjects();
  const index = projects.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  projects[index] = {
    ...projects[index],
    name,
    formData,
    updatedAt: new Date(),
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return projects[index];
}