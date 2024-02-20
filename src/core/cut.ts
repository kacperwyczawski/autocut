/**
 * Represents a single cut
 * @property {number} x - In mm, calculated from the left edge of the sheet to the center of the cut, if it's a vertical cut
 * @property {number} y - In mm, calculated from the top edge of the sheet to the center of the cut, if it's a horizontal cut
 * @property {number} length - In mm
 */
export type Cut = {
  x: number;
  y: number;
  length: number;
  direction: "vertical" | "horizontal";
};
