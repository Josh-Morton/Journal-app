import React from 'react';
import { View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Bold, Italic, Heading1, List, CheckSquare } from 'lucide-react-native';

interface MarkdownToolbarProps {
    onInsert: (markdown: string, wrapper?: string) => void;
}

export function MarkdownToolbar({ onInsert }: MarkdownToolbarProps) {
    return (
        <View
            className="flex-row items-center bg-white border-t border-slate-100 p-2"
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 4,
                ...(Platform.OS === 'web' ? { position: 'sticky', bottom: 0, zIndex: 10 } : {})
            }}
        >
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 px-2" contentContainerStyle={{ gap: 12, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => onInsert('**', '**')} className="p-2 rounded-lg bg-slate-50">
                    <Bold size={18} color="#475569" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onInsert('_', '_')} className="p-2 rounded-lg bg-slate-50">
                    <Italic size={18} color="#475569" />
                </TouchableOpacity>
                <View className="w-[1px] h-6 bg-slate-200 mx-1" />
                <TouchableOpacity onPress={() => onInsert('\n## ')} className="p-2 rounded-lg bg-blue-50">
                    <Heading1 size={18} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onInsert('\n- ')} className="p-2 rounded-lg bg-blue-50">
                    <List size={18} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onInsert('\n- [ ] ')} className="p-2 rounded-lg bg-blue-50">
                    <CheckSquare size={18} color="#2563eb" />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
