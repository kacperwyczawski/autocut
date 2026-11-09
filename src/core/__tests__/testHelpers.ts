import { expect } from "bun:test";
import type { OptimizationResult } from "../optimizationResult";
import type { PanelTemplate } from "../panelTemplate";
import type { SheetTemplate } from "../sheetTemplate";

export function createSheet(
	length = 2000,
	width = 1000,
	edgeReduction = { top: 0, right: 0, bottom: 0, left: 0 },
): SheetTemplate {
	return { length, width, edgeReduction };
}

export function createPanel(
	length: number,
	width: number,
	edgeReduction = {
		top: false,
		right: false,
		bottom: false,
		left: false,
		thickness: 0,
	},
): PanelTemplate {
	return { length, width, edgeReduction };
}

export function assertValidLayout(
	result: OptimizationResult,
	inputPanels: PanelTemplate[],
	sheetTemplate: SheetTemplate,
	bladeThickness: number,
	allowRotation = true,
): void {
	expect(typeof result).toBe("object");
	if (typeof result === "string") return;

	expect(result.bladeThickness).toBe(bladeThickness);
	expect(result.sheets.length).toBeGreaterThan(0);

	const usableMinX = sheetTemplate.edgeReduction.left;
	const usableMinY = sheetTemplate.edgeReduction.top;
	const usableMaxX = sheetTemplate.length - sheetTemplate.edgeReduction.right;
	const usableMaxY = sheetTemplate.width - sheetTemplate.edgeReduction.bottom;

	let totalPlaced = 0;
	let totalPlacedArea = 0;
	const remainingInputPanels = structuredClone(inputPanels);

	for (const sheet of result.sheets) {
		expect(sheet.template).toEqual(sheetTemplate);

		for (let i = 0; i < sheet.panels.length; i++) {
			const p1 = sheet.panels[i];
			totalPlaced++;
			totalPlacedArea += p1.template.length * p1.template.width;

			// Boundary assertion: panel must stay completely inside usable bounds
			expect(p1.x).toBeGreaterThanOrEqual(usableMinX);
			expect(p1.y).toBeGreaterThanOrEqual(usableMinY);
			expect(p1.x + p1.template.length).toBeLessThanOrEqual(usableMaxX);
			expect(p1.y + p1.template.width).toBeLessThanOrEqual(usableMaxY);

			// Match placed panel with one of the remaining input panels
			const matchIndex = remainingInputPanels.findIndex((p) => {
				const directMatch =
					p.length === p1.template.length && p.width === p1.template.width;
				const rotatedMatch =
					allowRotation &&
					p.length === p1.template.width &&
					p.width === p1.template.length;
				return directMatch || rotatedMatch;
			});
			expect(matchIndex).toBeGreaterThanOrEqual(0);
			remainingInputPanels.splice(matchIndex, 1);

			// Non-overlap assertion with blade kerf
			for (let j = i + 1; j < sheet.panels.length; j++) {
				const p2 = sheet.panels[j];
				const noOverlap =
					p1.x + p1.template.length + bladeThickness <= p2.x ||
					p2.x + p2.template.length + bladeThickness <= p1.x ||
					p1.y + p1.template.width + bladeThickness <= p2.y ||
					p2.y + p2.template.width + bladeThickness <= p1.y;

				expect(noOverlap).toBe(true);
			}
		}

		// Validate cuts stay within sheet boundaries
		for (const cut of sheet.cuts) {
			expect(cut.x).toBeGreaterThanOrEqual(0);
			expect(cut.y).toBeGreaterThanOrEqual(0);
			if (cut.direction === "horizontal") {
				expect(cut.x + cut.length).toBeLessThanOrEqual(sheet.template.length);
				expect(cut.y).toBeLessThanOrEqual(sheet.template.width);
			} else {
				expect(cut.x).toBeLessThanOrEqual(sheet.template.length);
				expect(cut.y + cut.length).toBeLessThanOrEqual(sheet.template.width);
			}
		}
	}

	// All input panels must be placed
	expect(totalPlaced).toBe(inputPanels.length);
	expect(remainingInputPanels.length).toBe(0);

	// Waste percentage validation
	const totalSheetArea =
		result.sheets.length * (sheetTemplate.length * sheetTemplate.width);
	const expectedWaste = 100 - (totalPlacedArea / totalSheetArea) * 100;
	expect(result.wastePercentage).toBeCloseTo(expectedWaste, 5);
}
