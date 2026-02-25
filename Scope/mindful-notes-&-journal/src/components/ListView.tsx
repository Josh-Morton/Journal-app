import React from 'react';
import { Entry, EntryType } from '../types';
import { useStore } from '../store';
import { FileText, Mic, ChefHat, Plus } from 'lucide-react';

interface ListViewProps {
  type: EntryType;
  onOpenEntry: (entry: Entry) => void;
  onNewEntry: (type: EntryType) => void;
}

export function ListView({ type, onOpenEntry, onNewEntry }: ListViewProps) {
  const { entries } = useStore();
  const filteredEntries = entries.filter(e => e.type === type);

  const getIcon = () => {
    switch (type) {
      case 'note': return <FileText size={24} />;
      case 'journal': return <Mic size={24} />;
      case 'recipe': return <ChefHat size={24} />;
      default: return <FileText size={24} />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'note': return 'My Notes';
      case 'journal': return 'Voice Journals';
      case 'recipe': return 'My Recipes';
      default: return 'Entries';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            {getIcon()}
          </div>
          <h1 className="font-semibold text-2xl">{getTitle()}</h1>
        </div>
        <button 
          onClick={() => onNewEntry(type)}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
        </button>
      </header>

      <div className="space-y-4">
        {filteredEntries.map(entry => (
          <div 
            key={entry.id} 
            onClick={() => onOpenEntry(entry)}
            className="bg-white p-5 rounded-3xl cursor-pointer hover:shadow-md transition-shadow shadow-sm border border-slate-100"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-slate-800">{entry.title || 'Untitled'}</h3>
              <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                {new Date(entry.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: entry.content || (entry.type === 'recipe' ? `${entry.recipeData?.ingredients.length || 0} ingredients, ${entry.recipeData?.steps.length || 0} steps` : 'No content') }} />
            
            <div className="flex gap-2 mt-4">
              {entry.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-50 rounded-full text-xs font-medium text-slate-600 border border-slate-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
        {filteredEntries.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              {getIcon()}
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">No {type}s yet</h3>
            <p className="text-slate-500 text-sm">Tap the plus button to create your first one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
