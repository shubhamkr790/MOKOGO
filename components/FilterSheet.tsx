import { useEffect, useMemo, useRef, useState } from "react";
import {
    Modal,
    PanResponder,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SlidersHorizontal, X } from "lucide-react-native";

import { theme } from "@/constants/theme";
import {
    CITIES,
    GENDER_OPTIONS,
    MIN_RENT,
    MAX_RENT,
    SORT_OPTIONS,
    type PreferredGender,
    type SortOption,
} from "@/data/listings";

export interface FilterState {
    city: string | null; // null = any
    genders: PreferredGender[]; // empty = any; multi-select
    roomTypes: ("Private" | "Shared")[]; // empty = any; multi-select
    maxRent: number; // inclusive upper bound
    sort: SortOption;
}

export const DEFAULT_FILTERS: FilterState = {
    city: null,
    genders: [],
    roomTypes: [],
    maxRent: MAX_RENT,
    sort: "default",
};

export function countActiveFilters(state: FilterState): number {
    let n = 0;
    if (state.city !== null) n += 1;
    if (state.genders.length > 0) n += 1;
    if (state.roomTypes.length > 0) n += 1;
    if (state.maxRent < MAX_RENT) n += 1;
    if (state.sort !== "default") n += 1;
    return n;
}

interface FilterSheetProps {
    visible: boolean;
    filters: FilterState;
    onClose: () => void;
    onApply: (next: FilterState) => void;
    onReset: () => void;
}

const RENT_STEP = 500;
const TRACK_PADDING = 14; // hit area padding around the bar

