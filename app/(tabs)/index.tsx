import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Home, Mic, Camera, ChevronRight, Sparkles, Pencil, List, Heading } from "lucide-react-native";
import { useAuth } from "../../lib/auth/google";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { SearchBar } from "../../components/ui/SearchBar";
import { Card } from "../../components/ui/Card";
import { useState, useEffect } from "react";
import { database, useJournals } from "../../lib/db";
import { Journal } from "../../models/Journal";
import { Q } from "@nozbe/watermelondb";

export default function HomeScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [recentEntries, setRecentEntries] = useState<Journal[]>([]);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const data = await useJournals()
                    .query(Q.sortBy('created_at', Q.desc), Q.take(3))
                    .fetch();
                setRecentEntries(data);
            } catch (error) {
                console.error("Error fetching journals:", error);
            }
        };
        fetchRecent();
    }, []);

    const formatDate = (date: Date) => {
        if (!date) return "Just now";
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return "Just now";
        if (hours < 24) return `${hours} hours ago`;
        return date.toLocaleDateString();
    };

    return (
        <ScreenWrapper className="px-0">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header - Minimal & Calm */}
                <View className="flex-row justify-between items-center mb-8 mt-4">
                    <View>
                        <Text className="text-primary/60 text-xs font-heading font-semibold uppercase tracking-widest mb-1">Morning Reflection</Text>
                        <Text className="text-4xl font-heading font-bold text-text-main">
                            Hello, {user?.name?.split(" ")[0] || "there"}
                        </Text>
                    </View>
                    <View className="w-12 h-12 bg-white/80 rounded-full items-center justify-center shadow-sm shadow-primary/10 border border-white/20">
                        {user?.picture ? (
                            <Image source={{ uri: user.picture }} className="w-12 h-12 rounded-full" />
                        ) : (
                            <Home size={24} color="#8B5CF6" />
                        )}
                    </View>
                </View>

                {/* Search - Soft & Inset */}
                <SearchBar placeholder="Search your thoughts..." className="mb-8 bg-white border-0" />

                {/* Note Types - Soft Horizontal/Standard Cards */}
                <Text className="text-xs font-body font-bold text-primary/40 uppercase tracking-widest mb-4 ml-1">New Entry</Text>

                {/* Voice Note - Primary Action (Soft Blue Tint) */}
                <Card
                    className="bg-primary/10 border-primary/20 flex-row items-center p-6"
                    onPress={() => {
                        import('expo-haptics').then(Haptics => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
                        router.push("/journal/new?mode=voice");
                    }}
                >
                    <View className="w-14 h-14 bg-white/80 rounded-2xl items-center justify-center mr-5 shadow-sm shadow-primary/20 border border-white/20">
                        <Mic size={24} color="#8B5CF6" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-text-main text-xl font-heading font-bold">Voice Note</Text>
                        <Text className="text-primary/60 text-sm font-body mt-1">Capture your thoughts instantly</Text>
                    </View>
                    <ChevronRight size={20} color="#C4B5FD" />
                </Card>

                {/* Other Types - Soft White Cards */}
                <View className="flex-row gap-4 mb-8">
                    <Card
                        className="flex-1 p-5 items-start justify-between h-40"
                        onPress={() => router.push("/journal/new?mode=text")}
                    >
                        <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center">
                            <Heading size={18} color="#8B5CF6" />
                        </View>
                        <View>
                            <Text className="text-text-main font-heading font-bold text-lg">Text Note</Text>
                            <Text className="text-primary/40 text-xs font-body mt-1">Write it down</Text>
                        </View>
                    </Card>

                    <Card
                        className="flex-1 p-5 items-start justify-between h-40"
                        onPress={() => router.push("/journal/new?mode=image")}
                    >
                        <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center">
                            <Camera size={18} color="#8B5CF6" />
                        </View>
                        <View>
                            <Text className="text-text-main font-heading font-bold text-lg">Image Note</Text>
                            <Text className="text-primary/40 text-xs font-body mt-1">Save a memory</Text>
                        </View>
                    </Card>
                </View>

                {/* AI Assist Section - Clearly Separated Grid */}
                <View className="mb-8">
                    <Text className="text-xs font-body font-bold text-primary/40 uppercase tracking-widest mb-4 ml-1">AI Assistant</Text>
                    <View className="flex-row flex-wrap gap-3">
                        <AICard icon={Sparkles} label="Summarise" color="bg-primary/10" iconColor="#8B5CF6" />
                        <AICard icon={Pencil} label="Rewrite" color="bg-accent/10" iconColor="#10B981" />
                        <AICard icon={List} label="Bullet points" color="bg-secondary/20" iconColor="#C4B5FD" />
                        <AICard icon={Heading} label="Auto Title" color="bg-primary/5" iconColor="#8B5CF6" />
                    </View>
                </View>

                {/* Recent Section */}
                <View className="flex-row justify-between items-end mb-4 ml-1">
                    <Text className="text-xs font-body font-bold text-primary/40 uppercase tracking-widest">Recent Notes</Text>
                    <TouchableOpacity onPress={() => router.push("/notes")}><Text className="text-accent text-xs font-bold font-body">View All</Text></TouchableOpacity>
                </View>

                {recentEntries.length > 0 ? (
                    recentEntries.map((entry) => (
                        <Card key={entry.id} className="mb-4" onPress={() => router.push(`/journal/${entry.id}`)}>
                            <Text className="text-primary/40 text-[10px] font-body font-bold uppercase mb-2">
                                {formatDate(entry.createdAt)} • {entry.tags?.join(", ") || "General"}
                            </Text>
                            <Text className="text-text-main text-lg font-heading font-bold mb-1">{entry.title}</Text>
                            <Text className="text-text-main/70 text-sm font-body leading-6" numberOfLines={2}>
                                {entry.content}
                            </Text>
                        </Card>
                    ))
                ) : (
                    <Card className="items-center py-10 opacity-60">
                        <Sparkles size={24} color="#8B5CF6" className="mb-2" />
                        <Text className="text-text-main font-body text-sm">No entries yet. Start capturing!</Text>
                    </Card>
                )}


            </ScrollView>

            {/* Floating Pill Tab Bar Placeholder logic is in _layout.tsx, 
          but we ensure padding handles it */}
        </ScreenWrapper>
    );
}

function AICard({ icon: Icon, label, color, iconColor }: { icon: any, label: string, color: string, iconColor: string }) {
    const handlePress = () => {
        import('expo-haptics').then(Haptics => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePress}
            className={`${color} rounded-[24px] p-4 flex-1 min-w-[150px] flex-row items-center border border-white/20 shadow-sm shadow-primary/5`}
        >
            <View className="w-8 h-8 bg-white/80 rounded-lg items-center justify-center mr-3">
                <Icon size={14} color={iconColor} />
            </View>
            <Text className="text-text-main font-body font-bold text-sm">{label}</Text>
        </TouchableOpacity>
    );
}
