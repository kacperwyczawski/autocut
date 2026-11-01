import { describe, expect, it } from "bun:test";
import { optimize, rotatePanel } from "../optimize";
import type { PanelTemplate } from "../panelTemplate";
import type { SheetTemplate } from "../sheetTemplate";

describe("rotatePanel", () => {
	it("should swap length and width and rotate edge reductions clockwise", () => {
		const panel: PanelTemplate = {
			length: 1000,
			width: 500,
			edgeReduction: {
				top: true,
				right: false,
				bottom: false,
				left: false,
				thickness: 2,
			},
		};

		const rotated = rotatePanel(panel);
		expect(rotated.length).toBe(500);
		expect(rotated.width).toBe(1000);
		expect(rotated.edgeReduction).toEqual({
			top: false, // old left
			right: true, // old top
			bottom: false, // old right
			left: false, // old bottom
			thickness: 2,
		});
	});
});

describe("optimize with rotation", () => {
	const defaultSheet: SheetTemplate = {
		length: 2000,
		width: 1000,
		edgeReduction: {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
		},
	};

	it("should fail when panel exceeds dimensions and rotation is disabled", () => {
		// Panel is 800 x 1500. Sheet is 2000 x 1000.
		// Unrotated: length 800 <= 2000, but width 1500 > 1000 -> does not fit!
		const panels: PanelTemplate[] = [
			{
				length: 800,
				width: 1500,
				edgeReduction: {
					top: false,
					right: false,
					bottom: false,
					left: false,
					thickness: 0,
				},
			},
		];

		const resultDisabled = optimize({
			sheetTemplate: defaultSheet,
			panels: structuredClone(panels),
			bladeThickness: 3,
			depth: 1,
			allowRotation: false,
		});

		expect(resultDisabled).toBe("at least one panel is bigger than the sheet");
	});

	it("should succeed by rotating panel when rotation is enabled", () => {
		// Panel is 800 x 1500. Sheet is 2000 x 1000.
		// Rotated: length 1500 <= 2000, width 800 <= 1000 -> fits!
		const panels: PanelTemplate[] = [
			{
				length: 800,
				width: 1500,
				edgeReduction: {
					top: true,
					right: false,
					bottom: false,
					left: false,
					thickness: 2,
				},
			},
		];

		const resultEnabled = optimize({
			sheetTemplate: defaultSheet,
			panels: structuredClone(panels),
			bladeThickness: 3,
			depth: 1,
			allowRotation: true,
		});

		expect(typeof resultEnabled).not.toBe("string");
		if (typeof resultEnabled !== "string") {
			expect(resultEnabled.sheets.length).toBe(1);
			expect(resultEnabled.sheets[0].panels.length).toBe(1);
			const placedPanel = resultEnabled.sheets[0].panels[0];
			expect(placedPanel.template.length).toBe(1500);
			expect(placedPanel.template.width).toBe(800);
			expect(placedPanel.template.edgeReduction.right).toBe(true);
		}
	});

	it("should optimize packing better with rotation enabled", () => {
		// Sheet: 1000 x 1000. Blade: 0.
		// Panel 1: 800 x 500
		// Panel 2: 500 x 800
		// Both fit on sheet individually without rotation.
		// Without rotation: Panel 2 (500x800) cannot fit into remaining free space (1000x500), so 2 sheets needed.
		// With rotation: Panel 2 rotates to 800x500 and fits into (1000x500), so only 1 sheet needed.
		const squareSheet: SheetTemplate = {
			length: 1000,
			width: 1000,
			edgeReduction: { top: 0, right: 0, bottom: 0, left: 0 },
		};
		const testPanels: PanelTemplate[] = [
			{
				length: 800,
				width: 500,
				edgeReduction: { top: false, right: false, bottom: false, left: false, thickness: 0 },
			},
			{
				length: 500,
				width: 800,
				edgeReduction: { top: false, right: false, bottom: false, left: false, thickness: 0 },
			},
		];

		const resultNoRotation = optimize({
			sheetTemplate: squareSheet,
			panels: structuredClone(testPanels),
			bladeThickness: 0,
			depth: 1,
			allowRotation: false,
		});

		const resultWithRotation = optimize({
			sheetTemplate: squareSheet,
			panels: structuredClone(testPanels),
			bladeThickness: 0,
			depth: 1,
			allowRotation: true,
		});

		expect(typeof resultNoRotation).not.toBe("string");
		expect(typeof resultWithRotation).not.toBe("string");

		if (typeof resultNoRotation !== "string" && typeof resultWithRotation !== "string") {
			expect(resultNoRotation.sheets.length).toBe(2);
			expect(resultWithRotation.sheets.length).toBe(1);
		}
	});
});

	it("should handle realistic multiple panels within reasonable time", () => {
		const sheet: SheetTemplate = {
			length: 2800,
			width: 2070,
			edgeReduction: { top: 10, right: 10, bottom: 10, left: 10 },
		};
		const panels: PanelTemplate[] = [
			{ length: 1200, width: 600, edgeReduction: { top: true, right: false, bottom: false, left: false, thickness: 2 } },
			{ length: 1200, width: 600, edgeReduction: { top: true, right: false, bottom: false, left: false, thickness: 2 } },
			{ length: 800, width: 400, edgeReduction: { top: false, right: false, bottom: false, left: false, thickness: 0 } },
			{ length: 800, width: 400, edgeReduction: { top: false, right: false, bottom: false, left: false, thickness: 0 } },
			{ length: 600, width: 400, edgeReduction: { top: false, right: false, bottom: false, left: false, thickness: 0 } },
			{ length: 500, width: 300, edgeReduction: { top: false, right: false, bottom: false, left: false, thickness: 0 } },
			{ length: 900, width: 350, edgeReduction: { top: false, right: false, bottom: false, left: false, thickness: 0 } },
			{ length: 700, width: 450, edgeReduction: { top: false, right: false, bottom: false, left: false, thickness: 0 } },
		];

		const start = performance.now();
		const result = optimize({
			sheetTemplate: sheet,
			panels,
			bladeThickness: 3,
			depth: 3,
			allowRotation: true,
		});
		const elapsed = performance.now() - start;

		expect(typeof result).not.toBe("string");
		expect(elapsed).toBeLessThan(5000);
	});