export function FilterSheet({
    visible,
    filters,
    onClose,
    onApply,
    onReset,
}: FilterSheetProps) {
    // Local draft so changes only commit on Apply
    const draftRef = useRef<FilterState>(filters);
    // bump to force re-render after draft mutations (ref alone won't trigger)
    const [, bump] = useState(0);
    const rerender = () => bump((n) => n + 1);

    useEffect(() => {
        if (visible) {
            draftRef.current = { ...filters };
            rerender();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, filters]);

    const draft = draftRef.current;

    const update = (patch: Partial<FilterState>) => {
        draftRef.current = { ...draftRef.current, ...patch };
        rerender();
    };

    const toggleGender = (g: PreferredGender) => {
        const set = new Set(draft.genders);
        if (set.has(g)) set.delete(g);
        else set.add(g);
        update({ genders: Array.from(set) });
    };

    const toggleRoomType = (r: "Private" | "Shared") => {
        const set = new Set(draft.roomTypes);
        if (set.has(r)) set.delete(r);
        else set.add(r);
        update({ roomTypes: Array.from(set) });
    };

    const rentLabel = useMemo(() => {
        const v = draft.maxRent;
        if (v >= MAX_RENT) return `Up to ₹${fmt(MAX_RENT)}`;
        return `Up to ₹${fmt(v)}`;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draft.maxRent]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={styles.sheet}>
                    {/* Grabber */}
                    <View style={styles.grabber} />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <SlidersHorizontal size={18} color={theme.text} />
                            <Text style={styles.headerTitle}>Filters</Text>
                        </View>
                        <Pressable
                            hitSlop={12}
                            onPress={onClose}
                            accessibilityRole="button"
                            accessibilityLabel="Close filters"
                            style={({ pressed }) => [
                                styles.closeBtn,
                                pressed && { transform: [{ scale: 0.9 }] },
                            ]}
                        >
                            <X size={20} color={theme.textMuted} />
                        </Pressable>
                    </View>

                    <ScrollView
                        style={styles.scroll}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* City */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>City</Text>
                            <View style={styles.chipRow}>
                                <Chip
                                    label="All cities"
                                    active={draft.city === null}
                                    onPress={() => update({ city: null })}
                                />
                                {CITIES.map((c) => (
                                    <Chip
                                        key={c}
                                        label={c}
                                        active={draft.city === c}
                                        onPress={() => update({ city: c })}
                                    />
                                ))}
                            </View>
                        </View>

                        {/* Max rent — real drag slider */}
                        <View style={styles.section}>
                            <View style={styles.rentHeader}>
                                <Text style={styles.sectionTitle}>Max rent / month</Text>
                                <View style={styles.rentLabelPill}>
                                    <Text style={styles.rentLabel}>{rentLabel}</Text>
                                </View>
                            </View>
                            <RentSlider
                                value={draft.maxRent}
                                onChange={(v) => update({ maxRent: v })}
                            />
                            <View style={styles.rentRangeRow}>
                                <Text style={styles.rentRangeText}>₹{fmt(MIN_RENT)}</Text>
                                <Text style={styles.rentRangeText}>₹{fmt(MAX_RENT)}</Text>
                            </View>
                        </View>

                        {/* Preferred gender (multi) */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Preferred gender</Text>
                            <View style={styles.chipRow}>
                                {GENDER_OPTIONS.map((g) => (
                                    <Chip
                                        key={g}
                                        label={g}
                                        active={draft.genders.includes(g)}
                                        onPress={() => toggleGender(g)}
                                    />
                                ))}
                            </View>
                        </View>

                        {/* Room type (multi) */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Room type</Text>
                            <View style={styles.chipRow}>
                                <Chip
                                    label="Private"
                                    active={draft.roomTypes.includes("Private")}
                                    onPress={() => toggleRoomType("Private")}
                                />
                                <Chip
                                    label="Shared"
                                    active={draft.roomTypes.includes("Shared")}
                                    onPress={() => toggleRoomType("Shared")}
                                />
                            </View>
                        </View>

                        {/* Sort */}
                        <View style={[styles.section, { paddingBottom: 8 }]}>
                            <Text style={styles.sectionTitle}>Sort by</Text>
                            <View style={styles.chipRow}>
                                {SORT_OPTIONS.map((opt) => (
                                    <Chip
                                        key={opt.value}
                                        label={opt.label}
                                        active={draft.sort === opt.value}
                                        onPress={() => update({ sort: opt.value })}
                                    />
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer actions */}
                    <View style={styles.footer}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.resetBtn,
                                pressed && { transform: [{ scale: 0.97 }] },
                            ]}
                            onPress={() => {
                                draftRef.current = { ...DEFAULT_FILTERS };
                                rerender();
                                onReset();
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="Reset filters"
                        >
                            <Text style={styles.resetText}>Reset</Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [
                                styles.applyBtn,
                                pressed && { transform: [{ scale: 0.98 }] },
                            ]}
                            onPress={() => onApply(draftRef.current)}
                            accessibilityRole="button"
                            accessibilityLabel="Apply filters"
                        >
                            <Text style={styles.applyText}>Apply filters</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function fmt(n: number): string {
    return new Intl.NumberFormat("en-IN").format(n);
}

/** A real draggable slider built from a PanResponder — drag the thumb from its
 * current position; tap-to-jump is supported on grant. No native Slider import. */
function RentSlider({
    value,
    onChange,
}: {
    value: number;
    onChange: (v: number) => void;
}) {
    const trackWidthRef = useRef(0);
    const startValueRef = useRef(value);
    const [trackWidth, setTrackWidth] = useState(0);

    const valueToX = (v: number, w: number) => {
        if (w <= 0) return 0;
        const ratio = (v - MIN_RENT) / (MAX_RENT - MIN_RENT);
        return Math.max(0, Math.min(w, ratio * w));
    };

    const xDeltaToValue = (deltaPx: number, w: number) => {
        if (w <= 0) return startValueRef.current;
        const valueSpan = MAX_RENT - MIN_RENT;
        const deltaValue = (deltaPx / w) * valueSpan;
        const raw = startValueRef.current + deltaValue;
        const stepped = Math.round(raw / RENT_STEP) * RENT_STEP;
        return Math.max(MIN_RENT, Math.min(MAX_RENT, stepped));
    };

    const jumpToX = (x: number, w: number) => {
        if (w <= 0) return value;
        const ratio = Math.max(0, Math.min(1, x / w));
        const raw = MIN_RENT + ratio * (MAX_RENT - MIN_RENT);
        const stepped = Math.round(raw / RENT_STEP) * RENT_STEP;
        return Math.max(MIN_RENT, Math.min(MAX_RENT, stepped));
    };

    const pan = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                // Record the value at gesture start so move deltas are relative to it.
                startValueRef.current = value;
                // Tap-to-jump: move the thumb to the tapped position on the track.
                const w = trackWidthRef.current;
                const localX = Math.max(
                    0,
                    Math.min(w, evt.nativeEvent.locationX - TRACK_PADDING),
                );
                const next = jumpToX(localX, w);
                if (next !== value) onChange(next);
            },
            onPanResponderMove: (_evt, gestureState) => {
                const w = trackWidthRef.current;
                onChange(xDeltaToValue(gestureState.dx, w));
            },
        }),
    ).current;

    const thumbX = valueToX(value, trackWidth);

    return (
        <View
            style={styles.sliderWrap}
            onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                trackWidthRef.current = w;
                setTrackWidth(w);
            }}
            {...pan.panHandlers}
        >
            {/* Track */}
            <View style={styles.track} />
            {/* Filled portion */}
            <View
                style={[
                    styles.trackFill,
                    { width: Math.max(0, thumbX) },
                ]}
            />
            {/* Thumb */}
            <View
                style={[
                    styles.thumb,
                    { transform: [{ translateX: thumbX - TRACK_PADDING }] },
                ]}
            />
        </View>
    );
}

