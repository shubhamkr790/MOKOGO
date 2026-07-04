import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { BlurView } from "expo-blur";
import { Heart, Home, Search as SearchIcon, SlidersHorizontal } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { ListingCard } from "@/components/ListingCard";
import { ListingCardSkeleton } from "@/components/ListingCardSkeleton";
import { SearchBar } from "@/components/SearchBar";
import { QuickFilterRail } from "@/components/QuickFilterRail";
import {
    FilterSheet,
    DEFAULT_FILTERS,
    countActiveFilters,
    type FilterState,
} from "@/components/FilterSheet";
import { theme } from "@/constants/theme";
import { LISTINGS, type Listing, type SortOption } from "@/data/listings";

// Simulated fetch latency (ms) for the loading skeleton state.
const FETCH_DELAY_MS = 900;

const SORT_CYCLE: SortOption[] = ["default", "rent-asc", "rent-desc"];

function lightImpact() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
}
function mediumImpact() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
}

export default function ListingsScreen() {
    const [query, setQuery] = useState("");
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
    const [filterSheetOpen, setFilterSheetOpen] = useState(false);

    // Loading + pull-to-refresh state
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Saved listing ids (in-memory; would be persistent in a real app)
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

    // Simulate an async fetch of listings (no backend in this task).
    const runFakeFetch = useCallback((delay: number) => {
        return new Promise<void>((resolve) => {
            setTimeout(() => resolve(), delay);
        });
    }, []);

    // Initial load — runs once on mount.
    useEffect(() => {
        let active = true;
        runFakeFetch(FETCH_DELAY_MS).then(() => {
            if (active) setIsLoading(false);
        });
        return () => {
            active = false;
        };
    }, [runFakeFetch]);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await runFakeFetch(FETCH_DELAY_MS);
        setIsRefreshing(false);
    }, [runFakeFetch]);

    const toggleSave = useCallback((id: string) => {
        lightImpact();
        setSavedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    // Quick-filter rail: instant city + sort cycle.
    const onSelectCity = useCallback((city: string | null) => {
        lightImpact();
        setFilters((prev) => ({ ...prev, city }));
    }, []);

    const onCycleSort = useCallback(() => {
        lightImpact();
        setFilters((prev) => {
            const idx = SORT_CYCLE.indexOf(prev.sort);
            const next = SORT_CYCLE[(idx + 1) % SORT_CYCLE.length];
            return { ...prev, sort: next };
        });
    }, []);

    // Filter + search + sort pipeline.
    const visibleListings = useMemo<Listing[]>(() => {
        const q = query.trim().toLowerCase();
        let result = LISTINGS.filter((l) => {
            // City
            if (filters.city !== null && l.city !== filters.city) return false;
            // Preferred gender (multi; empty = any)
            if (
                filters.genders.length > 0 &&
                !filters.genders.includes(l.preferredGender)
            ) {
                return false;
            }
            // Room type (multi; empty = any)
            if (
                filters.roomTypes.length > 0 &&
                !filters.roomTypes.includes(l.roomType)
            ) {
                return false;
            }
            // Max rent (inclusive)
            if (l.rent > filters.maxRent) return false;
            // Search query on title or locality
            if (q.length > 0) {
                const hay = `${l.title} ${l.locality} ${l.city}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });

        if (filters.sort === "rent-asc") {
            result = [...result].sort((a, b) => a.rent - b.rent);
        } else if (filters.sort === "rent-desc") {
            result = [...result].sort((a, b) => b.rent - a.rent);
        }
        return result;
    }, [query, filters]);

    const activeFilterCount = countActiveFilters(filters);

    const hasAnyFilter = query.trim().length > 0 || activeFilterCount > 0;

    const clearAll = useCallback(() => {
        lightImpact();
        setQuery("");
        setFilters(DEFAULT_FILTERS);
    }, []);

    const openFilters = useCallback(() => {
        mediumImpact();
        setFilterSheetOpen(true);
    }, []);

    const renderItem = useCallback(
        ({ item, index }: { item: Listing; index: number }) => (
            <ListingCard
                listing={item}
                index={index}
                isSaved={savedIds.has(item.id)}
                onToggleSave={toggleSave}
            />
        ),
        [savedIds, toggleSave],
    );

    const ListHeader = useMemo(
        () => (
            <View style={styles.listHeader}>
                {/* Results count line */}
                <View style={styles.resultLine}>
                    <Text style={styles.resultText}>
                        {isLoading
                            ? "Finding rooms…"
                            : visibleListings.length === 0
                                ? "No matches"
                                : `${visibleListings.length} room${visibleListings.length === 1 ? "" : "s"
                                } available`}
                    </Text>
                    {hasAnyFilter && !isLoading ? (
                        <Pressable
                            onPress={clearAll}
                            hitSlop={8}
                            accessibilityRole="button"
                            accessibilityLabel="Clear all filters"
                            style={({ pressed }) => [
                                styles.clearAllBtn,
                                pressed && { opacity: 0.6 },
                            ]}
                        >
                            <Text style={styles.clearAllText}>Clear all</Text>
                        </Pressable>
                    ) : null}
                </View>
            </View>
        ),
        [isLoading, visibleListings.length, hasAnyFilter, clearAll],
    );

    return (
        <View style={styles.screen}>
            {/* Sticky blur header */}
            <View style={styles.headerWrap}>
                <BlurView
                    intensity={90}
                    tint="light"
                    style={StyleSheet.absoluteFill}
                />
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={styles.brandRow}>
                            <View style={styles.brandIcon}>
                                <Home size={17} color="#FFFFFF" />
                            </View>
                            <View>
                                <Text style={styles.brandTitle}>MOKOGO</Text>
                                <Text style={styles.brandSubtitle}>Find your flatmate room</Text>
                            </View>
                        </View>
                        <View style={styles.savedBadge}>
                            <Heart size={13} color={theme.accent} fill={theme.accent} />
                            <Text style={styles.savedBadgeText}>{savedIds.size}</Text>
                        </View>
                    </View>

                    {/* Controls */}
                    <View style={styles.controlsRow}>
                        <View style={{ flex: 1 }}>
                            <SearchBar value={query} onChangeText={setQuery} />
                        </View>
                        <Pressable
                            onPress={openFilters}
                            style={({ pressed }) => [
                                styles.filterBtn,
                                pressed && { transform: [{ scale: 0.94 }] },
                            ]}
                            accessibilityRole="button"
                            accessibilityLabel="Open filters"
                        >
                            <SlidersHorizontal size={18} color="#FFFFFF" />
                            {activeFilterCount > 0 ? (
                                <View style={styles.filterBadge}>
                                    <Text style={styles.filterBadgeText}>
                                        {activeFilterCount}
                                    </Text>
                                </View>
                            ) : null}
                        </Pressable>
                    </View>
                </View>

                {/* Quick filter rail — sticky under header */}
                <QuickFilterRail
                    selectedCity={filters.city}
                    onSelectCity={onSelectCity}
                    sort={filters.sort}
                    onCycleSort={onCycleSort}
                />
            </View>

            {/* List / states */}
            {isLoading ? (
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {Array.from({ length: 4 }).map((_, i) => (
                        <ListingCardSkeleton key={i} />
                    ))}
                </ScrollView>
            ) : (
                <FlatList
                    data={visibleListings}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={ListHeader}
                    ListEmptyComponent={<EmptyState onClear={clearAll} />}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            colors={[theme.accent]}
                            tintColor={theme.accent}
                            title="Refreshing rooms…"
                            titleColor={theme.textMuted}
                        />
                    }
                />
            )}

            <FilterSheet
                visible={filterSheetOpen}
                filters={filters}
                onClose={() => setFilterSheetOpen(false)}
                onApply={(next) => {
                    setFilters(next);
                    setFilterSheetOpen(false);
                }}
                onReset={() => {
                    setFilters(DEFAULT_FILTERS);
                }}
            />
        </View>
    );
}

function EmptyState({ onClear }: { onClear: () => void }) {
    return (
        <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
                <SearchIcon size={30} color={theme.textSubtle} />
            </View>
            <Text style={styles.emptyTitle}>No rooms match your filters</Text>
            <Text style={styles.emptySubtitle}>
                Try widening your rent range, switching city, or clearing filters.
            </Text>
            <Pressable
                onPress={onClear}
                style={({ pressed }) => [
                    styles.emptyBtn,
                    pressed && { transform: [{ scale: 0.97 }] },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Clear all filters"
            >
                <Text style={styles.emptyBtnText}>Clear all filters</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.bg,
    },
    flex: { flex: 1 },
    headerWrap: {
        backgroundColor: Platform.select({
            ios: "rgba(244, 239, 232, 0.72)",
            android: theme.bg,
        }),
        borderBottomWidth: Platform.select({
            ios: 1,
            android: 0,
        }),
        borderBottomColor: theme.hairline,
        ...Platform.select({
            ios: {
                shadowColor: theme.shadow,
                shadowOpacity: 0.5,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 3 },
            },
            android: { elevation: 3 },
        }),
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 52,
        paddingBottom: 12,
    },
    headerTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    brandIcon: {
        width: 36,
        height: 36,
        borderRadius: 11,
        backgroundColor: theme.accent,
        alignItems: "center",
        justifyContent: "center",
        ...Platform.select({
            ios: {
                shadowColor: theme.accent,
                shadowOpacity: 0.45,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
            },
            android: { elevation: 3 },
        }),
    },
    brandTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: theme.text,
        letterSpacing: 1.2,
    },
    brandSubtitle: {
        fontSize: 11.5,
        color: theme.textMuted,
        marginTop: 1,
        fontWeight: "500",
    },
    savedBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: theme.accentSoft,
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: 15,
    },
    savedBadgeText: {
        fontSize: 12.5,
        fontWeight: "800",
        color: theme.accentDeep,
    },
    controlsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    filterBtn: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: theme.accent,
        alignItems: "center",
        justifyContent: "center",
        ...Platform.select({
            ios: {
                shadowColor: theme.accent,
                shadowOpacity: 0.4,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
            },
            android: { elevation: 4 },
        }),
    },
    filterBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        minWidth: 20,
        height: 20,
        paddingHorizontal: 5,
        borderRadius: 10,
        backgroundColor: theme.text,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: theme.surface,
    },
    filterBadgeText: {
        fontSize: 11,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    listHeader: {
        marginBottom: 4,
    },
    resultLine: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 6,
        paddingBottom: 8,
    },
    resultText: {
        fontSize: 13.5,
        fontWeight: "700",
        color: theme.textMuted,
    },
    clearAllBtn: {
        paddingHorizontal: 4,
    },
    clearAllText: {
        fontSize: 13.5,
        fontWeight: "700",
        color: theme.accent,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 32,
    },
    emptyState: {
        alignItems: "center",
        paddingHorizontal: 32,
        paddingTop: 72,
        paddingBottom: 40,
    },
    emptyIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: theme.surfaceMuted,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: theme.text,
        textAlign: "center",
    },
    emptySubtitle: {
        fontSize: 14,
        color: theme.textMuted,
        textAlign: "center",
        marginTop: 8,
        lineHeight: 20,
    },
    emptyBtn: {
        marginTop: 22,
        backgroundColor: theme.accent,
        paddingHorizontal: 24,
        paddingVertical: 13,
        borderRadius: 15,
        ...Platform.select({
            ios: {
                shadowColor: theme.accent,
                shadowOpacity: 0.4,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 5 },
            },
            android: { elevation: 4 },
        }),
    },
    emptyBtnText: {
        fontSize: 14,
        fontWeight: "800",
        color: "#FFFFFF",
    },
});
