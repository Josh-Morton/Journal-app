import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function RecipeDetailScreen() {
    const { id } = useLocalSearchParams();

    return (
        <View className="flex-1 bg-white p-4">
            <Text className="text-gray-500">Recipe ID: {id}</Text>
            <Text className="text-2xl font-bold text-gray-900 mt-4">
                Recipe Editor
            </Text>
            <Text className="text-gray-500 mt-2">
                (Editor will be implemented in Phase 3)
            </Text>
        </View>
    );
}
