export type ElementKey = "air" | "water" | "ice" | "earth" | "fire";

export type DojoDef = {
  id: string;
  element: ElementKey;
  label: string;
  topPct: number;   // 0–100 relative to map height
  leftPct: number;  // 0–100 relative to map width
  iconSrc: string;
  scale?: number;   // optional per-dojo scaling
};

// Initial placements — adjust later once icons are visible
export const DOJOS: DojoDef[] = [
  { id: "dojo-air",   element: "air",   label: "Air Dojo",   topPct: 18, leftPct: 30, iconSrc: "/assets/dojos/air.png" },
  { id: "dojo-water", element: "water", label: "Water Dojo", topPct: 24, leftPct: 70, iconSrc: "/assets/dojos/water.png" },
  { id: "dojo-ice",   element: "ice",   label: "Ice Dojo",   topPct: 48, leftPct: 88, iconSrc: "/assets/dojos/ice.png" },
  { id: "dojo-earth", element: "earth", label: "Earth Dojo", topPct: 62, leftPct: 23, iconSrc: "/assets/dojos/earth.png" },
  { id: "dojo-fire",  element: "fire",  label: "Fire Dojo",  topPct: 78, leftPct: 58, iconSrc: "/assets/dojos/fire.png" },
];