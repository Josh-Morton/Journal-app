import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { ChevronLeft, Trash2, CheckCircle2, Square, CheckSquare, Plus, X, Edit3 } from "lucide-react-native";
import { Card } from "../../components/ui/Card";
import * as Haptics from 'expo-haptics';
import { database, useNotes } from "../../lib/db";
import { Note } from "../../models/Note";

export default function NoteDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNote = async () => {
            if (!id) return;
            try {
                const data = await useNotes().find(id);
                setNote(data);
            } catch (error) {
                console.error("Error fetching note:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNote();
    }, [id]);

    const toggleItem = async (index: number) => {
        if (!note) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        try {
            const newItems = [...note.items];
            newItems[index].checked = !newItems[index].checked;

            await database.write(async () => {
                await note.update((n) => {
                    n.items = newItems;
                });
            });
            // Force re-render if needed, though WatermelonDB observables are better
            setNote(await useNotes().find(note.id));
        } catch (error) {
            console.error("Failed to update item:", error);
        }
    };

    const handleDelete = async () => {
        if (!note) return;
        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await database.write(async () => {
                await note.destroyPermanently();
            });
            router.back();
        } catch (error) {
            console.error("Failed to delete note:", error);
        }
    };

    if (loading) {
        return (
            <ScreenWrapper bgClass="bg-brand-bg">
                <View className="flex-1 items-center justify-center">
                    <Text className="text-secondary font-body font-bold animate-pulse">Retrieving your note...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    if (!note) {
        return (
            <ScreenWrapper bgClass="bg-brand-bg">
                <View className="flex-1 items-center justify-center p-6">
                    <Text className="text-text-main font-heading font-bold text-2xl text-center mb-4">Note Not Found</Text>
                    <TouchableOpacity onPress={() => router.back()} className="bg-primary px-6 py-3 rounded-full">
                        <Text className="text-white font-body font-bold">Go Back</Text>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper bgClass="bg-brand-bg">
            <View className="flex-row justify-between items-center py-6 px-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-12 h-12 items-center justify-center bg-white rounded-full shadow-sm shadow-primary/10 border border-white/20"
                >
                    <ChevronLeft size={24} color="#8B5CF6" />
                </TouchableOpacity>

                <View className="flex-row gap-4">
                    <TouchableOpacity
                        onPress={() => router.push(`/note/new?id=${note.id}`)}
                        className="w-12 h-12 items-center justify-center bg-white rounded-full shadow-sm shadow-primary/10 border border-white/20"
                    >
                        <Edit3 size={20} color="#8B5CF6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleDelete}
                        className="w-12 h-12 items-center justify-center bg-white/80 rounded-full shadow-sm shadow-red-100 border border-white/20"
                    >
                        <Trash2 size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="mb-8">
                    <Text className="text-primary/40 text-[10px] font-body font-bold uppercase tracking-widest mb-2 ml-1">Quick Note</Text>
                    <Text className="text-5xl font-heading font-bold text-text-main leading-tight mb-4">
                        {note.title || "Untitled"}
                    </Text>
                </View>

                <Card
                    className="p-6 mb-8 border-primary/5 shadow-sm"
                    color={note.color || "#ffffff"}
                    variant="elevated"
                >
                    <View className="mb-2">
                        {note.items && note.items.length > 0 ? (
                            note.items.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => toggleItem(index)}
                                    className="flex-row items-center mb-4"
                                >
                                    <View className={`w-7 h-7 rounded-xl items-center justify-center mr-4 border-2 ${item.checked ? 'bg-accent border-accent' : 'bg-white border-primary/20'}`}>
                                        {item.checked && <CheckSquare size={16} color="white" />}
                                        {!item.checked && <Square size={16} color="#C4B5FD" />}
                                    </View>
                                    <Text className={`text-xl font-body flex-1 ${item.checked ? 'text-primary/30 line-through' : 'text-text-main'}`}>
                                        {item.text}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View className="items-center py-10 opacity-30">
                                <Plus size={32} color="#8B5CF6" />
                                <Text className="text-text-main font-body mt-2">No items in this note.</Text>
                            </View>
                        )}
                    </View>
                </Card>

                {note.tags && note.tags.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mb-10">
                        {note.tags.map((tag) => (
                            <View key={tag} className="bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                                <Text className="text-primary/60 font-body font-bold text-xs">#{tag}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

