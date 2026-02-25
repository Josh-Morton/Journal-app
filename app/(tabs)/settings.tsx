import React, { useState } from "react";
import { View, Text, ScrollView, Switch, TouchableOpacity, Image } from "react-native";
import { useAuth } from "../../lib/auth/google";
import { Moon, LogOut, Type, ChevronRight, Settings as SettingsIcon, Key, ShieldCheck } from "lucide-react-native";

export default function SettingsScreen() {
    const { user, signIn, signOut } = useAuth();
    const [darkMode, setDarkMode] = useState(false);
    const [biometricLock, setBiometricLock] = useState(false);

    return (
        <View className="flex-1 bg-slate-50">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120, padding: 24 }} showsVerticalScrollIndicator={false}>
                <Text className="text-3xl font-bold text-slate-900 mb-8">Settings</Text>

                {/* User Profile Card */}
                <View className="bg-blue-600 rounded-3xl p-6 mb-8" style={{ shadowColor: "#2563eb", shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}>
                    <View className="flex-row items-center">
                        <View className="mr-5 w-16 h-16 bg-white/20 rounded-full items-center justify-center border-2 border-white/30 overflow-hidden">
                            {user?.picture ? (
                                <Image source={{ uri: user.picture }} className="w-16 h-16" />
                            ) : (
                                <Text className="text-white text-2xl font-bold">{user?.name?.charAt(0) || "G"}</Text>
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className="text-white text-xl font-bold">{user?.name || "Guest User"}</Text>
                            <Text className="text-blue-200 text-sm font-medium">{user?.email || "Not signed in"}</Text>
                        </View>
                    </View>
                </View>

                {/* Privacy & Security */}
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Privacy & Security</Text>
                <View className="bg-white rounded-3xl px-6 py-1 mb-8 border border-slate-100" style={{ shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 }}>
                    <View className="flex-row items-center justify-between py-4 border-b border-slate-100">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-2xl bg-slate-50 items-center justify-center mr-4"><Key size={18} color="#2563eb" /></View>
                            <Text className="text-slate-800 font-semibold">Biometric Lock</Text>
                        </View>
                        <Switch value={biometricLock} onValueChange={setBiometricLock} thumbColor={biometricLock ? "#2563eb" : "#f4f3f4"} trackColor={{ true: "#dbeafe", false: "#e2e8f0" }} />
                    </View>
                    <TouchableOpacity className="flex-row items-center justify-between py-4">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-2xl bg-slate-50 items-center justify-center mr-4"><ShieldCheck size={18} color="#2563eb" /></View>
                            <Text className="text-slate-800 font-semibold">Privacy Policy</Text>
                        </View>
                        <ChevronRight size={18} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                {/* Appearance */}
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Appearance</Text>
                <View className="bg-white rounded-3xl px-6 py-1 mb-8 border border-slate-100" style={{ shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 }}>
                    <View className="flex-row items-center justify-between py-4 border-b border-slate-100">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-2xl bg-slate-50 items-center justify-center mr-4"><Moon size={18} color="#2563eb" /></View>
                            <Text className="text-slate-800 font-semibold">Dark Mode</Text>
                        </View>
                        <Switch value={darkMode} onValueChange={setDarkMode} thumbColor={darkMode ? "#2563eb" : "#f4f3f4"} trackColor={{ true: "#dbeafe", false: "#e2e8f0" }} />
                    </View>
                    <TouchableOpacity className="flex-row items-center justify-between py-4">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-2xl bg-slate-50 items-center justify-center mr-4"><Type size={18} color="#2563eb" /></View>
                            <Text className="text-slate-800 font-semibold">Text Size</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-sm text-slate-400 font-medium mr-2">Medium</Text>
                            <ChevronRight size={18} color="#94a3b8" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Sign In/Out */}
                {user ? (
                    <TouchableOpacity onPress={() => signOut?.()} className="bg-red-50 py-4 rounded-2xl border border-red-100 flex-row items-center justify-center mb-8">
                        <LogOut size={18} color="#ef4444" />
                        <Text className="text-red-500 font-bold ml-2 text-base">Sign Out</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => signIn?.()} className="bg-white py-4 rounded-2xl border border-blue-200 flex-row items-center justify-center mb-8" style={{ shadowColor: "#2563eb", shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 }}>
                        <Image source={{ uri: "https://developers.google.com/identity/images/g-logo.png" }} className="w-5 h-5 mr-3" />
                        <Text className="text-slate-800 font-bold text-base">Sign In with Google</Text>
                    </TouchableOpacity>
                )}

                <View className="items-center mb-12">
                    <Text className="text-slate-400 text-xs uppercase tracking-widest font-medium">Version 1.0.0</Text>
                </View>
            </ScrollView>
        </View>
    );
}
