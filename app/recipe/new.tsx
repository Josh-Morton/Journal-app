import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Card } from "../../components/ui/Card";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function NewRecipeScreen() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [currentIngredient, setCurrentIngredient] = useState("");
    const [instructions, setInstructions] = useState("");

    const addIngredient = () => {
        if (currentIngredient.trim()) {
            setIngredients([...ingredients, currentIngredient.trim()]);
            setCurrentIngredient("");
        }
    };

    return (
        <ScreenWrapper className="bg-slate-50">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header */}
                <View className="flex-row justify-between items-center py-6 mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm shadow-slate-200">
                        <FontAwesome name="times" size={20} color="#64748b" />
                    </TouchableOpacity>
                    <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">New Recipe</Text>
                    <TouchableOpacity
                        onPress={() => router.push("/")}
                        className="bg-blue-500 px-6 py-2.5 rounded-full shadow-lg shadow-blue-100"
                    >
                        <Text className="text-white font-bold text-sm">Save</Text>
                    </TouchableOpacity>
                </View>

                {/* Title Input */}
                <TextInput
                    className="text-4xl font-medium text-slate-900 mb-8 px-2"
                    placeholder="Recipe Name"
                    value={title}
                    onChangeText={setTitle}
                    placeholderTextColor="#cbd5e1"
                />

                {/* Voice Parser Helper - Soft Alert Style */}
                <Card className="bg-orange-50 border-orange-100/50 flex-row items-center mb-8">
                    <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-4">
                        <FontAwesome name="microphone" size={16} color="#f97316" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-orange-900 font-medium text-sm">Dictate Ingredients</Text>
                        <Text className="text-orange-700/60 text-xs mt-0.5">I'll automatically parse them for you.</Text>
                    </View>
                    <FontAwesome name="magic" size={16} color="#f97316" className="ml-2" />
                </Card>

                {/* Ingredients Section */}
                <View className="mb-8">
                    <Text className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mb-4 ml-2">Ingredients</Text>
                    <Card className="p-2 flex-row items-center bg-white">
                        <TextInput
                            className="flex-1 px-4 py-2 text-slate-700"
                            placeholder="Add ingredient..."
                            value={currentIngredient}
                            onChangeText={setCurrentIngredient}
                            onSubmitEditing={addIngredient}
                            placeholderTextColor="#94a3b8"
                        />
                        <TouchableOpacity
                            onPress={addIngredient}
                            className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center mr-1"
                        >
                            <FontAwesome name="plus" size={14} color="#64748b" />
                        </TouchableOpacity>
                    </Card>

                    <View className="flex-row flex-wrap gap-2 mt-4 ml-2">
                        {ingredients.map((item, index) => (
                            <View key={index} className="bg-slate-100 px-4 py-2 rounded-full flex-row items-center">
                                <Text className="text-slate-700 text-xs mr-2">{item}</Text>
                                <TouchableOpacity onPress={() => setIngredients(ingredients.filter((_, i) => i !== index))}>
                                    <FontAwesome name="times" size={10} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Instructions Section */}
                <View className="mb-8">
                    <Text className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mb-4 ml-2">Instructions</Text>
                    <Card className="min-h-[200px]">
                        <TextInput
                            className="flex-1 text-lg text-slate-700 leading-relaxed font-light"
                            placeholder="How do you make it?"
                            multiline
                            textAlignVertical="top"
                            value={instructions}
                            onChangeText={setInstructions}
                            placeholderTextColor="#94a3b8"
                        />
                    </Card>
                </View>

                {/* Metadata Section */}
                <View className="flex-row gap-4">
                    <Card className="flex-1 items-center py-6 bg-blue-50/30 border-blue-50">
                        <FontAwesome name="clock-o" size={18} color="#3b82f6" className="mb-2" />
                        <Text className="text-slate-900 font-medium">Prep Time</Text>
                        <Text className="text-slate-400 text-xs mt-1">15 mins</Text>
                    </Card>
                    <Card className="flex-1 items-center py-6 bg-green-50/30 border-green-50">
                        <FontAwesome name="fire" size={18} color="#22c55e" className="mb-2" />
                        <Text className="text-slate-900 font-medium">Difficulty</Text>
                        <Text className="text-slate-400 text-xs mt-1">Easy</Text>
                    </Card>
                </View>

            </ScrollView>
        </ScreenWrapper>
    );
}
