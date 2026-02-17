import { Home, BookOpen, Plus, User } from "lucide-react-native";
import { Tabs } from "expo-router";
import { View, Platform, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: "absolute",
                    bottom: 30,
                    left: 30,
                    right: 30,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: Platform.OS === "ios" ? "transparent" : "rgba(255, 255, 255, 0.95)",
                    borderTopWidth: 0,
                    elevation: 10,
                    shadowColor: "#8B5CF6",
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.1,
                    shadowRadius: 20,
                    paddingBottom: 0, // Ensure icons are centered
                },
                tabBarBackground: () => (
                    Platform.OS === "ios" ? (
                        <BlurView intensity={80} style={[StyleSheet.absoluteFill, { borderRadius: 40, overflow: 'hidden' }]} tint="light" />
                    ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: "white", borderRadius: 40 }]} />
                    )
                ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon Icon={Home} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="notes"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon Icon={BookOpen} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="entry"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View className="w-16 h-16 bg-accent rounded-full items-center justify-center -mt-10 shadow-lg shadow-accent/40 border-4 border-white">
                            <Plus size={28} color="white" />
                        </View>
                    ),
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('journal/new');
                    },
                })}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon Icon={User} focused={focused} />
                    ),
                }}
            />
        </Tabs>
    );
}

function TabIcon({ Icon, focused }: { Icon: any, focused: boolean }) {
    return (
        <View className={`items-center justify-center w-14 h-14 rounded-full ${focused ? "bg-primary/10" : "bg-transparent"}`}>
            <Icon size={24} color={focused ? "#8B5CF6" : "#C4B5FD"} strokeWidth={focused ? 2.5 : 2} />
        </View>
    );
}

