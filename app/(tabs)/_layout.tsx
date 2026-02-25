import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { Home, FileText, Book, ChefHat, Plus, Mic, X } from "lucide-react-native";

export default function TabLayout() {
    const [isFabOpen, setIsFabOpen] = useState(false);
    const router = useRouter();

    const handleAdd = (type: string) => {
        setIsFabOpen(false);
        router.push(`/journal/new?type=${type}`);
    };

    return (
        <View className="flex-1 bg-slate-50">
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: "#ffffff",
                        borderTopWidth: 1,
                        borderTopColor: "#e2e8f0",
                        height: 90,
                        paddingBottom: 25,
                        paddingTop: 12,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        position: "absolute",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.05,
                        shadowRadius: 20,
                        elevation: 10,
                    },
                    tabBarActiveTintColor: "#2563eb",
                    tabBarInactiveTintColor: "#94a3b8",
                    tabBarShowLabel: false,
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        tabBarIcon: ({ color }) => (
                            <View className={`p-2 rounded-full ${color === "#2563eb" ? "bg-blue-50" : ""}`}>
                                <Home size={24} color={color} />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="notes"
                    options={{
                        tabBarIcon: ({ color }) => (
                            <View className={`p-2 rounded-full ${color === "#2563eb" ? "bg-blue-50" : ""}`}>
                                <FileText size={24} color={color} />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="add"
                    options={{
                        tabBarButton: () => (
                            <TouchableOpacity
                                onPress={() => setIsFabOpen(true)}
                                className="bg-blue-600 rounded-full p-4 -mt-6 shadow-lg"
                                style={{
                                    shadowColor: "#2563eb",
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 8,
                                }}
                            >
                                <Plus size={28} color="#ffffff" />
                            </TouchableOpacity>
                        ),
                    }}
                    listeners={{
                        tabPress: (e) => {
                            e.preventDefault();
                            setIsFabOpen(true);
                        },
                    }}
                />
                <Tabs.Screen
                    name="journal"
                    options={{
                        tabBarIcon: ({ color }) => (
                            <View className={`p-2 rounded-full ${color === "#2563eb" ? "bg-blue-50" : ""}`}>
                                <Book size={24} color={color} />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="recipes"
                    options={{
                        tabBarIcon: ({ color }) => (
                            <View className={`p-2 rounded-full ${color === "#2563eb" ? "bg-blue-50" : ""}`}>
                                <ChefHat size={24} color={color} />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        href: null,
                    }}
                />
            </Tabs>

            {/* Cascading FAB Menu */}
            <Modal visible={isFabOpen} transparent animationType="fade">
                <Pressable
                    className="flex-1 bg-black/20 justify-end items-center pb-32"
                    onPress={() => setIsFabOpen(false)}
                >
                    <View className="items-center gap-4 mb-4">
                        <TouchableOpacity
                            onPress={() => handleAdd("recipe")}
                            className="flex-row items-center gap-3 bg-white px-5 py-3 rounded-full shadow-lg"
                        >
                            <Text className="font-medium text-slate-700">Recipe</Text>
                            <View className="p-2 bg-orange-100 rounded-full">
                                <ChefHat size={20} color="#ea580c" />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleAdd("note")}
                            className="flex-row items-center gap-3 bg-white px-5 py-3 rounded-full shadow-lg"
                        >
                            <Text className="font-medium text-slate-700">Text Note</Text>
                            <View className="p-2 bg-blue-100 rounded-full">
                                <FileText size={20} color="#2563eb" />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleAdd("journal")}
                            className="flex-row items-center gap-3 bg-white px-5 py-3 rounded-full shadow-lg"
                        >
                            <Text className="font-medium text-slate-700">Journal</Text>
                            <View className="p-2 bg-purple-100 rounded-full">
                                <Mic size={20} color="#9333ea" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => setIsFabOpen(false)}
                        className="bg-blue-600 rounded-full p-4 shadow-lg"
                        style={{ transform: [{ rotate: "45deg" }] }}
                    >
                        <Plus size={28} color="#ffffff" />
                    </TouchableOpacity>
                </Pressable>
            </Modal>
        </View>
    );
}
