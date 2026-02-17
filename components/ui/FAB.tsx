import { TouchableOpacity, TouchableOpacityProps, View } from "react-native";
import { Plus } from "lucide-react-native";
import * as Haptics from 'expo-haptics';

interface FABProps extends TouchableOpacityProps {
    className?: string;
    size?: number;
}


export function FloatingActionButton({
    className = "",
    size = 24,
    onPress,
    ...props
}: FABProps) {
    const handlePress = (e: any) => {
        Haptics.selectionAsync();
        onPress?.(e);
    };

    return (
        <TouchableOpacity
            className={`absolute bottom-10 right-10 w-16 h-16 bg-accent rounded-full items-center justify-center shadow-lg shadow-accent/20 active:scale-95 transition-transform ${className}`}
            activeOpacity={0.8}
            onPress={handlePress}
            {...props}
        >
            <Plus size={size} color="white" />
        </TouchableOpacity>
    );
}
