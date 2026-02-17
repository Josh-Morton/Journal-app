import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { ChevronLeft, Mic, StopCircle, Check, List, Sparkles, Pencil, Type, Tag, Calendar, X, Camera } from "lucide-react-native";
import { Audio } from "expo-av";
import { Card } from "../../components/ui/Card";
import { database, useJournals } from "../../lib/db";
import * as Haptics from 'expo-haptics';

export default function NewJournalScreen() {
    const { mode } = useLocalSearchParams<{ mode: "voice" | "text" | "image" }>();
    const router = useRouter();

    const [currentMode, setCurrentMode] = useState<"voice" | "text" | "image">(mode || "text");
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [transcription, setTranscription] = useState("");
    const [isRecording, setIsRecording] = useState(false);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (mode) setCurrentMode(mode);
    }, [mode]);

    async function startRecording() {
        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);

            // Mock stream
            const mockPhrases = ["I am thinking about the new design...", " It feels very calm and soft.", " Using 32px corners really makes a difference."];
            let i = 0;
            const interval = setInterval(() => {
                if (i < mockPhrases.length) {
                    setTranscription(prev => prev + mockPhrases[i]);
                    setContent(prev => prev + mockPhrases[i]);
                    i++;
                } else { clearInterval(interval); }
            }, 2000);

        } catch (err) { console.error(err); }
    }

    async function stopRecording() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsRecording(false);
        await recording?.stopAndUnloadAsync();
        setRecording(null);
        setCurrentMode("text");
    }

    const [isAIThinking, setIsAIThinking] = useState(false);

    const handleAIAction = async (action: string) => {
        if (!content && action !== "Summary") return;

        setIsAIThinking(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            if (action === "Summary") {
                const summaryTitle = title || "Reflections on a Productive Day";
                setTitle(summaryTitle);
                // AI would normally derive this from content
            } else if (action === "Bullets") {
                const bullets = content
                    .split(/[.!?]/)
                    .filter(s => s.trim().length > 0)
                    .map(s => `• ${s.trim()}`)
                    .join('\n');
                setContent(bullets);
            } else if (action === "Clean up") {
                // Mock cleanup: Capitalize and trim
                const cleaned = content
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .map(line => line.charAt(0).toUpperCase() + line.slice(1))
                    .join('\n\n');
                setContent(cleaned);
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.error("AI action failed:", error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsAIThinking(false);
        }
    };

    const handleSave = async () => {
        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            await database.write(async () => {
                await useJournals().create((entry) => {
                    entry.title = title || "Untitled Entry";
                    entry.content = content;
                    entry.date = new Date();
                    entry.tags = [];
                    entry.synced = false;
                });
            });

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                router.push("/");
            }, 1500);
        } catch (error) {
            console.error("Failed to save journal entry:", error);
        }
    };

    if (showSuccess) {
        return (
            <ScreenWrapper bgClass="bg-accent" className="items-center justify-center">
                <View className="items-center animate-bounce">
                    <View className="w-24 h-24 bg-white rounded-full items-center justify-center shadow-xl shadow-black/10 mb-6">
                        <Check size={48} color="#10B981" />
                    </View>
                    <Text className="text-white text-3xl font-heading font-bold">Entry Saved!</Text>
                    <Text className="text-white/80 font-body mt-2">Moment captured beautifully.</Text>
                </View>
            </ScreenWrapper>
        );
    }

    if (currentMode === "voice") {
        return (
            <ScreenWrapper bgClass="bg-primary" className="px-0">
                <View className="flex-1 justify-between py-10 px-8">
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-12 h-12 items-center justify-center bg-white/20 rounded-full border border-white/10"
                        >
                            <X size={20} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white/80 text-xs font-body font-bold uppercase tracking-widest">Voice Recording</Text>
                        <View className="w-12" />
                    </View>

                    <View className="flex-1 justify-center">
                        <View className="bg-white/10 p-2 rounded-lg self-start mb-6 border border-white/5">
                            <Text className="text-secondary font-body font-bold uppercase tracking-widest text-[10px]">Live Transcription</Text>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="text-4xl text-white font-heading leading-snug">
                                {transcription || "Start speaking..."}
                                {isRecording && <Text className="text-accent">|</Text>}
                            </Text>
                        </ScrollView>
                    </View>

                    <View className="items-center">
                        <Text className="text-white/60 font-mono text-lg mb-10">
                            {isRecording ? "00:12" : "00:00"}
                        </Text>

                        <TouchableOpacity
                            onPress={isRecording ? stopRecording : startRecording}
                            className={`w-28 h-28 rounded-full items-center justify-center ${isRecording ? 'bg-white' : 'bg-accent'} shadow-2xl shadow-black/20 transform active:scale-95 transition-all`}
                        >
                            {isRecording ? (
                                <StopCircle size={40} color="#8B5CF6" />
                            ) : (
                                <Mic size={40} color="white" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setCurrentMode("text")} className="mt-12 bg-white/10 px-6 py-3 rounded-full border border-white/10">
                            <Text className="text-white font-body font-bold text-sm">Switch to Typing</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScreenWrapper>
        );
    }

    if (currentMode === "image") {
        return (
            <ScreenWrapper bgClass="bg-black" className="px-0">
                <View className="flex-1 justify-between py-10 px-8">
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-12 h-12 items-center justify-center bg-white/10 rounded-full border border-white/10"
                        >
                            <X size={20} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white/80 text-xs font-body font-bold uppercase tracking-widest">Capture Moment</Text>
                        <View className="w-12" />
                    </View>

                    <View className="flex-1 items-center justify-center">
                        <View className="w-full aspect-[4/3] bg-white/5 rounded-3xl border border-dashed border-white/20 items-center justify-center border-spacing-4">
                            <Camera size={48} color="white" opacity={0.3} />
                            <Text className="text-white/40 font-body mt-4">Camera Placeholder</Text>
                        </View>
                        <Text className="text-white/60 font-body mt-8 text-center px-10 leading-relaxed text-sm">
                            Focus on a memory that brings you joy today and capture it as a permanent reflection.
                        </Text>
                    </View>

                    <View className="items-center">
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                setCurrentMode("text");
                                setContent("Image Note: [Captured Memory Placeholder]\n\n" + (content || "Reflect on this moment..."));
                            }}
                            className="w-24 h-24 rounded-full bg-white items-center justify-center shadow-2xl shadow-white/10 active:scale-90 transition-transform"
                        >
                            <View className="w-20 h-20 rounded-full border-4 border-black/5 items-center justify-center">
                                <View className="w-16 h-16 rounded-full bg-black/5" />
                            </View>
                        </TouchableOpacity>
                        <Text className="text-white/40 font-body mt-6 text-xs uppercase tracking-widest">Tap to capture</Text>
                    </View>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper bgClass="bg-brand-bg">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
                <View className="flex-row justify-between items-center py-6 px-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 items-center justify-center bg-white rounded-full shadow-sm shadow-primary/10 border border-white/20"
                    >
                        <ChevronLeft size={24} color="#8B5CF6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSave}
                        className="bg-accent px-10 py-4 rounded-full shadow-lg shadow-accent/20 flex-row items-center active:scale-95 transition-all"
                    >
                        <Check size={18} color="white" className="mr-2" />
                        <Text className="text-white font-body font-bold text-base">Save Note</Text>
                    </TouchableOpacity>
                </View>

                <TextInput
                    className="text-5xl font-heading font-bold text-text-main mb-8 px-2"
                    placeholder="Title"
                    value={title}
                    onChangeText={setTitle}
                    placeholderTextColor="#C4B5FD"
                />

                <View className="relative">
                    <Card className="min-h-[400px] mb-8 p-8 bg-white/90 border-white/40 shadow-blue-50">
                        <TextInput
                            className="flex-1 text-xl text-text-main/80 font-body leading-relaxed"
                            placeholder="Start writing your thoughts..."
                            multiline
                            textAlignVertical="top"
                            value={content}
                            onChangeText={setContent}
                            placeholderTextColor="#C4B5FD"
                            editable={!isAIThinking}
                        />
                    </Card>

                    {isAIThinking && (
                        <View className="absolute inset-0 bg-white/60 rounded-[32px] items-center justify-center z-10">
                            <View className="bg-white p-6 rounded-3xl shadow-xl shadow-primary/20 items-center">
                                <Sparkles size={32} color="#8B5CF6" className="animate-spin mb-4" />
                                <Text className="text-text-main font-heading font-bold text-lg">AI is thinking...</Text>
                                <Text className="text-primary/60 font-body text-xs mt-1">Polishing your thoughts</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* AI Assistant Section */}
                <View className="mb-12">
                    <Text className="text-primary/40 text-[10px] font-body font-bold uppercase tracking-widest mb-6 ml-2">Editor Assistant</Text>
                    <View className="flex-row flex-wrap gap-4">
                        <AICardSmall
                            icon={Sparkles}
                            label="Summary"
                            color="bg-primary/10"
                            iconColor="#8B5CF6"
                            onPress={() => handleAIAction("Summary")}
                        />
                        <AICardSmall
                            icon={Pencil}
                            label="Clean up"
                            color="bg-accent/10"
                            iconColor="#10B981"
                            onPress={() => handleAIAction("Clean up")}
                        />
                        <AICardSmall
                            icon={List}
                            label="Bullets"
                            color="bg-secondary/20"
                            iconColor="#8B5CF6"
                            onPress={() => handleAIAction("Bullets")}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Float Toolbar */}
            <View className="absolute bottom-10 left-6 right-6 flex-row justify-between items-center py-5 px-8 bg-white/90 border border-white/20 rounded-full shadow-xl shadow-primary/10">
                <View className="flex-row gap-10">
                    <TouchableOpacity><List size={22} color="#C4B5FD" /></TouchableOpacity>
                    <TouchableOpacity><Tag size={22} color="#C4B5FD" /></TouchableOpacity>
                    <TouchableOpacity><Calendar size={22} color="#C4B5FD" /></TouchableOpacity>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setCurrentMode("voice");
                    }}
                    className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center border border-primary/20"
                >
                    <Mic size={20} color="#8B5CF6" />
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
}

function AICardSmall({ icon: Icon, label, color, iconColor, onPress }: { icon: any, label: string, color: string, iconColor: string, onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className={`${color} rounded-[24px] px-6 py-4 flex-row items-center border border-white/20 shadow-sm shadow-black/5`}
        >
            <Icon size={14} color={iconColor} className="mr-3" />
            <Text className="text-text-main font-body font-bold text-xs">{label}</Text>
        </TouchableOpacity>
    );
}

