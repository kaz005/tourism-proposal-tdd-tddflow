'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface SubsidyInputProps {
  subsidies: string[];
  onChange: (subsidies: string[]) => void;
}

export default function SubsidyInput({ subsidies, onChange }: SubsidyInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addSubsidy = () => {
    if (inputValue.trim() && !subsidies.includes(inputValue.trim())) {
      onChange([...subsidies, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeSubsidy = (index: number) => {
    onChange(subsidies.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubsidy();
    }
  };

  return (
    <div className="space-y-3">
      <label className="form-label">候補補助金名</label>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="form-input flex-1"
          placeholder="補助金名を入力してEnterまたは追加ボタンをクリック"
        />
        <button
          type="button"
          onClick={addSubsidy}
          className="btn-secondary flex items-center gap-2"
        >
          <Plus size={16} />
          追加
        </button>
      </div>
      
      {subsidies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {subsidies.map((subsidy, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm"
            >
              <span>{subsidy}</span>
              <button
                type="button"
                onClick={() => removeSubsidy(index)}
                className="text-primary-500 hover:text-primary-700 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}