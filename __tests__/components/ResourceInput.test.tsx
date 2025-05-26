/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import ResourceInput from '@/components/ResourceInput';
import { TourismResource } from '@/types';

describe('ResourceInput Component', () => {
  const mockResources: TourismResource[] = [
    {
      name: 'テスト資源',
      priority: 'high',
      attractiveness: 4,
      uniqueKeyword: 'テストキーワード',
    },
  ];

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('should render with existing resources', () => {
    render(<ResourceInput resources={mockResources} onChange={mockOnChange} />);

    expect(screen.getByDisplayValue('テスト資源')).toBeInTheDocument();
    expect(screen.getByDisplayValue('テストキーワード')).toBeInTheDocument();
    expect(screen.getByDisplayValue('high')).toBeInTheDocument();
  });

  test('should render empty state message when no resources', () => {
    render(<ResourceInput resources={[]} onChange={mockOnChange} />);

    expect(screen.getByText(/「資源を追加」ボタンをクリックして/)).toBeInTheDocument();
  });

  test('should add new resource when clicking add button', () => {
    render(<ResourceInput resources={[]} onChange={mockOnChange} />);

    const addButton = screen.getByText('資源を追加');
    fireEvent.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        name: '',
        priority: 'medium',
        attractiveness: 3,
        uniqueKeyword: '',
      },
    ]);
  });

  test('should remove resource when clicking delete button', () => {
    render(<ResourceInput resources={mockResources} onChange={mockOnChange} />);

    const deleteButton = screen.getByRole('button', { name: '' }); // Trash icon button
    fireEvent.click(deleteButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  test('should update resource name', () => {
    render(<ResourceInput resources={mockResources} onChange={mockOnChange} />);

    const nameInput = screen.getByDisplayValue('テスト資源');
    fireEvent.change(nameInput, { target: { value: '更新された資源名' } });

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        ...mockResources[0],
        name: '更新された資源名',
      },
    ]);
  });

  test('should update resource priority', () => {
    render(<ResourceInput resources={mockResources} onChange={mockOnChange} />);

    const prioritySelect = screen.getByDisplayValue('high');
    fireEvent.change(prioritySelect, { target: { value: 'low' } });

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        ...mockResources[0],
        priority: 'low',
      },
    ]);
  });

  test('should update resource attractiveness', () => {
    render(<ResourceInput resources={mockResources} onChange={mockOnChange} />);

    const attractivenessSelect = screen.getByDisplayValue('4');
    fireEvent.change(attractivenessSelect, { target: { value: '5' } });

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        ...mockResources[0],
        attractiveness: 5,
      },
    ]);
  });

  test('should update resource unique keyword', () => {
    render(<ResourceInput resources={mockResources} onChange={mockOnChange} />);

    const keywordInput = screen.getByDisplayValue('テストキーワード');
    fireEvent.change(keywordInput, { target: { value: '新しいキーワード' } });

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        ...mockResources[0],
        uniqueKeyword: '新しいキーワード',
      },
    ]);
  });

  test('should handle multiple resources', () => {
    const multipleResources: TourismResource[] = [
      {
        name: '資源1',
        priority: 'high',
        attractiveness: 5,
        uniqueKeyword: 'キーワード1',
      },
      {
        name: '資源2',
        priority: 'medium',
        attractiveness: 3,
        uniqueKeyword: 'キーワード2',
      },
    ];

    render(<ResourceInput resources={multipleResources} onChange={mockOnChange} />);

    expect(screen.getByDisplayValue('資源1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('資源2')).toBeInTheDocument();
    expect(screen.getByText('資源 1')).toBeInTheDocument();
    expect(screen.getByText('資源 2')).toBeInTheDocument();
  });
});