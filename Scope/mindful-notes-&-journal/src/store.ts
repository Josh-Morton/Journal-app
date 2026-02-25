import { useState, useEffect } from 'react';
import { Entry } from './types';

const DUMMY_DATA: Entry[] = [
  {
    id: '1',
    type: 'note',
    title: 'Project Ideas',
    content: '<h1>New App Ideas</h1><ul><li>A habit tracker</li><li>A recipe manager</li><li>A personal journal</li></ul>',
    tags: ['ideas', 'work'],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: '2',
    type: 'journal',
    title: 'Morning Walk',
    content: 'Today I went for a morning walk and the weather was absolutely beautiful. I felt very refreshed and ready to start the day.',
    tags: ['personal'],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: '3',
    type: 'recipe',
    title: 'Avocado Toast',
    content: '',
    tags: ['breakfast'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    recipeData: {
      ingredients: ['2 slices of bread', '1 avocado', 'Salt and pepper', 'Lemon juice'],
      steps: ['Toast the bread', 'Mash the avocado with lemon juice', 'Spread on toast', 'Season with salt and pepper']
    }
  }
];

export function useStore() {
  const [entries, setEntries] = useState<Entry[]>(() => {
    const saved = localStorage.getItem('app_entries');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
    return DUMMY_DATA;
  });

  useEffect(() => {
    localStorage.setItem('app_entries', JSON.stringify(entries));
  }, [entries]);

  const addEntry = (entry: Entry) => setEntries(prev => [entry, ...prev]);
  const updateEntry = (id: string, updated: Partial<Entry>) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updated, updatedAt: Date.now() } : e));
  };
  const deleteEntry = (id: string) => setEntries(prev => prev.filter(e => e.id !== id));

  const allTags = Array.from(new Set(entries.flatMap(e => e.tags)));

  return { entries, addEntry, updateEntry, deleteEntry, allTags };
}
