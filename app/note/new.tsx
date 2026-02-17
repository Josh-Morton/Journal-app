import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Card } from "../../components/ui/Card";
import { X, Plus, Check, Mic, Image as ImageIcon, Tag, Trash2, CheckCircle2, Square, CheckSquare } from "lucide-react-native";
import * as Haptics from 'expo-haptics';
import { database, useNotes } from "../../lib/db";

const COLORS = [
    { name: 'White', value: '#ffffff', bg: 'bg-white' },
    { name: 'Lavender', value: '#FAF5FF', bg: 'bg-brand-bg' },
    { name: 'Lemon', value: '#FEFCE8', bg: 'bg-yellow-50' },
    { name: 'Mint', value: '#F0FDF4', bg: 'bg-green-50' },
    { name: 'Rose', value: '#FFF1F2', bg: 'bg-red-50' },
];

export default function NewNoteScreen() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [items, setItems] = useState<{ text: string, checked: boolean }[]>([]);
    const [newItem, setNewItem] = useState("");
    const [selectedColor, setSelectedColor] = useState('#ffffff');
    const [isSaving, setIsSaving] = useState(false);

    const addItem = () => {
        if (newItem.trim()) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setItems([...items, { text: newItem.trim(), checked: false }]);
            setNewItem("");
        }
    };

    const toggleItem = (index: number) => {
        Haptics.selectionAsync();
        const newItems = [...items];
        newItems[index].checked = !newItems[index].checked;
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!title.trim() && items.length === 0) return;

        setIsSaving(true);
        try {
            await database.write(async () => {
                await useNotes().create((note) => {
                    note.title = title.trim() || "Untitled Note";
                    note.items = items;
                    note.color = selectedColor;
                    note.tags = ["Quick Note"];
                    note.synced = false;
                });
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
        } catch (error) {
            console.error("Failed to save note:", error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ScreenWrapper bgClass="bg-brand-bg">
            <View className="flex-row justify-between items-center py-6 px-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-12 h-12 items-center justify-center bg-white rounded-full shadow-sm shadow-primary/10 border border-white/20"
                >
                    <X size={24} color="#8B5CF6" />
                </TouchableOpacity>

                <Text className="text-secondary font-heading font-bold text-lg uppercase tracking-widest">Quick Note</Text>

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving}
                    className={`bg-primary px-8 py-3 rounded-full shadow-lg shadow-primary/20 ${isSaving ? 'opacity-50' : ''}`}
                >
                    <Text className="text-white font-heading font-bold text-lg">{isSaving ? '...' : 'Save'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Title */}
                <TextInput
                    className="text-4xl font-heading font-bold text-text-main mb-6 px-2"
                    placeholder="Note Title"
                    value={title}
                    onChangeText={setTitle}
                    placeholderTextColor="#C4B5FD"
                />

                {/* Items Section */}
                <View className="mb-8">
                    <Text className="text-primary/40 text-[10px] font-body font-bold uppercase tracking-widest mb-4 ml-2">Checklist</Text>

                    {items.map((item, index) => (
                        <View key={index} className="flex-row items-center mb-3 group">
                            <TouchableOpacity
                                onPress={() => toggleItem(index)}
                                className="flex-row items-center flex-1"
                            >
                                <View className={`w-7 h-7 rounded-xl items-center justify-center mr-4 border-2 ${item.checked ? 'bg-accent border-accent' : 'bg-white border-primary/20'}`}>
                                    {item.checked && <Check size={16} color="white" strokeWidth={3} />}
                                </View>
                                <Text className={`text-xl font-body ${item.checked ? 'text-primary/30 line-through' : 'text-text-main'}`}>{item.text}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => removeItem(index)} className="p-2">
                                <Trash2 size={16} color="#ef4444" opacity={0.3} />
                            </TouchableOpacity>
                        </View>
                    ))}

                    <Card className="flex-row items-center p-3 bg-white/50 border-primary/10 mt-2 shadow-none" variant="flat">
                        <TextInput
                            className="flex-1 px-4 py-3 text-lg font-body text-text-main"
                            placeholder="Add something to do..."
                            value={newItem}
                            onChangeText={setNewItem}
                            onSubmitEditing={addItem}
                            placeholderTextColor="#C4B5FD"
                        />
                        <TouchableOpacity
                            onPress={addItem}
                            className="w-12 h-12 bg-primary rounded-2xl items-center justify-center"
                        >
                            <Plus size={20} color="white" strokeWidth={3} />
                        </TouchableOpacity>
                    </Card>
                </View>

                {/* Note Tint */}
                <View className="mb-8 p-6 bg-white/30 rounded-[32px] border border-white/40">
                    <Text className="text-primary/40 text-[10px] font-body font-bold uppercase tracking-widest mb-6">Note Atmosphere</Text>
                    <View className="flex-row justify-between">
                        {COLORS.map((color) => (
                            <TouchableOpacity
                                key={color.value}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setSelectedColor(color.value);
                                }}
                                className={`w-12 h-12 rounded-2xl ${color.bg} border-2 ${selectedColor === color.value ? 'border-primary shadow-sm' : 'border-white/50 opacity-60'}`}
                            />
                        ))}
                    </View>
                </View>

                {/* Bottom Tools */}
                <View className="flex-row justify-around py-8 border-t border-primary/5">
                    <TouchableOpacity className="items-center opacity-40">
                        <ImageIcon size={22} color="#8B5CF6" />
                        <Text className="text-[10px] font-body font-bold text-primary mt-2">PHOTO</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="items-center opacity-40">
                        <Mic size={22} color="#8B5CF6" />
                        <Text className="text-[10px] font-body font-bold text-primary mt-2">VOICE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="items-center opacity-40">
                        <Tag size={22} color="#8B5CF6" />
                        <Text className="text-[10px] font-body font-bold text-primary mt-2">TAGS</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

