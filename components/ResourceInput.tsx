'use client';

import { useState } from 'react';
import { TourismResource } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface ResourceInputProps {
  resources: TourismResource[];
  onChange: (resources: TourismResource[]) => void;
}

export default function ResourceInput({ resources, onChange }: ResourceInputProps) {
  const addResource = () => {
    const newResource: TourismResource = {
      name: '',
      priority: 'medium',
      attractiveness: 3,
      uniqueKeyword: '',
    };
    onChange([...resources, newResource]);
  };

  const removeResource = (index: number) => {
    onChange(resources.filter((_, i) => i !== index));
  };

  const updateResource = (index: number, field: keyof TourismResource, value: any) => {
    const updated = resources.map((resource, i) => 
      i === index ? { ...resource, [field]: value } : resource
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="form-label">地域固有資源リスト</label>
        <button
          type="button"
          onClick={addResource}
          className="btn-secondary flex items-center gap-2"
        >
          <Plus size={16} />
          資源を追加
        </button>
      </div>
      
      {resources.map((resource, index) => (
        <div key={index} className="card">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-medium text-gray-700">資源 {index + 1}</h4>
            <button
              type="button"
              onClick={() => removeResource(index)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">資源名</label>
              <input
                type="text"
                value={resource.name}
                onChange={(e) => updateResource(index, 'name', e.target.value)}
                className="form-input"
                placeholder="例：滝と渓流"
              />
            </div>
            
            <div>
              <label className="form-label">優先度</label>
              <select
                value={resource.priority}
                onChange={(e) => updateResource(index, 'priority', e.target.value)}
                className="form-input"
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">魅力度（★1-5）</label>
              <select
                value={resource.attractiveness}
                onChange={(e) => updateResource(index, 'attractiveness', parseInt(e.target.value))}
                className="form-input"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>
                    {'★'.repeat(num)} ({num})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="form-label">独自性キーワード</label>
              <input
                type="text"
                value={resource.uniqueKeyword}
                onChange={(e) => updateResource(index, 'uniqueKeyword', e.target.value)}
                className="form-input"
                placeholder="例：未開発エリア"
              />
            </div>
          </div>
        </div>
      ))}
      
      {resources.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          「資源を追加」ボタンをクリックして地域固有資源を追加してください
        </div>
      )}
    </div>
  );
}