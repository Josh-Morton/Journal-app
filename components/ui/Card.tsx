import { View, ViewProps, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface CardProps extends ViewProps {
    className?: string;
    onPress?: () => void;
    variant?: "elevated" | "flat" | "outlined";
    color?: string; // Optional background color override
}

export function Card({
    children,
    className = "",
    onPress,
    variant = "elevated",
    color,
    style,
    ...props
}: CardProps) {
    // Spec: Corner radius is large and consistent (24px - 32px)
    // Spec: Generous padding everywhere
    const baseStyle = "rounded-[32px] p-6 mb-4";

    const variants = {
        // Design System: Glassmorphism look
        elevated: "bg-white/80 border border-white/20 shadow-sm shadow-primary/10",
        flat: "bg-secondary/20",
        outlined: "bg-transparent border border-primary/20",
    };

    const combinedClassName = `${baseStyle} ${variants[variant]} ${className}`;

    // Fix: Avoid spreading potentially non-object types
    const baseCustomStyle = Array.isArray(style) ? Object.assign({}, ...style) : (style || {});
    const customStyle = color ? { ...baseCustomStyle, backgroundColor: color } : style;

    if (onPress) {
        return (
            <TouchableOpacity
                className={`${combinedClassName} cursor-pointer`}
                onPress={onPress}
                style={customStyle as any}
                activeOpacity={0.8}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return (
        <View
            className={combinedClassName}
            style={customStyle}
        >
            {children}
        </View>
    );
}
