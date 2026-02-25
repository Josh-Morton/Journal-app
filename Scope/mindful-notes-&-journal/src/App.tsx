import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { HomeView } from './components/HomeView';
import { ListView } from './components/ListView';
import { EntryEditor } from './components/EntryEditor';
import { Entry, EntryType } from './types';
import { useStore } from './store';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const { entries, addEntry, updateEntry } = useStore();

  const handleNewEntry = (type: string) => {
    const generateId = () => {
      return typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Date.now().toString(36) + Math.random().toString(36).substring(2);
    };

    const newEntry: Entry = {
      id: generateId(),
      type: type as EntryType,
      title: '',
      content: '',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      recipeData: type === 'recipe' ? { ingredients: [], steps: [] } : undefined
    };
    setEditingEntry(newEntry);
  };

  const handleSaveEntry = (entry: Entry) => {
    const exists = entries.some(e => e.id === entry.id);
    if (exists) {
      updateEntry(entry.id, entry);
    } else {
      addEntry(entry);
    }
  };

  if (editingEntry) {
    return (
      <EntryEditor 
        entry={editingEntry} 
        onSave={handleSaveEntry} 
        onBack={() => setEditingEntry(null)} 
      />
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onAddClick={handleNewEntry}>
      {activeTab === 'home' && <HomeView onNewEntry={handleNewEntry} onOpenEntry={setEditingEntry} />}
      {activeTab === 'note' && <ListView type="note" onOpenEntry={setEditingEntry} onNewEntry={handleNewEntry} />}
      {activeTab === 'journal' && <ListView type="journal" onOpenEntry={setEditingEntry} onNewEntry={handleNewEntry} />}
      {activeTab === 'recipes' && <ListView type="recipe" onOpenEntry={setEditingEntry} onNewEntry={handleNewEntry} />}
    </Layout>
  );
}
