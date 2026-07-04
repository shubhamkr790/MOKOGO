import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
    BedDouble,
    CalendarClock,
    Heart,
    MapPin,
    Sofa,
    Users,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { heroGradientFor, theme } from "@/constants/theme";
import type { Listing } from "@/data/listings";
import { formatAvailableDate, daysUntilAvailable } from "@/lib/format";

interface ListingCardProps {
    listing: Listing;
    index: number;
    isSaved: boolean;
    onToggleSave: (id: string) => void;
}

function genderPillColors(gender: Listing["preferredGender"]) {
    switch (gender) {
        case "Male":
            return { bg: theme.maleSoft, fg: theme.private };
        case "Female":
            return { bg: theme.femaleSoft, fg: theme.accentDeep };
        default:
            return { bg: theme.anySoft, fg: theme.textMuted };
    }
}

function ListingCardImpl({
    listing,
    index,
    isSaved,
    onToggleSave,
}: ListingCardProps) {
    const gradient = useMemo(() => heroGradientFor(listing.id), [listing.id]);
    const [c1, c2, c3] = gradient;

    const roomColors =
        listing.roomType === "Shared"
            ? { bg: theme.sharedSoft, fg: theme.shared }
            : { bg: theme.privateSoft, fg: theme.private };

    const genderColors = genderPillColors(listing.preferredGender);
    const isFurnished = listing.furnished;
    const available = formatAvailableDate(listing.availableFrom);
    const daysLeft = daysUntilAvailable(listing.availableFrom);
    const isReadyNow = daysLeft === 0;

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                { marginTop: index === 0 ? 4 : 0 },
                pressed && { transform: [{ scale: 0.985 }], opacity: 0.97 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${listing.title}, ${listing.locality} ${listing.city}, ${formatRentLabel(listing.rent)} per month`}
        >
            {/* Hero — gradient stand-in for a listing photo */}
            <View style={styles.hero}>
                <LinearGradient
                    colors={[c1, c2, c3]}
                    start={{ x: 0.1, y: 0 }}
                    end={{ x: 0.9, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
                {/* Soft top sheen for depth */}
                <LinearGradient
                    colors={["rgba(255,255,255,0.28)", "rgba(255,255,255,0)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 0.6 }}
                    style={StyleSheet.absoluteFill}
                />

                {/* Rent chip — glassy, bottom-left */}
                <View style={styles.rentChip}>
                    <Text style={styles.rentValue}>
                        {`₹${new Intl.NumberFormat("en-IN").format(listing.rent)}`}
                    </Text>
                    <Text style={styles.rentUnit}>/mo</Text>
                </View>

                {/* Availability chip — glassy, top-left */}
                {available.length > 0 ? (
                    <View
                        style={[styles.availChip, isReadyNow && styles.availChipReady]}
                    >
                        <CalendarClock
                            size={12}
                            color={isReadyNow ? theme.furnished : "#FFFFFF"}
                        />
                        <Text
                            style={[
                                styles.availText,
                                isReadyNow && styles.availTextReady,
                            ]}
                        >
                            {isReadyNow ? "Available now" : `Avail ${available}`}
                        </Text>
                    </View>
                ) : null}

                {/* Save button — glassy circle, top-right */}
                <Pressable
                    hitSlop={12}
                    onPress={() => onToggleSave(listing.id)}
                    accessibilityRole="button"
                    accessibilityLabel={
                        isSaved ? "Remove from saved" : "Save listing"
                    }
                    style={({ pressed }) => [
                        styles.saveBtn,
                        isSaved && styles.saveBtnActive,
                        pressed && { transform: [{ scale: 0.9 }] },
                    ]}
                >
                    <Heart
                        size={19}
                        color={isSaved ? theme.accent : "#FFFFFF"}
                        fill={isSaved ? theme.accent : "transparent"}
                    />
                </Pressable>
            </View>

            {/* Body */}
            <View style={styles.body}>
                <Text style={styles.title} numberOfLines={2}>
                    {listing.title}
                </Text>

                <View style={styles.locationRow}>
                    <MapPin size={13} color={theme.textMuted} />
                    <Text style={styles.location} numberOfLines={1}>
                        {listing.locality}
                        <Text style={styles.locationDot}> · </Text>
                        {listing.city}
                    </Text>
                </View>

                {/* Tag row */}
                <View style={styles.tagRow}>
                    <View style={[styles.tag, { backgroundColor: roomColors.bg }]}>
                        <BedDouble size={12} color={roomColors.fg} />
                        <Text style={[styles.tagText, { color: roomColors.fg }]}>
                            {listing.roomType}
                        </Text>
                    </View>

                    <View style={[styles.tag, { backgroundColor: genderColors.bg }]}>
                        <Users size={12} color={genderColors.fg} />
                        <Text style={[styles.tagText, { color: genderColors.fg }]}>
                            {listing.preferredGender === "Any"
                                ? "Any gender"
                                : listing.preferredGender}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.tag,
                            {
                                backgroundColor: isFurnished
                                    ? theme.furnishedSoft
                                    : theme.unfurnishedSoft,
                            },
                        ]}
                    >
                        <Sofa
                            size={12}
                            color={isFurnished ? theme.furnished : theme.unfurnished}
                        />
                        <Text
                            style={[
                                styles.tagText,
                                {
                                    color: isFurnished ? theme.furnished : theme.unfurnished,
                                },
                            ]}
                        >
                            {isFurnished ? "Furnished" : "Unfurnished"}
                        </Text>
                    </View>
                </View>
            </View>
        </Pressable>
    );
}

function formatRentLabel(rent: number): string {
    return `₹${new Intl.NumberFormat("en-IN").format(rent)}`;
}

export const ListingCard = memo(ListingCardImpl);

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.surface,
        borderRadius: 22,
        marginBottom: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: theme.hairline,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 22,
        elevation: 4,
    },
    hero: {
        height: 150,
        position: "relative",
    },
    rentChip: {
        position: "absolute",
        left: 12,
        bottom: 12,
        flexDirection: "row",
        alignItems: "flex-end",
        backgroundColor: theme.glassDark,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 12,
        backdropFilter: "blur(8px)",
    },
    rentValue: {
        fontSize: 19,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -0.3,
    },
    rentUnit: {
        fontSize: 11.5,
        color: "rgba(255,255,255,0.9)",
        marginLeft: 3,
        marginBottom: 2,
        fontWeight: "600",
    },
    availChip: {
        position: "absolute",
        left: 12,
        top: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: theme.glassDark,
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 9,
    },
    availChipReady: {
        backgroundColor: "rgba(62, 125, 91, 0.92)",
    },
    availText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    availTextReady: {
        color: "#FFFFFF",
    },
    saveBtn: {
        position: "absolute",
        top: 10,
        right: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.glassDark,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
    },
    saveBtnActive: {
        backgroundColor: "#FFFFFF",
    },
    body: {
        padding: 16,
    },
    title: {
        fontSize: 16.5,
        fontWeight: "700",
        color: theme.text,
        lineHeight: 21,
        letterSpacing: -0.1,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 6,
    },
    location: {
        fontSize: 13.5,
        color: theme.textMuted,
        fontWeight: "500",
        flexShrink: 1,
    },
    locationDot: {
        color: theme.textSubtle,
    },
    tagRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 14,
    },
    tag: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 12,
        fontWeight: "600",
    },
});
