//model that will be used to represent all cards

export interface AllCards {
    id: number;
    texture: "png" | "jpg";
    element: string;
    isPowerCard: boolean;
}