import { View, TextInput, TextInputProps } from "react-native";
import { Search } from "lucide-react-native";

interface SearchBarProps extends TextInputProps {
    className?: string;
}

export function SearchBar({ className = "", ...props }: SearchBarProps) {
    return (
        <View className={`flex-row items-center bg-white/80 border border-primary/20 rounded-full px-5 py-4 shadow-sm shadow-primary/5 ${className}`}>
            <Search size={18} color="#8B5CF6" />
            <TextInput
                className="flex-1 ml-4 text-base text-text-main font-body"
                placeholderTextColor="#C4B5FD"
                {...props}
            />
            {props.value ? (
                <View onPointerDown={() => props.onChangeText?.("")}>
                    <Search size={18} color="#C4B5FD" style={{ transform: [{ rotate: '45deg' }] }} />
                </View>
            ) : (
                <View>
                    <Search size={18} color="#8B5CF6" />
                </View>
            )}
        </View>
    );
}
