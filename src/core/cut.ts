/**
 * Represents a single cut
 * @property {number} x - In mm, calculated from the left edge of the sheet to the left edge of the cut
 * @property {number} y - In mm, calculated from the top edge of the sheet to the top edge of the cut
 * @property {number} length - In mm
 * @property {"vertical" | "horizontal"} direction - The direction of the cut
 */
export type Cut = {
	x: number;
	y: number;
	length: number;
	direction: "vertical" | "horizontal";
};
