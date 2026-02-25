import React, { useState } from 'react';
import { Search, Settings, Bell, FileText, Mic, ChefHat, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { Entry } from '../types';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, addMonths, subMonths } from 'date-fns';

interface HomeViewProps {
  onNewEntry: (type: string) => void;
  onOpenEntry: (entry: Entry) => void;
}

export function HomeView({ onNewEntry, onOpenEntry }: HomeViewProps) {
  const { entries } = useStore();
  
  // Month calendar logic
  const [baseDate, setBaseDate] = useState(() => startOfMonth(new Date()));

  const handlePrevMonth = () => setBaseDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setBaseDate(prev => addMonths(prev, 1));

  const getEntriesCountForDate = (date: Date) => {
    return entries.filter(e => {
      const eDate = new Date(e.createdAt);
      return isSameDay(eDate, date);
    }).length;
  };

  const getEntryColor = (type: string) => {
    switch (type) {
      case 'note': return 'bg-blue-50 hover:bg-blue-100 border-blue-100';
      case 'journal': return 'bg-purple-50 hover:bg-purple-100 border-purple-100';
      case 'recipe': return 'bg-orange-50 hover:bg-orange-100 border-orange-100';
      default: return 'bg-slate-50 hover:bg-slate-100 border-slate-100';
    }
  };

  const getEntryTextColor = (type: string) => {
    switch (type) {
      case 'note': return 'text-blue-700';
      case 'journal': return 'text-purple-700';
      case 'recipe': return 'text-orange-700';
      default: return 'text-slate-700';
    }
  };

  const renderMonth = (date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="bg-white p-4 rounded-3xl shadow-sm flex-1 min-w-[280px]">
        <h3 className="text-center font-medium mb-4">{format(date, 'MMMM yyyy')}</h3>
        <div className="grid grid-cols-7 gap-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={`header-${i}`} className="text-center text-xs font-medium text-slate-400 mb-2">
              {day}
            </div>
          ))}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {daysInMonth.map((d, i) => {
            const dayEntries = entries.filter(e => isSameDay(new Date(e.createdAt), d));
            const isToday = isSameDay(d, new Date());
            return (
              <div key={i} className="aspect-square flex flex-col items-center justify-start pt-1 relative">
                <span className={`text-xs z-10 ${isToday ? 'font-bold text-blue-600 bg-blue-50 w-6 h-6 rounded-full flex items-center justify-center' : 'text-slate-600'}`}>
                  {format(d, 'd')}
                </span>
                <div className="flex gap-0.5 mt-1 flex-wrap justify-center px-1">
                  {dayEntries.slice(0, 3).map((e, j) => (
                    <div key={j} className={`w-1.5 h-1.5 rounded-full ${
                      e.type === 'note' ? 'bg-blue-500' :
                      e.type === 'journal' ? 'bg-purple-500' :
                      'bg-orange-500'
                    }`} />
                  ))}
                  {dayEntries.length > 3 && <div className="w-1 h-1 rounded-full bg-slate-300" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
            <img src="https://picsum.photos/seed/avatar/100/100" alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">Jhon Dong</h1>
            <p className="text-sm text-slate-500">Graphics Designer</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="p-2 bg-white rounded-full shadow-sm text-slate-600"><Settings size={20} /></button>
          <button className="p-2 bg-white rounded-full shadow-sm text-slate-600"><Bell size={20} /></button>
        </div>
      </header>

      {/* Activity Calendar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Activity</h2>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-1.5 rounded-full bg-white shadow-sm text-slate-600 hover:bg-slate-50"><ChevronLeft size={20}/></button>
            <button onClick={handleNextMonth} className="p-1.5 rounded-full bg-white shadow-sm text-slate-600 hover:bg-slate-50"><ChevronRight size={20}/></button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 overflow-x-auto pb-2">
          {renderMonth(baseDate)}
          {renderMonth(addMonths(baseDate, 1))}
        </div>
      </div>

      {/* Recent Notes */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Notes</h2>
        
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search notes, tags..." 
            className="w-full bg-white rounded-2xl py-4 pl-12 pr-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <Mic className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        </div>

        <div className="space-y-4">
          {entries.slice(0, 5).map(entry => (
            <div 
              key={entry.id} 
              onClick={() => onOpenEntry(entry)}
              className={`${getEntryColor(entry.type)} p-5 rounded-3xl cursor-pointer transition-colors border`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-semibold text-lg ${getEntryTextColor(entry.type)}`}>{entry.title || 'Untitled'}</h3>
                <span className="text-xs opacity-60 font-medium">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-sm opacity-80 line-clamp-2 mb-4" dangerouslySetInnerHTML={{ __html: entry.content || (entry.type === 'recipe' ? 'Recipe details...' : 'No content') }} />
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium shadow-sm capitalize">
                  {entry.type}
                </span>
                {entry.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <p className="text-slate-500 text-center py-8">No entries yet. Create one above!</p>
          )}
        </div>
      </div>
    </div>
  );
}
