import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Book, Plus } from "lucide-react-native";
import { useStore } from "../../lib/store";

export default function JournalListScreen() {
    const { entries } = useStore();
    const router = useRouter();
    const filteredEntries = entries.filter((e) => e.type === "journal");

    return (
        <View className="flex-1 bg-slate-50">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120, padding: 24 }} showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center gap-3">
                        <View className="p-3 bg-blue-50 rounded-2xl">
                            <Book size={24} color="#2563eb" />
                        </View>
                        <Text className="font-semibold text-2xl text-slate-900">Voice Journals</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push("/journal/new?type=journal")}
                        className="p-3 bg-blue-600 rounded-full"
                        style={{ shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
                    >
                        <Plus size={20} color="#ffffff" />
                    </TouchableOpacity>
                </View>

                {filteredEntries.map((entry) => (
                    <TouchableOpacity
                        key={entry.id}
                        onPress={() => router.push(`/journal/${entry.id}`)}
                        className="bg-white p-5 rounded-3xl mb-4 border border-slate-100"
                        activeOpacity={0.7}
                        style={{ shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 }}
                    >
                        <View className="flex-row justify-between items-start mb-2">
                            <Text className="font-semibold text-lg text-slate-800">{entry.title || "Untitled"}</Text>
                            <Text className="text-xs text-slate-400 ml-4">{new Date(entry.createdAt).toLocaleDateString()}</Text>
                        </View>
                        <Text className="text-sm text-slate-600 mb-4" numberOfLines={3}>{entry.content || "No content"}</Text>
                        <View className="flex-row gap-2 mt-2">
                            {entry.tags.map((tag) => (
                                <View key={tag} className="px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                                    <Text className="text-xs font-medium text-slate-600">{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </TouchableOpacity>
                ))}

                {filteredEntries.length === 0 && (
                    <View className="items-center py-12">
                        <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
                            <Book size={24} color="#94a3b8" />
                        </View>
                        <Text className="text-lg font-medium text-slate-800 mb-2">No journals yet</Text>
                        <Text className="text-slate-500 text-sm">Tap the plus button to create one.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
