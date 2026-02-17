import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Search, Square, CheckSquare, CheckCircle2 } from "lucide-react-native";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { SearchBar } from "../../components/ui/SearchBar";
import { Card } from "../../components/ui/Card";
import { FloatingActionButton } from "../../components/ui/FAB";
import { useState, useEffect } from "react";
import { database, useNotes } from "../../lib/db";
import { Note } from "../../models/Note";
import { Q } from "@nozbe/watermelondb";

export default function NotesScreen() {
    const router = useRouter();
    const [notes, setNotes] = useState<Note[]>([]);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const data = await useNotes().query(Q.sortBy('created_at', Q.desc)).fetch();
                setNotes(data);
            } catch (error) {
                console.error("Error fetching notes:", error);
            }
        };
        fetchNotes();
    }, []);

    return (
        <ScreenWrapper bgClass="bg-brand-bg">
            <View className="px-4 py-8 bg-white/30 border-b border-primary/5">
                <Text className="text-4xl font-heading font-bold text-text-main">Notes</Text>
            </View>

            <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Search */}
                <SearchBar placeholder="Search your notes..." className="mb-8" />

                {/* Masonry-like Grid (2 columns) */}
                <View className="flex-row justify-between">
                    <View className="w-[48%]">
                        {notes.filter((_, i) => i % 2 === 0).map((note) => (
                            <NoteCard key={note.id} note={note} onPress={() => router.push(`/note/${note.id}`)} />
                        ))}
                    </View>
                    <View className="w-[48%]">
                        {notes.filter((_, i) => i % 2 !== 0).map((note) => (
                            <NoteCard key={note.id} note={note} onPress={() => router.push(`/note/${note.id}`)} />
                        ))}
                    </View>
                </View>

                {notes.length === 0 && (
                    <View className="items-center py-24 opacity-30">
                        <CheckCircle2 size={40} color="#8B5CF6" strokeWidth={1.5} />
                        <Text className="text-text-main font-body text-center mt-4 text-base">Your note sanctuary is empty.{"\n"}Tap the button to start.</Text>
                    </View>
                )}
            </ScrollView>

            <FloatingActionButton onPress={() => router.push("/notes/new")} />
        </ScreenWrapper>
    );
}

function NoteCard({ note, onPress }: { note: Note, onPress: () => void }) {
    const items = note.items || [];
    const checkedCount = items.filter((i: any) => i.checked).length;
    const totalCount = items.length;

    return (
        <Card
            className="mb-4"
            color={note.color || "#ffffff"}
            onPress={onPress}
            variant="elevated"
            style={{ borderColor: (note.color === '#ffffff' || !note.color) ? '#e5e7eb' : 'transparent' }}
        >
            <Text className="text-lg font-heading font-bold text-text-main mb-2">{note.title || "Untitled"}</Text>

            {/* Items Preview */}
            <View className="mb-3">
                {items.slice(0, 3).map((item: any, idx: number) => (
                    <View key={idx} className="flex-row items-center mb-1">
                        {item.checked ? (
                            <CheckSquare size={14} color="#8B5CF6" />
                        ) : (
                            <Square size={14} color="#C4B5FD" />
                        )}
                        <Text className={`ml-2 text-sm font-body ${item.checked ? "text-primary/30 line-through" : "text-text-main/70"}`} numberOfLines={1}>
                            {item.text}
                        </Text>
                    </View>
                ))}
                {items.length > 3 && (
                    <Text className="text-xs text-gray-400 mt-1">+{items.length - 3} more</Text>
                )}
                {items.length === 0 && (
                    <Text className="text-xs text-gray-400 italic">No items yet</Text>
                )}
            </View>

            {/* Footer: Count & Tags */}
            <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-black/5">
                <View className="flex-row items-center">
                    <CheckCircle2 size={12} color="#8B5CF6" />
                    <Text className="text-xs font-body text-primary/60 ml-1">{checkedCount}/{totalCount}</Text>
                </View>

                <View className="flex-row">
                    {(note.tags || []).slice(0, 1).map((tag: string) => (
                        <View key={tag} className="bg-primary/5 px-2 py-0.5 rounded-md ml-1">
                            <Text className="text-[10px] text-primary/70 font-body font-bold">{tag}</Text>
                        </View>
                    ))}
                    {(note.tags || []).length > 1 && (
                        <Text className="text-xs text-secondary ml-1">...</Text>
                    )}
                </View>
            </View>
        </Card>
    );
}

