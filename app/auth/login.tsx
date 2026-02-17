import { View, Text, TouchableOpacity, Image } from "react-native";
import { useAuth } from "../../lib/auth/google";
import { Redirect } from "expo-router";

export default function LoginScreen() {
    const { user, isLoading, signIn } = useAuth();

    // If already logged in, redirect to main app
    if (user) {
        return <Redirect href="/(tabs)" />;
    }

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text className="text-gray-500">Loading...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 items-center justify-center bg-background px-8">
            {/* App Logo/Title */}
            <View className="mb-12 items-center">
                <Text className="text-6xl font-heading font-bold text-text-main">Journal</Text>
                <Text className="text-lg text-primary/60 font-body mt-4 text-center">
                    Your private space for thoughts, notes, and memories
                </Text>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
                onPress={signIn}
                className="flex-row items-center bg-white border border-gray-300 rounded-lg px-6 py-4 shadow-sm"
            >
                <Image
                    source={{
                        uri: "https://developers.google.com/identity/images/g-logo.png",
                    }}
                    className="w-6 h-6 mr-4"
                />
                <Text className="text-gray-700 text-lg font-medium">
                    Continue with Google
                </Text>
            </TouchableOpacity>

            {/* Privacy Note */}
            <Text className="text-gray-400 text-sm mt-8 text-center px-4">
                Your data stays on your device and your Google Drive. We never see your
                content.
            </Text>
        </View>
    );
}
