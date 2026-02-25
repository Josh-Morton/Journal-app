import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entry } from './types';

const STORAGE_KEY = 'app_entries';

const DUMMY_DATA: Entry[] = [
    {
        id: '1',
        type: 'note',
        title: 'Project Ideas',
        content: 'New App Ideas\n• A habit tracker\n• A recipe manager\n• A personal journal',
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
            steps: ['Toast the bread', 'Mash the avocado with lemon juice', 'Spread on toast', 'Season with salt and pepper'],
        },
    },
];

export function useStore() {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [loaded, setLoaded] = useState(false);

    // Load from AsyncStorage on mount
    useEffect(() => {
        (async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.length > 0) {
                        setEntries(parsed);
                    } else {
                        setEntries(DUMMY_DATA);
                    }
                } else {
                    setEntries(DUMMY_DATA);
                }
            } catch {
                setEntries(DUMMY_DATA);
            }
            setLoaded(true);
        })();
    }, []);

    // Persist to AsyncStorage whenever entries change
    useEffect(() => {
        if (loaded) {
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        }
    }, [entries, loaded]);

    const addEntry = useCallback((entry: Entry) => {
        setEntries(prev => [entry, ...prev]);
    }, []);

    const updateEntry = useCallback((id: string, updated: Partial<Entry>) => {
        setEntries(prev =>
            prev.map(e => (e.id === id ? { ...e, ...updated, updatedAt: Date.now() } : e))
        );
    }, []);

    const deleteEntry = useCallback((id: string) => {
        setEntries(prev => prev.filter(e => e.id !== id));
    }, []);

    const allTags = Array.from(new Set(entries.flatMap(e => e.tags)));

    return { entries, addEntry, updateEntry, deleteEntry, allTags, loaded };
}
