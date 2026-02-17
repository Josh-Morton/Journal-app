import { View, Text, ScrollView, Switch, TouchableOpacity, Image } from "react-native";
import { useAuth } from "../../lib/auth/google";
import {
    CloudIcon,
    ShieldCheck,
    Moon,
    LogOut,
    Type,
    ChevronRight,
    Edit3,
    Settings as SettingsIcon,
    Box,
    Key,
    ExternalLink,
    RefreshCcw,
    FileText
} from "lucide-react-native";
import { useState } from "react";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Card } from "../../components/ui/Card";
import * as Haptics from 'expo-haptics';

function SettingRow({
    Icon,
    label,
    value,
    onPress,
    showChevron = true,
    rightElement,
    color = "#8B5CF6"
}: {
    Icon: any;
    label: string;
    value?: string;
    onPress?: () => void;
    showChevron?: boolean;
    rightElement?: React.ReactNode;
    color?: string;
}) {
    return (
        <TouchableOpacity
            className="flex-row items-center justify-between py-5 border-b border-primary/5 last:border-0"
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-primary/5 items-center justify-center mr-4 border border-primary/10">
                    <Icon size={18} color={color} />
                </View>
                <Text className="text-text-main font-body font-bold text-base">{label}</Text>
            </View>

            <View className="flex-row items-center">
                {value && <Text className="text-secondary font-body font-bold text-sm mr-3">{value}</Text>}
                {rightElement}
                {showChevron && !rightElement && (
                    <ChevronRight size={18} color="#C4B5FD" />
                )}
            </View>
        </TouchableOpacity>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <View className="mb-8">
            <Text className="text-primary/40 font-body font-bold text-[10px] uppercase tracking-widest mb-4 ml-1">{title}</Text>
            <Card className="px-6 py-0 bg-white/80 border-white/40 shadow-sm shadow-primary/5">
                {children}
            </Card>
        </View>
    );
}

export default function SettingsScreen() {
    const { user, signOut } = useAuth();
    const [darkMode, setDarkMode] = useState(false);
    const [biometricLock, setBiometricLock] = useState(false);

    const handleHapticPress = (action?: () => void) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        action?.();
    };

    return (
        <ScreenWrapper bgClass="bg-brand-bg">
            <View className="px-4 py-8">
                <Text className="text-4xl font-heading font-bold text-text-main">Settings</Text>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
                {/* User Profile Card */}
                <Card
                    className="mb-8 p-6 bg-primary border-primary/20 shadow-xl shadow-primary/20"
                    onPress={() => handleHapticPress()}
                >
                    <View className="flex-row items-center">
                        <View className="mr-5 w-16 h-16 bg-white/20 rounded-full items-center justify-center border-2 border-white/30 overflow-hidden">
                            {user?.picture ? (
                                <Image
                                    source={{ uri: user.picture }}
                                    className="w-16 h-16"
                                />
                            ) : (
                                <Text className="text-white text-2xl font-heading font-bold">
                                    {user?.name?.charAt(0) || "G"}
                                </Text>
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className="text-white text-xl font-heading font-bold">
                                {user?.name || "Guest User"}
                            </Text>
                            <Text className="text-secondary font-body text-sm font-bold opacity-80">{user?.email || "Not signed in"}</Text>
                        </View>
                        <Edit3 size={20} color="white" />
                    </View>
                </Card>

                {/* Sync Settings */}
                <Section title="Data & Sync">
                    <SettingRow
                        Icon={Box}
                        label="Google Drive Folder"
                        value="JournalApp"
                        onPress={() => handleHapticPress()}
                    />
                    <SettingRow
                        Icon={RefreshCcw}
                        label="Last Synced"
                        value="Just now"
                        onPress={() => handleHapticPress()}
                    />
                    <SettingRow
                        Icon={ExternalLink}
                        label="Export All Data"
                        onPress={() => handleHapticPress()}
                    />
                </Section>

                {/* Privacy & Security */}
                <Section title="Privacy & Security">
                    <SettingRow
                        Icon={Key}
                        label="Biometric Lock"
                        rightElement={
                            <Switch
                                value={biometricLock}
                                onValueChange={(v) => {
                                    setBiometricLock(v);
                                    Haptics.selectionAsync();
                                }}
                                thumbColor={biometricLock ? "#10B981" : "#f4f3f4"}
                                trackColor={{ true: "#8B5CF6", false: "#C4B5FD" }}
                            />
                        }
                    />
                    <SettingRow
                        Icon={ShieldCheck}
                        label="Privacy Policy"
                        onPress={() => handleHapticPress()}
                    />
                </Section>

                {/* Appearance */}
                <Section title="Appearance">
                    <SettingRow
                        Icon={Moon}
                        label="Dark Mode"
                        rightElement={
                            <Switch
                                value={darkMode}
                                onValueChange={(v) => {
                                    setDarkMode(v);
                                    Haptics.selectionAsync();
                                }}
                                thumbColor={darkMode ? "#10B981" : "#f4f3f4"}
                                trackColor={{ true: "#8B5CF6", false: "#C4B5FD" }}
                            />
                        }
                    />
                    <SettingRow
                        Icon={Type}
                        label="Text Size"
                        value="Medium"
                        onPress={() => handleHapticPress()}
                    />
                </Section>

                {/* Sign Out Button */}
                <TouchableOpacity
                    className="mt-4 mb-10 bg-red-50 py-5 rounded-2xl border border-red-100 items-center flex-row justify-center shadow-sm shadow-red-100/50"
                    onPress={() => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        signOut?.();
                    }}
                >
                    <LogOut size={18} color="#ef4444" />
                    <Text className="text-red-500 font-body font-bold ml-2 text-base">Sign Out</Text>
                </TouchableOpacity>

                <View className="items-center mb-12">
                    <Text className="text-secondary font-body font-bold text-[10px] uppercase tracking-widest opacity-40">
                        Version 1.0.0 • Build 2026.02.08
                    </Text>
                    <View className="flex-row mt-4">
                        <FileText size={12} color="#C4B5FD" />
                        <Text className="text-secondary font-body text-[10px] ml-2 font-bold opacity-40 uppercase tracking-tighter">Open Source Licenses</Text>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

