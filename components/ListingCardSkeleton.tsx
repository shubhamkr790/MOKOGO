import { memo, useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { theme } from "@/constants/theme";

/** A single shimmering skeleton card matching ListingCard dimensions. */
function ListingCardSkeletonImpl() {
    const translateX = useRef(new Animated.Value(-1)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.timing(translateX, {
                toValue: 1,
                duration: 1300,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        );
        loop.start();
        return () => loop.stop();
    }, [translateX]);

    // Sheen sweeps across the card width (0 -> 100% via translateX in [-1,1])
    const sheen = translateX.interpolate({
        inputRange: [-1, 1],
        outputRange: [-320, 320],
    });

    return (
        <View style={styles.card}>
            {/* Hero block */}
            <View style={styles.hero}>
                <Animated.View
                    style={[styles.sheenWrap, { transform: [{ translateX: sheen }] }]}
                    pointerEvents="none"
                >
                    <LinearGradient
                        colors={[
                            "rgba(255,255,255,0)",
                            theme.skeletonSheen,
                            "rgba(255,255,255,0)",
                        ]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>
                <View style={[styles.block, styles.rentChipBlock]} />
            </View>

            {/* Body */}
            <View style={styles.body}>
                <View style={[styles.block, styles.titleBlock]} />
                <View style={[styles.block, styles.locBlock]} />
                <View style={styles.tagRow}>
                    <View style={[styles.block, styles.tagBlock]} />
                    <View style={[styles.block, styles.tagBlock]} />
                    <View style={[styles.block, styles.tagBlock]} />
                </View>
            </View>

            {/* Full-card sheen for body */}
            <Animated.View
                style={[
                    styles.sheenWrap,
                    styles.sheenBody,
                    { transform: [{ translateX: sheen }] },
                ]}
                pointerEvents="none"
            >
                <LinearGradient
                    colors={[
                        "rgba(255,255,255,0)",
                        theme.skeletonSheen,
                        "rgba(255,255,255,0)",
                    ]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
}

export const ListingCardSkeleton = memo(ListingCardSkeletonImpl);

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.surface,
        borderRadius: 22,
        marginBottom: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: theme.hairline,
    },
    hero: {
        height: 150,
        backgroundColor: theme.skeleton,
        position: "relative",
    },
    rentChipBlock: {
        position: "absolute",
        left: 12,
        bottom: 12,
        width: 92,
        height: 24,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.35)",
    },
    body: {
        padding: 16,
    },
    block: {
        backgroundColor: theme.skeleton,
        borderRadius: 6,
    },
    titleBlock: {
        width: "82%",
        height: 18,
    },
    locBlock: {
        width: "58%",
        height: 14,
        marginTop: 10,
    },
    tagRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 16,
    },
    tagBlock: {
        width: 72,
        height: 24,
        borderRadius: 8,
    },
    sheenWrap: {
        position: "absolute",
        top: 0,
        bottom: 0,
        width: 160,
        left: 0,
    },
    sheenBody: {
        top: 150,
        bottom: 0,
    },
});
