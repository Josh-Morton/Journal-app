import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { ChevronLeft, Edit3, Share2, Trash2, Calendar, Tag } from "lucide-react-native";
import { Card } from "../../components/ui/Card";
import * as Haptics from 'expo-haptics';

import { useState, useEffect } from "react";
import { database, useJournals } from "../../lib/db";
import { Journal } from "../../models/Journal";

export default function JournalDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [entry, setEntry] = useState<Journal | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEntry = async () => {
            if (!id) return;
            try {
                const journal = await useJournals().find(id);
                setEntry(journal);
            } catch (error) {
                console.error("Error fetching journal entry:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEntry();
    }, [id]);

    const handleDelete = async () => {
        if (!entry) return;
        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await database.write(async () => {
                await entry.markAsDeleted(); // WatermelonDB soft delete pattern
                // Note: Actual deletion usually happens via sync or destroyPermanently
                await entry.destroyPermanently();
            });
            router.push("/");
        } catch (error) {
            console.error("Failed to delete entry:", error);
        }
    };

    if (loading) {
        return (
            <ScreenWrapper bgClass="bg-brand-bg">
                <View className="flex-1 items-center justify-center">
                    <Text className="text-secondary font-body font-bold animate-pulse">Opening your sanctuary...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    if (!entry) {
        return (
            <ScreenWrapper bgClass="bg-brand-bg">
                <View className="flex-1 items-center justify-center p-6">
                    <Text className="text-text-main font-heading font-bold text-2xl text-center mb-4">Entry Not Found</Text>
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
                    <TouchableOpacity className="w-12 h-12 items-center justify-center bg-white rounded-full shadow-sm shadow-primary/10 border border-white/20">
                        <Share2 size={20} color="#8B5CF6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="w-12 h-12 items-center justify-center bg-white rounded-full shadow-sm shadow-primary/10 border border-white/20"
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push(`/journal/new?id=${id}`);
                        }}
                    >
                        <Edit3 size={20} color="#8B5CF6" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                <View className="mb-8">
                    <View className="flex-row items-center mb-4">
                        <Calendar size={14} color="#8B5CF6" />
                        <Text className="text-secondary font-body font-bold text-xs ml-2 uppercase tracking-widest">
                            {entry.date ? new Date(entry.date).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Unknown Date'}
                        </Text>
                    </View>
                    <Text className="text-5xl font-heading font-bold text-text-main leading-tight">
                        {entry.title}
                    </Text>
                </View>

                <Card className="p-8 mb-8 bg-white/90 border-white/40 shadow-blue-50">
                    <Text className="text-xl text-text-main/80 font-body leading-relaxed">
                        {entry.content}
                    </Text>
                </Card>

                {entry.tags && entry.tags.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mb-12">
                        {entry.tags.map((tag) => (
                            <View key={tag} className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20 flex-row items-center">
                                <Tag size={12} color="#8B5CF6" className="mr-2" />
                                <Text className="text-primary font-body font-bold text-xs">{tag}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <TouchableOpacity
                    className="flex-row items-center justify-center py-8 mb-10 border-t border-primary/5"
                    onPress={handleDelete}
                >
                    <Trash2 size={18} color="#ef4444" className="mr-2" />
                    <Text className="text-red-500 font-body font-bold">Delete Entry Permanently</Text>
                </TouchableOpacity>
            </ScrollView>
        </ScreenWrapper>
    );
}


