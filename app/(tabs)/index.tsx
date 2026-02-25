import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from "react-native";
import { useRouter } from "expo-router";
import { Search, Settings, Bell, ChevronLeft, ChevronRight, Mic } from "lucide-react-native";
import { useStore } from "../../lib/store";
import { Entry } from "../../lib/types";
import { useAuth } from "../../lib/auth/google";
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    format,
    isSameDay,
    addMonths,
    subMonths,
} from "date-fns";
import { Cloud } from "lucide-react-native";
import { Alert } from "react-native";
import { syncEntriesToDrive, SyncProgressStatus } from "../../lib/drive";
import { DriveSyncModal } from "../../components/ui/DriveSyncModal";

function getEntryBgColor(type: string) {
    switch (type) {
        case "note": return "bg-blue-50";
        case "journal": return "bg-purple-50";
        case "recipe": return "bg-orange-50";
        default: return "bg-slate-50";
    }
}

function getEntryTextColor(type: string) {
    switch (type) {
        case "note": return "text-blue-700";
        case "journal": return "text-purple-700";
        case "recipe": return "text-orange-700";
        default: return "text-slate-700";
    }
}

function getDotColor(type: string) {
    switch (type) {
        case "note": return "bg-blue-500";
        case "journal": return "bg-purple-500";
        case "recipe": return "bg-orange-500";
        default: return "bg-slate-300";
    }
}

