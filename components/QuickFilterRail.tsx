import { memo } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ArrowDownUp, MapPin } from "lucide-react-native";

import { theme } from "@/constants/theme";
import { CITIES, type SortOption, SORT_OPTIONS } from "@/data/listings";

interface QuickFilterRailProps {
    selectedCity: string | null;
    onSelectCity: (city: string | null) => void;
    sort: SortOption;
    onCycleSort: () => void;
}

/**
 * Horizontal pill rail for instant city switching + sort cycling.
 * Mirrors the quick-filter pattern used by Airbnb / Housing / NoBroker
 * so common refinements never require opening the full filter sheet.
 */
function QuickFilterRailImpl({
    selectedCity,
    onSelectCity,
    sort,
    onCycleSort,
}: QuickFilterRailProps) {
    const sortLabel =
        SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

    return (
        <View style={styles.wrap}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* Sort pill — always first, cycles on tap */}
                <Pressable
                    onPress={onCycleSort}
                    style={({ pressed }) => [
                        styles.pill,
                        sort !== "default" ? styles.pillActive : styles.pillIdle,
                        pressed && { transform: [{ scale: 0.96 }] },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Sort: ${sortLabel}. Tap to change.`}
                >
                    <ArrowDownUp
                        size={13}
                        color={sort !== "default" ? "#FFFFFF" : theme.textMuted}
                    />
                    <Text
                        style={[
                            styles.pillText,
                            sort !== "default" ? styles.pillTextActive : null,
                        ]}
                        numberOfLines={1}
                    >
                        {sortLabel}
                    </Text>
                </Pressable>

                <View style={styles.divider} />

                {/* All cities */}
                <Pressable
                    onPress={() => onSelectCity(null)}
                    style={({ pressed }) => [
                        styles.pill,
                        selectedCity === null ? styles.pillActive : styles.pillIdle,
                        pressed && { transform: [{ scale: 0.96 }] },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="All cities"
                    accessibilityState={{ selected: selectedCity === null }}
                >
                    <MapPin
                        size={13}
                        color={selectedCity === null ? "#FFFFFF" : theme.textMuted}
                    />
                    <Text
                        style={[
                            styles.pillText,
                            selectedCity === null ? styles.pillTextActive : null,
                        ]}
                        numberOfLines={1}
                    >
                        All
                    </Text>
                </Pressable>

                {CITIES.map((c) => {
                    const active = selectedCity === c;
                    return (
                        <Pressable
                            key={c}
                            onPress={() => onSelectCity(c)}
                            style={({ pressed }) => [
                                styles.pill,
                                active ? styles.pillActive : styles.pillIdle,
                                pressed && { transform: [{ scale: 0.96 }] },
                            ]}
                            accessibilityRole="button"
                            accessibilityLabel={`Filter city: ${c}`}
                            accessibilityState={{ selected: active }}
                        >
                            <Text
                                style={[
                                    styles.pillText,
                                    active ? styles.pillTextActive : null,
                                ]}
                                numberOfLines={1}
                            >
                                {c}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
}

export const QuickFilterRail = memo(QuickFilterRailImpl);

const styles = StyleSheet.create({
    wrap: {
        backgroundColor: "transparent",
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        gap: 8,
        alignItems: "center",
    },
    pill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        height: 34,
        paddingHorizontal: 14,
        borderRadius: 17,
        borderWidth: 1.5,
    },
    pillIdle: {
        backgroundColor: theme.surface,
        borderColor: theme.hairline,
        ...Platform.select({
            ios: { shadowColor: theme.shadow, shadowOpacity: 0.5, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
            android: { elevation: 1 },
        }),
    },
    pillActive: {
        backgroundColor: theme.accent,
        borderColor: theme.accent,
    },
    pillText: {
        fontSize: 13.5,
        fontWeight: "600",
        color: theme.textMuted,
    },
    pillTextActive: {
        color: "#FFFFFF",
        fontWeight: "700",
    },
    divider: {
        width: 1,
        height: 22,
        backgroundColor: theme.hairline,
        marginHorizontal: 2,
    },
});
