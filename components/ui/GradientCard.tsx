import { View, Text, ViewProps, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface GradientCardProps extends TouchableOpacityProps {
    colors: string[];
    className?: string;
    children: React.ReactNode;
}

export function GradientCard({
    colors,
    className = "",
    children,
    style,
    ...props
}: GradientCardProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            className={`rounded-3xl overflow-hidden shadow-lg ${className}`}
            style={[
                { shadowColor: colors[0], shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12 },
                style
            ]}
            {...props}
        >
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, padding: 20 }}
            >
                {children}
            </LinearGradient>
        </TouchableOpacity>
    );
}
