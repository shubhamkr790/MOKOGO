// Sample flatmate room listings for MOKOGO.
// Source: screening brief. Kept inline (no backend) per task constraints.

export type RoomType = "Private" | "Shared";
export type PreferredGender = "Any" | "Male" | "Female";

export interface Listing {
    id: string;
    title: string;
    locality: string;
    city: string;
    rent: number; // monthly, INR
    roomType: RoomType;
    preferredGender: PreferredGender;
    furnished: boolean;
    availableFrom: string; // ISO date string YYYY-MM-DD
}

export const LISTINGS: Listing[] = [
    {
        id: "1",
        title: "Sunny room in 2BHK",
        locality: "Baner",
        city: "Pune",
        rent: 12000,
        roomType: "Private",
        preferredGender: "Any",
        furnished: true,
        availableFrom: "2026-07-15",
    },
    {
        id: "2",
        title: "Shared room near IT park",
        locality: "Hinjewadi",
        city: "Pune",
        rent: 7500,
        roomType: "Shared",
        preferredGender: "Male",
        furnished: true,
        availableFrom: "2026-07-10",
    },
    {
        id: "3",
        title: "Cozy studio, female only",
        locality: "Koramangala",
        city: "Bangalore",
        rent: 18000,
        roomType: "Private",
        preferredGender: "Female",
        furnished: false,
        availableFrom: "2026-08-01",
    },
    {
        id: "4",
        title: "Room in 3BHK with balcony",
        locality: "Indiranagar",
        city: "Bangalore",
        rent: 15000,
        roomType: "Private",
        preferredGender: "Any",
        furnished: true,
        availableFrom: "2026-07-20",
    },
    {
        id: "5",
        title: "Budget shared room",
        locality: "Gachibowli",
        city: "Hyderabad",
        rent: 6000,
        roomType: "Shared",
        preferredGender: "Male",
        furnished: false,
        availableFrom: "2026-07-05",
    },
    {
        id: "6",
        title: "Spacious private room",
        locality: "Madhapur",
        city: "Hyderabad",
        rent: 13500,
        roomType: "Private",
        preferredGender: "Female",
        furnished: true,
        availableFrom: "2026-08-10",
    },
    {
        id: "7",
        title: "Room near metro, furnished",
        locality: "Andheri West",
        city: "Mumbai",
        rent: 22000,
        roomType: "Private",
        preferredGender: "Any",
        furnished: true,
        availableFrom: "2026-07-25",
    },
    {
        id: "8",
        title: "Affordable shared PG-style",
        locality: "Powai",
        city: "Mumbai",
        rent: 9500,
        roomType: "Shared",
        preferredGender: "Female",
        furnished: true,
        availableFrom: "2026-07-12",
    },
    {
        id: "9",
        title: "Quiet room for working pro",
        locality: "Kothrud",
        city: "Pune",
        rent: 11000,
        roomType: "Private",
        preferredGender: "Any",
        furnished: false,
        availableFrom: "2026-08-05",
    },
    {
        id: "10",
        title: "Room in gated society",
        locality: "HSR Layout",
        city: "Bangalore",
        rent: 16500,
        roomType: "Private",
        preferredGender: "Male",
        furnished: true,
        availableFrom: "2026-07-18",
    },
];

// Derive the full set of cities present in the data, sorted.
export const CITIES: string[] = Array.from(
    new Set(LISTINGS.map((l) => l.city)),
).sort();

export const GENDER_OPTIONS: PreferredGender[] = ["Any", "Male", "Female"];

export const ROOM_TYPE_OPTIONS: RoomType[] = ["Private", "Shared"];

// Rent slider bounds (rounded to nice values)
export const MIN_RENT = Math.min(...LISTINGS.map((l) => l.rent)); // 6000
export const MAX_RENT = Math.max(...LISTINGS.map((l) => l.rent)); // 22000

export type SortOption = "default" | "rent-asc" | "rent-desc";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "default", label: "Default" },
    { value: "rent-asc", label: "Rent: Low to High" },
    { value: "rent-desc", label: "Rent: High to Low" },
];
