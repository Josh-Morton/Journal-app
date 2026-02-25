import React, { useState } from 'react';
import { Home, Book, Plus, ChefHat, FileText, X, Mic } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddClick: (type: string) => void;
}

export function Layout({ children, activeTab, setActiveTab, onAddClick }: LayoutProps) {
  const [isFabOpen, setIsFabOpen] = useState(false);

  const handleAdd = (type: string) => {
    setIsFabOpen(false);
    onAddClick(type);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Cascading FAB Menu */}
      {isFabOpen && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsFabOpen(false)}>
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
            <button 
              onClick={(e) => { e.stopPropagation(); handleAdd('recipe'); }}
              className="flex items-center gap-3 bg-white px-4 py-3 rounded-full shadow-lg transform transition-all hover:scale-105"
            >
              <span className="font-medium text-slate-700">Recipe</span>
              <div className="p-2 bg-orange-100 text-orange-600 rounded-full"><ChefHat size={20} /></div>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleAdd('note'); }}
              className="flex items-center gap-3 bg-white px-4 py-3 rounded-full shadow-lg transform transition-all hover:scale-105"
            >
              <span className="font-medium text-slate-700">Text Note</span>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><FileText size={20} /></div>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleAdd('journal'); }}
              className="flex items-center gap-3 bg-white px-4 py-3 rounded-full shadow-lg transform transition-all hover:scale-105"
            >
              <span className="font-medium text-slate-700">Journal</span>
              <div className="p-2 bg-purple-100 text-purple-600 rounded-full"><Mic size={20} /></div>
            </button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-full ${activeTab === 'home' ? 'bg-blue-50' : ''}`}>
            <Home size={24} />
          </div>
        </button>
        
        <button 
          onClick={() => setActiveTab('note')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'note' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-full ${activeTab === 'note' ? 'bg-blue-50' : ''}`}>
            <FileText size={24} />
          </div>
        </button>

        <button 
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-600/30 transform -translate-y-4 hover:scale-105 transition-transform ${isFabOpen ? 'rotate-45' : ''}`}
        >
          <Plus size={28} />
        </button>

        <button 
          onClick={() => setActiveTab('journal')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'journal' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-full ${activeTab === 'journal' ? 'bg-blue-50' : ''}`}>
            <Book size={24} />
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('recipes')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'recipes' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-full ${activeTab === 'recipes' ? 'bg-blue-50' : ''}`}>
            <ChefHat size={24} />
          </div>
        </button>
      </nav>
    </div>
  );
}
