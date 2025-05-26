/**
 * @jest-environment jsdom
 */

import { saveProject, getSavedProjects, deleteProject, updateProject } from '@/lib/storage';
import { FormData } from '@/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Storage Functions', () => {
  const mockFormData: FormData = {
    regionName: 'テスト地域',
    resources: [
      {
        name: 'テスト資源',
        priority: 'high',
        attractiveness: 4,
        uniqueKeyword: 'テストキーワード',
      },
    ],
    targetCustomers: 'テスト顧客',
    tourConcept: 'テストコンセプト',
    subsidyPrograms: ['テスト補助金'],
    initialInvestment: 1000,
    revenueEstimate: 'テスト売上',
    managementStructure: 'テスト体制',
    additionalNotes: 'テストメモ',
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveProject', () => {
    test('should save project to localStorage', () => {
      const project = saveProject('テストプロジェクト', mockFormData);

      expect(project.name).toBe('テストプロジェクト');
      expect(project.formData).toEqual(mockFormData);
      expect(project.id).toBeDefined();
      expect(project.createdAt).toBeInstanceOf(Date);
      expect(project.updatedAt).toBeInstanceOf(Date);
    });

    test('should generate unique IDs for different projects', () => {
      const project1 = saveProject('プロジェクト1', mockFormData);
      const project2 = saveProject('プロジェクト2', mockFormData);

      expect(project1.id).not.toBe(project2.id);
    });
  });

  describe('getSavedProjects', () => {
    test('should return empty array when no projects saved', () => {
      const projects = getSavedProjects();
      expect(projects).toEqual([]);
    });

    test('should return saved projects', () => {
      const savedProject = saveProject('テストプロジェクト', mockFormData);
      const projects = getSavedProjects();

      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('テストプロジェクト');
      expect(projects[0].id).toBe(savedProject.id);
    });

    test('should handle corrupted localStorage data', () => {
      localStorage.setItem('tourism-proposal-projects', 'invalid json');
      const projects = getSavedProjects();
      expect(projects).toEqual([]);
    });
  });

  describe('deleteProject', () => {
    test('should delete project by ID', () => {
      const project1 = saveProject('プロジェクト1', mockFormData);
      const project2 = saveProject('プロジェクト2', mockFormData);

      deleteProject(project1.id);
      const projects = getSavedProjects();

      expect(projects).toHaveLength(1);
      expect(projects[0].id).toBe(project2.id);
    });

    test('should handle deletion of non-existent project', () => {
      const project = saveProject('テストプロジェクト', mockFormData);
      deleteProject('non-existent-id');
      
      const projects = getSavedProjects();
      expect(projects).toHaveLength(1);
      expect(projects[0].id).toBe(project.id);
    });
  });

  describe('updateProject', () => {
    test('should update existing project', () => {
      const originalProject = saveProject('元のプロジェクト', mockFormData);
      
      const updatedFormData = {
        ...mockFormData,
        regionName: '更新された地域',
      };

      const updatedProject = updateProject(originalProject.id, '更新されたプロジェクト', updatedFormData);

      expect(updatedProject).not.toBeNull();
      expect(updatedProject!.name).toBe('更新されたプロジェクト');
      expect(updatedProject!.formData.regionName).toBe('更新された地域');
      expect(updatedProject!.updatedAt).not.toEqual(originalProject.updatedAt);
    });

    test('should return null for non-existent project', () => {
      const result = updateProject('non-existent-id', '新しい名前', mockFormData);
      expect(result).toBeNull();
    });
  });
});