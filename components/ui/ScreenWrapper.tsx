import { View, Text, ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenWrapperProps extends ViewProps {
    children: React.ReactNode;
    className?: string;
    bgClass?: string; // New prop for outer background override
}

export function ScreenWrapper({
    children,
    className = "",
    bgClass = "bg-brand-bg", // Design System: soft lavender background
    ...props
}: ScreenWrapperProps) {
    return (
        <SafeAreaView className={`flex-1 ${bgClass} items-center`} edges={['top']}>
            <View className={`flex-1 max-w-[800px] w-full mx-auto ${className}`} {...props}>
                {children}
            </View>
        </SafeAreaView>
    );
}
