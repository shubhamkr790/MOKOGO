// MOKOGO Listings — design tokens
// A warm, "home" aesthetic refined to a Series A product tier:
// terracotta coral accent on warm cream, layered surfaces, soft sage/sand
// supporting tones, and a curated set of hero gradients that stand in for
// listing photos in this no-backend screening build.

export const theme = {
    // Brand accent — terracotta coral
    accent: "#E85D3C",
    accentDeep: "#C2442A",
    accentSoft: "#FBE4DC",
    accentGlow: "rgba(232, 93, 60, 0.22)",

    // Surfaces
    bg: "#F4EFE8", // app background — warm cream
    surface: "#FFFFFF",
    surfaceMuted: "#F0E9DF", // sand
    surfaceElevated: "#FFFFFF",
    glass: "rgba(255, 255, 255, 0.72)", // sticky header / overlays
    glassStrong: "rgba(255, 255, 255, 0.88)",
    glassDark: "rgba(20, 16, 14, 0.46)", // hero overlay pills

    // Text
    text: "#1B1714", // near-black warm
    textMuted: "#6B625A",
    textSubtle: "#A39A8F",
    textOnAccent: "#FFFFFF",
    textOnGlass: "#1B1714",

    // Lines & dividers
    hairline: "#E6DDCF",
    hairlineStrong: "#D9CEBC",

    // Semantic tags
    furnished: "#3E7D5B", // sage green
    furnishedSoft: "#DCEBE2",
    unfurnished: "#8A8076",
    unfurnishedSoft: "#ECE5DB",

    shared: "#B07A2E", // amber for shared
    sharedSoft: "#F4E8CF",
    private: "#3A6FAE", // blue for private
    privateSoft: "#DDE9F5",

    // Gender pills
    anySoft: "#ECE5DB",
    maleSoft: "#DDE9F5",
    femaleSoft: "#FBE4DC",

    // Misc
    shadow: "rgba(31, 26, 23, 0.10)",
    shadowStrong: "rgba(31, 26, 23, 0.18)",
    skeleton: "#E7DECF",
    skeletonSheen: "#FBF6EE",
} as const;

export type Theme = typeof theme;

/**
 * Curated hero gradient palettes used as stand-in "photos" for listing cards.
 * Each entry is a 3-stop vertical gradient. A listing picks one deterministically
 * from its id so the same card always renders the same visual.
 */
export const HERO_GRADIENTS: readonly [string, string, string][] = [
    ["#F6A86C", "#E85D3C", "#C2442A"], // terracotta sunset
    ["#7E9BC0", "#3A6FAE", "#2A4F86"], // coastal blue
    ["#8FC09B", "#3E7D5B", "#2C5A40"], // sage garden
    ["#E6B97A", "#B07A2E", "#8A5C1E"], // warm sand
    ["#C98DA0", "#A45D78", "#7C3F56"], // dusk rose
    ["#9DB4C6", "#5E7F96", "#3D5A6E"], // slate mist
    ["#F2C27A", "#D98E3E", "#B2651E"], // amber glow
    ["#A6B8A0", "#6B8266", "#46583F"], // moss
];

/** Deterministically pick a hero gradient for a listing id. */
export function heroGradientFor(id: string): readonly [string, string, string] {
    let h = 0;
    for (let i = 0; i < id.length; i++) {
        h = (h * 31 + id.charCodeAt(i)) >>> 0;
    }
    return HERO_GRADIENTS[h % HERO_GRADIENTS.length];
}

// Helpers for currency formatting (Indian Rupees)
export function formatRent(rent: number): string {
    const formatted = new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 0,
    }).format(rent);
    return `₹${formatted}`;
}

export function formatRentShort(rent: number): string {
    if (rent >= 1000) {
        const k = rent / 1000;
        const str = Number.isInteger(k) ? k.toString() : k.toFixed(1);
        return `₹${str}k`;
    }
    return `₹${rent}`;
}