export default function HomeScreen() {
    const { entries } = useStore();
    const { user, accessToken, signIn } = useAuth();
    const router = useRouter();
    const [baseDate, setBaseDate] = useState(() => startOfMonth(new Date()));

    const [syncVisible, setSyncVisible] = useState(false);
    const [syncStatus, setSyncStatus] = useState<SyncProgressStatus | null>(null);
    const [syncFolderId, setSyncFolderId] = useState<string | undefined>();

    const handlePrevMonth = () => setBaseDate((prev) => subMonths(prev, 1));
    const handleNextMonth = () => setBaseDate((prev) => addMonths(prev, 1));

    const handleSync = async () => {
        if (!accessToken) {
            Alert.alert("Authentication Required", "Please sign in with Google to sync to Drive.", [
                { text: "Cancel", style: "cancel" },
                { text: "Sign In", onPress: () => signIn() }
            ]);
            return;
        }

        try {
            setSyncVisible(true);
            setSyncStatus("Checking Drive...");
            const folderId = await syncEntriesToDrive(entries, accessToken, setSyncStatus);
            setSyncFolderId(folderId);
        } catch (error) {
            console.error(error);
            setSyncStatus("Error");
        }
    };

    const renderMonth = (date: Date) => {
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
        const dayHeaders = ["S", "M", "T", "W", "T", "F", "S"];

        return (
            <View className="bg-white p-4 rounded-3xl flex-1 min-w-[280px]" style={{ shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 }}>
                <Text className="text-center font-medium mb-4 text-slate-800">{format(date, "MMMM yyyy")}</Text>
                <View className="flex-row flex-wrap">
                    {dayHeaders.map((day, i) => (
                        <View key={`h-${i}`} style={{ width: "14.28%" }} className="items-center mb-2">
                            <Text className="text-xs font-medium text-slate-400">{day}</Text>
                        </View>
                    ))}
                    {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                        <View key={`e-${i}`} style={{ width: "14.28%", aspectRatio: 1 }} />
                    ))}
                    {daysInMonth.map((d, i) => {
                        const dayEntries = entries.filter((e) => isSameDay(new Date(e.createdAt), d));
                        const isToday = isSameDay(d, new Date());
                        return (
                            <View key={i} style={{ width: "14.28%", aspectRatio: 1 }} className="items-center justify-start pt-1">
                                <View className={`w-6 h-6 rounded-full items-center justify-center ${isToday ? "bg-blue-50" : ""}`}>
                                    <Text className={`text-xs ${isToday ? "font-bold text-blue-600" : "text-slate-600"}`}>
                                        {format(d, "d")}
                                    </Text>
                                </View>
                                <View className="flex-row gap-0.5 mt-0.5">
                                    {dayEntries.slice(0, 3).map((e, j) => (
                                        <View key={j} className={`w-1.5 h-1.5 rounded-full ${getDotColor(e.type)}`} />
                                    ))}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120, padding: 24 }} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="flex-row items-center justify-between mb-8">
                    <View className="flex-row items-center gap-4">
                        <View className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                            {user?.picture ? (
                                <Image source={{ uri: user.picture }} className="w-12 h-12" />
                            ) : (
                                <View className="w-12 h-12 bg-slate-200 items-center justify-center">
                                    <Text className="text-slate-500 font-semibold text-lg">
                                        {user?.name?.charAt(0) || "U"}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View>
                            <Text className="font-semibold text-lg text-slate-900">
                                {user?.name || "Guest User"}
                            </Text>
                            <Text className="text-sm text-slate-500">Welcome back</Text>
                        </View>
                    </View>
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            className="p-2 bg-white rounded-full flex-row items-center justify-center gap-1 px-3"
                            style={{ shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
                            onPress={handleSync}
                        >
                            <Cloud size={20} color="#3b82f6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="p-2 bg-white rounded-full"
                            style={{ shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
                            onPress={() => router.push("/(tabs)/settings")}
                        >
                            <Settings size={20} color="#475569" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="p-2 bg-white rounded-full"
                            style={{ shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
                        >
                            <Bell size={20} color="#475569" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Drive Sync Modal Indicator */}
                <DriveSyncModal
                    visible={syncVisible}
                    status={syncStatus}
                    folderId={syncFolderId}
                    onClose={() => setSyncVisible(false)}
                />

                {/* Activity Calendar */}
                <View className="mb-8">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-semibold text-slate-900">Activity</Text>
                        <View className="flex-row gap-2">
                            <TouchableOpacity onPress={handlePrevMonth} className="p-1.5 rounded-full bg-white" style={{ shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
                                <ChevronLeft size={20} color="#475569" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleNextMonth} className="p-1.5 rounded-full bg-white" style={{ shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
                                <ChevronRight size={20} color="#475569" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row gap-4">
                            {renderMonth(baseDate)}
                            {renderMonth(addMonths(baseDate, 1))}
                        </View>
                    </ScrollView>
                </View>

                {/* Recent Notes */}
                <View>
                    <Text className="text-lg font-semibold text-slate-900 mb-4">Recent Notes</Text>

                    {/* Search */}
                    <View className="relative mb-6">
                        <View className="absolute left-4 top-4 z-10">
                            <Search size={20} color="#94a3b8" />
                        </View>
                        <TextInput
                            placeholder="Search notes, tags..."
                            className="bg-white rounded-2xl py-4 pl-12 pr-12 text-slate-800"
                            placeholderTextColor="#94a3b8"
                            style={{ shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 }}
                        />
                        <View className="absolute right-4 top-4">
                            <Mic size={20} color="#94a3b8" />
                        </View>
                    </View>

                    {/* Entry cards */}
                    {entries.slice(0, 5).map((entry) => (
                        <TouchableOpacity
                            key={entry.id}
                            onPress={() => router.push(`/journal/${entry.id}`)}
                            className={`${getEntryBgColor(entry.type)} p-5 rounded-3xl mb-4 border border-slate-100`}
                            activeOpacity={0.7}
                        >
                            <View className="flex-row justify-between items-start mb-2">
                                <Text className={`font-semibold text-lg ${getEntryTextColor(entry.type)}`}>
                                    {entry.title || "Untitled"}
                                </Text>
                                <Text className="text-xs text-slate-400 ml-4">
                                    {new Date(entry.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                            <Text className="text-sm text-slate-600 mb-4" numberOfLines={2}>
                                {entry.content || (entry.type === "recipe" ? "Recipe details..." : "No content")}
                            </Text>
                            <View className="flex-row gap-2 flex-wrap">
                                <View className="px-3 py-1 bg-white/60 rounded-full">
                                    <Text className="text-xs font-medium capitalize">{entry.type}</Text>
                                </View>
                                {entry.tags.map((tag) => (
                                    <View key={tag} className="px-3 py-1 bg-white/60 rounded-full">
                                        <Text className="text-xs font-medium">{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </TouchableOpacity>
                    ))}
                    {entries.length === 0 && (
                        <Text className="text-slate-500 text-center py-8">No entries yet. Create one above!</Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
