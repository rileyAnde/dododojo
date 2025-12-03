

/*
Module Purpose:
- Defines the core data model for elemental dojos on the world map, including
  their element, label, and relative on-screen position.

Types:
- ElementKey --> union type of all elemental keys ("air" | "water" | "ice" | "earth" | "fire")
- DojoDef --> structure describing a single dojo's id, element, label, position, icon, and scale

Constants:
- DOJOS --> array of DojoDef objects used by the map screen to render clickable dojo locations

Inputs:
- None directly; this module is imported by UI components (e.g., Map/World screens) that need dojo metadata.

Outputs:
- ElementKey --> exported type for strongly-typed elemental labels
- DojoDef --> exported type describing dojo layout data
- DOJOS --> exported list of dojo definitions consumed by the map UI

Outside sources:
- ChatGPT
- GitHub Copilot

Authors: Jacob Richards

*/

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