function Chip({
    label,
    active,
    onPress,
}: {
    label: string;
    active: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.chip,
                active ? styles.chipActive : null,
                pressed && { transform: [{ scale: 0.95 }] },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
        >
            <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(20, 16, 14, 0.5)",
    },
    sheet: {
        backgroundColor: theme.bg,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: "90%",
        paddingBottom: 28,
        shadowColor: theme.shadowStrong,
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 1,
        shadowRadius: 28,
        elevation: 16,
    },
    grabber: {
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: theme.hairlineStrong,
        alignSelf: "center",
        marginTop: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: theme.hairline,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: theme.text,
    },
    closeBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: theme.surfaceMuted,
        alignItems: "center",
        justifyContent: "center",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    section: {
        marginBottom: 26,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: theme.text,
        marginBottom: 12,
        letterSpacing: 0.1,
    },
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        paddingHorizontal: 15,
        paddingVertical: 9,
        borderRadius: 22,
        backgroundColor: theme.surface,
        borderWidth: 1.5,
        borderColor: theme.hairline,
    },
    chipActive: {
        backgroundColor: theme.accent,
        borderColor: theme.accent,
    },
    chipText: {
        fontSize: 13.5,
        fontWeight: "600",
        color: theme.textMuted,
    },
    chipTextActive: {
        color: "#FFFFFF",
    },
    rentHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 18,
    },
    rentLabelPill: {
        backgroundColor: theme.accentSoft,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
    },
    rentLabel: {
        fontSize: 13,
        fontWeight: "800",
        color: theme.accentDeep,
    },
    sliderWrap: {
        height: 44,
        justifyContent: "center",
        paddingHorizontal: TRACK_PADDING,
    },
    track: {
        position: "absolute",
        left: TRACK_PADDING,
        right: TRACK_PADDING,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.hairlineStrong,
    },
    trackFill: {
        position: "absolute",
        left: TRACK_PADDING,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.accent,
    },
    thumb: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.surface,
        borderWidth: 3,
        borderColor: theme.accent,
        position: "absolute",
        left: TRACK_PADDING,
        ...Platform.select({
            ios: {
                shadowColor: theme.shadowStrong,
                shadowOpacity: 0.6,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 },
            },
            android: { elevation: 4 },
        }),
    },
    rentRangeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    rentRangeText: {
        fontSize: 11.5,
        color: theme.textSubtle,
        fontWeight: "600",
    },
    footer: {
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: theme.hairline,
    },
    resetBtn: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        backgroundColor: theme.surface,
        borderWidth: 1.5,
        borderColor: theme.hairline,
        alignItems: "center",
        justifyContent: "center",
    },
    resetText: {
        fontSize: 15,
        fontWeight: "700",
        color: theme.textMuted,
    },
    applyBtn: {
        flex: 2,
        height: 52,
        borderRadius: 16,
        backgroundColor: theme.accent,
        alignItems: "center",
        justifyContent: "center",
    },
    applyText: {
        fontSize: 15,
        fontWeight: "800",
        color: "#FFFFFF",
    },
});
