import "../global.css";
import { Stack } from "expo-router";
import { AuthProvider } from "../lib/auth/google";

export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="auth/login" />
                <Stack.Screen name="journal/[id]" />
                <Stack.Screen name="journal/new" />
                <Stack.Screen name="recipe/[id]" />
                <Stack.Screen name="recipe/new" />
                <Stack.Screen name="note/[id]" />
                <Stack.Screen name="note/new" />
            </Stack>
        </AuthProvider>
    );
}
