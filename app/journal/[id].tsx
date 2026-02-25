import React, { useState, useRef } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Save, Tag, Trash2, Plus, X, Square, Mic, MicOff } from "lucide-react-native";
import { useStore } from "../../lib/store";
import { Entry } from "../../lib/types";
import { useSpeechRecognition } from "../../lib/speech";
import { cleanTranscript } from "../../lib/textCleanup";
import { processRecipeTranscription, isGeminiAvailable } from "../../lib/gemini";
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";

export default function EditEntryScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { entries, updateEntry, deleteEntry, allTags } = useStore();
    const existingEntry = entries.find((e) => e.id === id);
    const speech = useSpeechRecognition();
    const richText = useRef<RichEditor>(null);

    const [entry, setEntry] = useState<Entry>(
        existingEntry || {
            id: id || "",
            type: "note",
            title: "",
            content: "",
            tags: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }
    );

    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const [newTagInput, setNewTagInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    if (!existingEntry) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <Text className="text-slate-500">Entry not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 px-4 py-2 bg-blue-600 rounded-full">
                    <Text className="text-white font-medium">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleSave = () => {
        updateEntry(entry.id, entry);
        router.back();
    };

    const handleDelete = () => {
        Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => { deleteEntry(entry.id); router.back(); } },
        ]);
    };

    const handleMicToggle = async () => {
        if (speech.isListening) {
            const rawTranscript = speech.stopListening();
            const cleaned = cleanTranscript(rawTranscript.trim(), entry.type);
            if (!cleaned) return;

            if (entry.type === "recipe" && isGeminiAvailable()) {
                setIsProcessing(true);
                try {
                    const recipeData = await processRecipeTranscription(cleaned, entry.recipeData);
                    setEntry(prev => ({
                        ...prev,
                        recipeData,
                        originalTranscript: prev.originalTranscript ? prev.originalTranscript + "\n\n" + rawTranscript.trim() : rawTranscript.trim(),
                        content: prev.content ? prev.content + "<br><br>" + cleaned : cleaned,
                    }));
                } catch (err) {
                    console.error(err);
                    setEntry(prev => ({
                        ...prev,
                        originalTranscript: prev.originalTranscript ? prev.originalTranscript + "\n\n" + rawTranscript.trim() : rawTranscript.trim(),
                        content: prev.content ? prev.content + "<br><br><i>" + cleaned + "</i>" : "<i>" + cleaned + "</i>",
                    }));
                } finally {
                    setIsProcessing(false);
                }
            } else {
                if (richText.current) {
                    richText.current.insertText(cleaned + " ");
                    // We must still save the original transcript to state
                    setEntry(prev => ({
                        ...prev,
                        originalTranscript: prev.originalTranscript ? prev.originalTranscript + "\n\n" + rawTranscript.trim() : rawTranscript.trim(),
                    }));
                } else {
                    setEntry(prev => ({
                        ...prev,
                        originalTranscript: prev.originalTranscript ? prev.originalTranscript + "\n\n" + rawTranscript.trim() : rawTranscript.trim(),
                        content: prev.content ? prev.content + "<br>" + cleaned : cleaned,
                    }));
                }
            }
            speech.resetTranscript();
        } else {
            speech.startListening();
        }
    };

    const addTag = (tag: string) => {
        if (tag.trim() && !entry.tags.includes(tag.trim())) {
            setEntry((prev) => ({ ...prev, tags: [...prev.tags, tag.trim()] }));
        }
        setShowTagDropdown(false);
        setNewTagInput("");
    };

    const removeTag = (tag: string) => {
        setEntry((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
    };

    const updateRecipeList = (list: "ingredients" | "steps", index: number, value: string) => {
        setEntry((prev) => {
            const data = prev.recipeData || { ingredients: [], steps: [] };
            const newList = [...data[list]];
            newList[index] = value;
            return { ...prev, recipeData: { ...data, [list]: newList } };
        });
    };

    const addRecipeItem = (list: "ingredients" | "steps") => {
        setEntry((prev) => {
            const data = prev.recipeData || { ingredients: [], steps: [] };
            return { ...prev, recipeData: { ...data, [list]: [...data[list], ""] } };
        });
    };

    const removeRecipeItem = (list: "ingredients" | "steps", index: number) => {
        setEntry((prev) => {
            const data = prev.recipeData || { ingredients: [], steps: [] };
            const newList = [...data[list]];
            newList.splice(index, 1);
            return { ...prev, recipeData: { ...data, [list]: newList } };
        });
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View className="flex-1 bg-slate-50">
                {/* Header */}
                <View className="flex-row items-center justify-between p-6 bg-white z-10" style={{ shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 }}>
                    <TouchableOpacity onPress={() => router.back()} className="p-3 bg-slate-50 rounded-full">
                        <ArrowLeft size={20} color="#475569" />
                    </TouchableOpacity>
                    <Text className="font-semibold text-lg capitalize text-slate-900">Edit {entry.type}</Text>
                    <View className="flex-row gap-2">
                        <TouchableOpacity onPress={handleSave} className="p-3 bg-blue-50 rounded-full">
                            <Save size={20} color="#2563eb" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDelete} className="p-3 bg-red-50 rounded-full">
                            <Trash2 size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Rich Toolbar at the TOP for Notes/Journals (Native Only) */}
                {(entry.type === "note" || entry.type === "journal") && Platform.OS !== 'web' && (
                    <View className="border-b border-slate-200 bg-white" style={{ zIndex: 10 }}>
                        <RichToolbar
                            editor={richText}
                            actions={[
                                actions.heading1,
                                actions.setBold,
                                actions.setItalic,
                                actions.insertBulletsList,
                                actions.checkboxList,
                                actions.keyboard
                            ]}
                            iconTint="#475569"
                            selectedIconTint="#2563eb"
                            style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#f1f5f9' }}
                        />
                    </View>
                )}

                <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
                    <TextInput placeholder="Title..." value={entry.title} onChangeText={(text) => setEntry({ ...entry, title: text })} className="text-2xl font-semibold text-slate-900 mb-6" placeholderTextColor="#cbd5e1" />

                    {entry.tags.length > 0 && (
                        <View className="flex-row flex-wrap gap-2 mb-6">
                            {entry.tags.map((tag) => (
                                <View key={tag} className="flex-row items-center gap-1 px-3 py-1 bg-blue-50 rounded-full">
                                    <Text className="text-sm font-medium text-blue-700">{tag}</Text>
                                    <TouchableOpacity onPress={() => removeTag(tag)}><X size={14} color="#1d4ed8" /></TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Live Transcript Preview (Visually Distinct & Temporary) */}
                    {(speech.isListening) && (
                        <View className="bg-blue-50 p-4 rounded-2xl mb-4 border border-blue-100">
                            <View className="flex-row items-center gap-2 mb-2">
                                <View className="w-2 h-2 rounded-full bg-red-500" />
                                <Text className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                                    Listening...
                                </Text>
                            </View>
                            <Text className="text-sm text-slate-700 leading-relaxed italic">{speech.fullTranscript || "Speak now..."}</Text>
                        </View>
                    )}

                    {isProcessing && (
                        <View className="bg-purple-50 p-4 rounded-2xl mb-4 border border-purple-100 flex-row items-center gap-3">
                            <ActivityIndicator size="small" color="#9333ea" />
                            <Text className="text-sm font-medium text-purple-700">Extracting recipe with Gemini AI...</Text>
                        </View>
                    )}

                    {(entry.type === "note" || entry.type === "journal") && (
                        <View className="bg-white rounded-3xl overflow-hidden mb-6" style={{ shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 8, elevation: 2, minHeight: 300 }}>
                            {Platform.OS === 'web' ? (
                                <TextInput
                                    placeholder="Write your thoughts... (Rich Editor available on App)"
                                    value={entry.content}
                                    onChangeText={(text) => setEntry({ ...entry, content: text })}
                                    multiline
                                    className="bg-white p-6 rounded-3xl text-slate-700 leading-relaxed flex-1"
                                    placeholderTextColor="#94a3b8"
                                    textAlignVertical="top"
                                />
                            ) : (
                                <RichEditor
                                    ref={richText}
                                    initialContentHTML={entry.content}
                                    onChange={(html) => setEntry({ ...entry, content: html })}
                                    placeholder="Write your thoughts..."
                                    editorStyle={{ backgroundColor: '#ffffff', color: '#334155' }}
                                    useContainer={false}
                                    initialHeight={300}
                                    style={{ flex: 1, padding: 10 }}
                                />
                            )}
                        </View>
                    )}

                    {entry.type === "recipe" && (
                        <View className="gap-6">
                            <View className="bg-white p-6 rounded-3xl" style={{ shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 }}>
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="font-semibold text-lg text-slate-900">Ingredients</Text>
                                    <TouchableOpacity onPress={() => addRecipeItem("ingredients")} className="p-2 border border-blue-100 rounded-full"><Plus size={20} color="#2563eb" /></TouchableOpacity>
                                </View>
                                {entry.recipeData?.ingredients.map((ing, i) => (
                                    <View key={i} className="flex-row items-center gap-2 mb-3">
                                        <Square size={20} color="#cbd5e1" />
                                        <TextInput value={ing} onChangeText={(v) => updateRecipeList("ingredients", i, v)} className="flex-1 border-b border-slate-100 py-1 text-slate-700" placeholder="Ingredient..." placeholderTextColor="#94a3b8" />
                                        <TouchableOpacity onPress={() => removeRecipeItem("ingredients", i)} className="p-1"><Trash2 size={16} color="#f87171" /></TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                            <View className="bg-white p-6 rounded-3xl" style={{ shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 }}>
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="font-semibold text-lg text-slate-900">Steps</Text>
                                    <TouchableOpacity onPress={() => addRecipeItem("steps")} className="p-2 border border-blue-100 rounded-full"><Plus size={20} color="#2563eb" /></TouchableOpacity>
                                </View>
                                {entry.recipeData?.steps.map((step, i) => (
                                    <View key={i} className="flex-row items-start gap-3 mb-3">
                                        <View className="bg-slate-100 w-6 h-6 rounded-full items-center justify-center mt-1"><Text className="text-xs font-medium text-slate-500">{i + 1}</Text></View>
                                        <TextInput value={step} onChangeText={(v) => updateRecipeList("steps", i, v)} multiline className="flex-1 border-b border-slate-100 py-1 text-slate-700" placeholder="Step description..." placeholderTextColor="#94a3b8" />
                                        <TouchableOpacity onPress={() => removeRecipeItem("steps", i)} className="p-1 mt-1"><Trash2 size={16} color="#f87171" /></TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    <View className="mt-6">
                        <TouchableOpacity onPress={() => setShowTagDropdown(!showTagDropdown)} className="flex-row items-center gap-2 px-4 py-2 bg-white rounded-full self-start" style={{ shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 }}>
                            <Tag size={16} color="#f87171" />
                            <Text className="text-sm font-medium text-slate-600">Add Tag</Text>
                        </TouchableOpacity>
                        {showTagDropdown && (
                            <View className="mt-2 bg-white rounded-2xl p-3 border border-slate-100" style={{ shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 }}>
                                {allTags.filter((t) => !entry.tags.includes(t)).map((tag) => (
                                    <TouchableOpacity key={tag} onPress={() => addTag(tag)} className="px-3 py-2 rounded-xl"><Text className="text-sm text-slate-700">{tag}</Text></TouchableOpacity>
                                ))}
                                <View className="flex-row gap-2 mt-2 pt-2 border-t border-slate-100">
                                    <TextInput value={newTagInput} onChangeText={setNewTagInput} placeholder="New tag..." className="flex-1 bg-slate-50 rounded-lg px-2 py-1.5 text-sm" placeholderTextColor="#94a3b8" onSubmitEditing={() => addTag(newTagInput)} />
                                    <TouchableOpacity onPress={() => addTag(newTagInput)} className="p-1.5 bg-blue-50 rounded-lg"><Plus size={16} color="#2563eb" /></TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Floating Mic Button */}
                {speech.isSupported && (
                    <View className="absolute bottom-8 left-0 right-0 items-center z-50" style={{ pointerEvents: 'box-none' }}>
                        <TouchableOpacity
                            onPress={handleMicToggle}
                            disabled={isProcessing}
                            className={`rounded-full p-5 ${speech.isListening ? "bg-red-500" : "bg-blue-600"}`}
                            style={{
                                shadowColor: speech.isListening ? "#ef4444" : "#2563eb",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.35,
                                shadowRadius: 10,
                                elevation: 10,
                            }}
                        >
                            {isProcessing ? (
                                <ActivityIndicator size={24} color="#ffffff" />
                            ) : speech.isListening ? (
                                <MicOff size={24} color="#ffffff" />
                            ) : (
                                <Mic size={24} color="#ffffff" />
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}
