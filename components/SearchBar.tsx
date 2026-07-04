import { memo } from "react";
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Search, X } from "lucide-react-native";

import { theme } from "@/constants/theme";

interface SearchBarProps {
    value: string;
    onChangeText: (t: string) => void;
}

function SearchBarImpl({ value, onChangeText }: SearchBarProps) {
    return (
        <View style={styles.container}>
            <Search size={18} color={theme.textMuted} style={styles.icon} />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder="Search area, city or title"
                placeholderTextColor={theme.textSubtle}
                style={styles.input}
                returnKeyType="search"
                autoCorrect={false}
                accessibilityLabel="Search listings"
            />
            {value.length > 0 ? (
                <Pressable
                    hitSlop={12}
                    onPress={() => onChangeText("")}
                    accessibilityRole="button"
                    accessibilityLabel="Clear search"
                    style={({ pressed }) => [
                        styles.clearBtn,
                        pressed && { transform: [{ scale: 0.88 }] },
                    ]}
                >
                    <X size={15} color={theme.textMuted} />
                </Pressable>
            ) : null}
        </View>
    );
}

export const SearchBar = memo(SearchBarImpl);

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.hairline,
        paddingHorizontal: 13,
        height: 50,
        ...Platform.select({
            ios: { shadowColor: theme.shadow, shadowOpacity: 0.6, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
            android: { elevation: 1 },
        }),
    },
    icon: {
        marginRight: 9,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: theme.text,
        padding: 0,
    },
    clearBtn: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.surfaceMuted,
        alignItems: "center",
        justifyContent: "center",
    },
});
