import "../global.css";
import { Stack } from "expo-router";
import { AuthProvider } from "../lib/auth/google";

export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="journal/new" />
                <Stack.Screen name="journal/[id]" />
            </Stack>
        </AuthProvider>
    );
}
