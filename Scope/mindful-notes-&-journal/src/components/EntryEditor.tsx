import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share, Tag, Sparkles, Mic, Square, Plus, Trash2, Save, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Entry, EntryType } from '../types';
import { useAudioRecorder, blobToBase64 } from '../lib/audio';
import { transcribeAudio, extractRecipeFromAudio, updateRecipeWithAudio } from '../lib/gemini';
import { useStore } from '../store';

interface EntryEditorProps {
  entry: Entry;
  onSave: (entry: Entry) => void;
  onBack: () => void;
}

export function EntryEditor({ entry: initialEntry, onSave, onBack }: EntryEditorProps) {
  const [entry, setEntry] = useState<Entry>(initialEntry);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const { allTags } = useStore();
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  // Auto-save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (entry.title || entry.content || entry.recipeData?.ingredients.length) {
        onSave(entry);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [entry, onSave]);

  const handleAudioRecord = async () => {
    if (isRecording) {
      setIsProcessing(true);
      const { blob, mimeType } = await stopRecording();
      const base64 = await blobToBase64(blob);
      
      try {
        if (entry.type === 'journal' || entry.type === 'note') {
          const text = await transcribeAudio(base64, mimeType);
          setEntry(prev => ({ ...prev, content: prev.content + (prev.content ? '\n\n' : '') + text }));
        } else if (entry.type === 'recipe') {
          if (!entry.recipeData || (entry.recipeData.ingredients.length === 0 && entry.recipeData.steps.length === 0)) {
            const data = await extractRecipeFromAudio(base64, mimeType);
            setEntry(prev => ({ ...prev, recipeData: data }));
          } else {
            const data = await updateRecipeWithAudio(entry.recipeData, base64, mimeType);
            setEntry(prev => ({ ...prev, recipeData: data }));
          }
        }
      } catch (e) {
        console.error("Error processing audio:", e);
        alert("Failed to process audio.");
      } finally {
        setIsProcessing(false);
      }
    } else {
      await startRecording();
    }
  };

  const updateRecipeList = (list: 'ingredients' | 'steps', index: number, value: string) => {
    setEntry(prev => {
      const data = prev.recipeData || { ingredients: [], steps: [] };
      const newList = [...data[list]];
      newList[index] = value;
      return { ...prev, recipeData: { ...data, [list]: newList } };
    });
  };

  const addRecipeItem = (list: 'ingredients' | 'steps') => {
    setEntry(prev => {
      const data = prev.recipeData || { ingredients: [], steps: [] };
      return { ...prev, recipeData: { ...data, [list]: [...data[list], ''] } };
    });
  };

  const removeRecipeItem = (list: 'ingredients' | 'steps', index: number) => {
    setEntry(prev => {
      const data = prev.recipeData || { ingredients: [], steps: [] };
      const newList = [...data[list]];
      newList.splice(index, 1);
      return { ...prev, recipeData: { ...data, [list]: newList } };
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-white sticky top-0 z-10">
        <button onClick={onBack} className="p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="font-semibold text-lg capitalize">Create {entry.type}</h1>
        <div className="flex gap-2">
          <button onClick={() => { onSave(entry); onBack(); }} className="p-3 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors text-blue-600">
            <Save size={20} />
          </button>
          <button className="p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
            <Share size={20} className="text-slate-600" />
          </button>
        </div>
      </header>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {/* Title */}
        <div className="relative">
          <input
            type="text"
            placeholder="Title..."
            value={entry.title}
            onChange={e => setEntry({ ...entry, title: e.target.value })}
            className="w-full text-2xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 placeholder-slate-300"
          />
          <Sparkles className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
        </div>

        {/* Tags Display */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {entry.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {tag}
                <button onClick={() => setEntry(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))} className="hover:text-blue-900">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Content Area based on type */}
        {entry.type === 'recipe' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Ingredients</h3>
                <button onClick={() => addRecipeItem('ingredients')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                  <Plus size={20} />
                </button>
              </div>
              {entry.recipeData?.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Square size={20} className="text-slate-300 flex-shrink-0" />
                  <input 
                    type="text" 
                    value={ing} 
                    onChange={e => updateRecipeList('ingredients', i, e.target.value)}
                    className="flex-1 bg-transparent border-b border-slate-100 focus:border-blue-300 focus:outline-none py-1"
                    placeholder="Ingredient..."
                  />
                  <button onClick={() => removeRecipeItem('ingredients', i)} className="text-red-400 p-1"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Steps</h3>
                <button onClick={() => addRecipeItem('steps')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                  <Plus size={20} />
                </button>
              </div>
              {entry.recipeData?.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="bg-slate-100 text-slate-500 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1">
                    {i + 1}
                  </span>
                  <textarea 
                    value={step} 
                    onChange={e => updateRecipeList('steps', i, e.target.value)}
                    className="flex-1 bg-transparent border-b border-slate-100 focus:border-blue-300 focus:outline-none py-1 resize-none min-h-[40px]"
                    placeholder="Step description..."
                  />
                  <button onClick={() => removeRecipeItem('steps', i)} className="text-red-400 p-1 mt-1"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {entry.type === 'note' && (
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <ReactQuill 
              theme="snow" 
              value={entry.content} 
              onChange={(content) => setEntry({ ...entry, content })}
              className="h-[300px] border-none"
              placeholder="Write your thoughts..."
            />
          </div>
        )}

        {entry.type === 'journal' && (
          <textarea
            placeholder="Write your thoughts..."
            value={entry.content}
            onChange={e => setEntry({ ...entry, content: e.target.value })}
            className="w-full min-h-[300px] bg-white p-6 rounded-3xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none text-slate-700 leading-relaxed"
          />
        )}

        {/* Metadata Actions */}
        <div className="flex gap-3 overflow-visible pb-2 relative">
          <div className="relative">
            <button 
              onClick={() => setShowTagDropdown(!showTagDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-sm font-medium text-slate-600 whitespace-nowrap hover:bg-slate-50"
            >
              <Tag size={16} className="text-red-400" /> Add Tag
            </button>
            
            {showTagDropdown && (
              <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
                <div className="max-h-40 overflow-y-auto mb-2">
                  {allTags.filter(t => !entry.tags.includes(t)).map(tag => (
                    <button 
                      key={tag}
                      onClick={() => {
                        setEntry(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                        setShowTagDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-xl text-slate-700"
                    >
                      {tag}
                    </button>
                  ))}
                  {allTags.filter(t => !entry.tags.includes(t)).length === 0 && (
                    <p className="text-xs text-slate-400 px-3 py-2">No existing tags to add.</p>
                  )}
                </div>
                <div className="flex gap-2 px-1 border-t border-slate-100 pt-2">
                  <input 
                    type="text" 
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    placeholder="New tag..."
                    className="flex-1 min-w-0 bg-slate-50 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newTagInput.trim() && !entry.tags.includes(newTagInput.trim())) {
                        setEntry(prev => ({ ...prev, tags: [...prev.tags, newTagInput.trim()] }));
                        setNewTagInput('');
                        setShowTagDropdown(false);
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      if (newTagInput.trim() && !entry.tags.includes(newTagInput.trim())) {
                        setEntry(prev => ({ ...prev, tags: [...prev.tags, newTagInput.trim()] }));
                        setNewTagInput('');
                        setShowTagDropdown(false);
                      }
                    }}
                    className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button for Audio */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={handleAudioRecord}
          disabled={isProcessing}
          className={`p-6 rounded-full shadow-xl transition-all flex items-center justify-center ${
            isRecording 
              ? 'bg-red-500 text-white animate-pulse scale-110' 
              : isProcessing 
                ? 'bg-slate-200 text-slate-500' 
                : 'bg-blue-600 text-white hover:scale-105'
          }`}
        >
          {isProcessing ? (
            <Sparkles size={32} className="animate-spin" />
          ) : isRecording ? (
            <Square size={32} fill="currentColor" />
          ) : (
            <Mic size={32} />
          )}
        </button>
        {isRecording && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            Recording...
          </div>
        )}
      </div>
    </div>
  );
}
