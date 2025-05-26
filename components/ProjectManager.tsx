'use client';

import { useState, useEffect } from 'react';
import { FormData, SavedProject } from '@/types';
import { getSavedProjects, deleteProject, saveProject } from '@/lib/storage';
import { Save, FolderOpen, Trash2, Edit3 } from 'lucide-react';

interface ProjectManagerProps {
  currentData: FormData;
  onLoad: (data: FormData) => void;
}

export default function ProjectManager({ currentData, onLoad }: ProjectManagerProps) {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setProjects(getSavedProjects());
  }, []);

  const handleSave = async () => {
    if (!projectName.trim()) return;
    
    setIsSaving(true);
    try {
      const newProject = saveProject(projectName.trim(), currentData);
      setProjects([...projects, newProject]);
      setProjectName('');
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('このプロジェクトを削除しますか？')) {
      deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const handleLoad = (project: SavedProject) => {
    onLoad(project.formData);
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">プロジェクト管理</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={16} />
          現在の入力を保存
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          保存されたプロジェクトはありません
        </p>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{project.name}</h4>
                <p className="text-sm text-gray-500">
                  作成: {project.createdAt.toLocaleDateString('ja-JP')}
                  {project.updatedAt > project.createdAt && (
                    <span> / 更新: {project.updatedAt.toLocaleDateString('ja-JP')}</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleLoad(project)}
                  className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                  title="読み込み"
                >
                  <FolderOpen size={16} />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  title="削除"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">プロジェクトを保存</h3>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="プロジェクト名を入力"
              className="form-input mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
                disabled={isSaving}
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="btn-primary"
                disabled={!projectName.trim() || isSaving}
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}