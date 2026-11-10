import { describe, expect, it } from "bun:test";
import { optimize, rotatePanel } from "../optimize";
import type { PanelTemplate } from "../panelTemplate";
import { assertValidLayout, createPanel, createSheet } from "./testHelpers";

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

	it("should return to original state after 4 rotations (360 degrees)", () => {
		const original: PanelTemplate = {
			length: 1200,
			width: 600,
			edgeReduction: {
				top: true,
				right: false,
				bottom: true,
				left: false,
				thickness: 1.5,
			},
		};

		let current = original;
		for (let i = 0; i < 4; i++) {
			current = rotatePanel(current);
		}

		expect(current).toEqual(original);
	});

	it("should handle square panels correctly", () => {
		const square: PanelTemplate = {
			length: 600,
			width: 600,
			edgeReduction: {
				top: true,
				right: false,
				bottom: false,
				left: true,
				thickness: 2,
			},
		};

		const rotated = rotatePanel(square);
		expect(rotated.length).toBe(600);
		expect(rotated.width).toBe(600);
		expect(rotated.edgeReduction).toEqual({
			top: true, // old left
			right: true, // old top
			bottom: false, // old right
			left: false, // old bottom
			thickness: 2,
		});
	});

	it("should provide default edge reductions when edgeReduction is falsy", () => {
		const panelWithoutEdges = {
			length: 400,
			width: 300,
		} as unknown as PanelTemplate;

		const rotated = rotatePanel(panelWithoutEdges);
		expect(rotated.length).toBe(300);
		expect(rotated.width).toBe(400);
		expect(rotated.edgeReduction).toEqual({
			top: false,
			right: false,
			bottom: false,
			left: false,
			thickness: 0,
		});
	});
});

describe("optimize - Edge Cases and Validation", () => {
	const defaultSheet = createSheet(2000, 1000);

	it("should return 'no panels to optimize' when panel array is empty", () => {
		const result = optimize({
			sheetTemplate: defaultSheet,
			panels: [],
			bladeThickness: 3,
			depth: 1,
		});

		expect(result).toBe("no panels to optimize");
	});

	it("should return error when a panel length exceeds sheet length in both orientations", () => {
		const panels = [createPanel(2500, 1500)];

		const result = optimize({
			sheetTemplate: defaultSheet,
			panels,
			bladeThickness: 3,
			depth: 0,
			allowRotation: true,
		});

		expect(result).toBe("at least one panel is bigger than the sheet");
	});

	it("should return error when a panel fits only rotated but rotation is disabled", () => {
		// Sheet: 2000 x 1000. Panel: 800 x 1500.
		// Width 1500 > 1000 -> does not fit unrotated.
		const panels = [createPanel(800, 1500)];

		const resultDisabled = optimize({
			sheetTemplate: defaultSheet,
			panels: structuredClone(panels),
			bladeThickness: 3,
			depth: 0,
			allowRotation: false,
		});

		expect(resultDisabled).toBe("at least one panel is bigger than the sheet");

		// Should succeed when rotation is allowed
		const resultEnabled = optimize({
			sheetTemplate: defaultSheet,
			panels: structuredClone(panels),
			bladeThickness: 3,
			depth: 0,
			allowRotation: true,
		});

		assertValidLayout(resultEnabled, panels, defaultSheet, 3, true);
	});

	it("should respect sheet edge reduction when validating panel dimensions", () => {
		// Sheet: 1000 x 1000, edge reduction: 10 on each side -> usable: 980 x 980.
		const reducedSheet = createSheet(1000, 1000, {
			top: 10,
			right: 10,
			bottom: 10,
			left: 10,
		});

		// Panel 990 x 500 <= sheet (1000), but > usable length (980)
		const oversizedPanel = [createPanel(990, 500)];
		const resultOversized = optimize({
			sheetTemplate: reducedSheet,
			panels: oversizedPanel,
			bladeThickness: 3,
			depth: 0,
		});
		expect(resultOversized).toBe("at least one panel is bigger than the sheet");

		// Panel 980 x 980 fits usable area exactly
		const exactPanel = [createPanel(980, 980)];
		const resultExact = optimize({
			sheetTemplate: reducedSheet,
			panels: exactPanel,
			bladeThickness: 3,
			depth: 0,
		});
		assertValidLayout(resultExact, exactPanel, reducedSheet, 3, true);
	});

	it("should handle asymmetric sheet edge reductions correctly", () => {
		const asymmetricSheet = createSheet(1000, 800, {
			top: 20,
			right: 30,
			bottom: 40,
			left: 50,
		});
		// Usable space: length = 1000 - 50 - 30 = 920; width = 800 - 20 - 40 = 740.
		const panel = [createPanel(920, 740)];

		const result = optimize({
			sheetTemplate: asymmetricSheet,
			panels: structuredClone(panel),
			bladeThickness: 4,
			depth: 0,
		});

		expect(typeof result).toBe("object");
		if (typeof result !== "string") {
			expect(result.sheets.length).toBe(1);
			expect(result.sheets[0].panels[0].x).toBe(50);
			expect(result.sheets[0].panels[0].y).toBe(20);
		}
		assertValidLayout(result, panel, asymmetricSheet, 4, true);
	});

	it("should track progress callback correctly across all placed panels", () => {
		const panels = [
			createPanel(500, 300),
			createPanel(400, 200),
			createPanel(300, 200),
		];
		const progressSteps: { placed: number; total: number }[] = [];

		const result = optimize(
			{
				sheetTemplate: defaultSheet,
				panels: structuredClone(panels),
				bladeThickness: 3,
				depth: 1,
			},
			(placedPanels, totalPanels) => {
				progressSteps.push({ placed: placedPanels, total: totalPanels });
			},
		);

		expect(typeof result).toBe("object");
		expect(progressSteps).toEqual([
			{ placed: 1, total: 3 },
			{ placed: 2, total: 3 },
			{ placed: 3, total: 3 },
		]);
	});

	it("should calculate wastePercentage accurately", () => {
		// Sheet: 1000 x 1000 = 1,000,000 mm^2
		// Panel: 500 x 500 = 250,000 mm^2 (25% used -> 75% waste)
		const sheet = createSheet(1000, 1000);
		const panels = [createPanel(500, 500)];

		const result = optimize({
			sheetTemplate: sheet,
			panels,
			bladeThickness: 0,
			depth: 0,
		});

		expect(typeof result).toBe("object");
		if (typeof result !== "string") {
			expect(result.wastePercentage).toBeCloseTo(75, 4);
		}
	});
});

describe("optimize - Hand-Picked Optimizations & Cutting Logic", () => {
	it("should place a panel that perfectly fits the sheet with 0 cuts and 0% waste", () => {
		const sheet = createSheet(1000, 500);
		const panels = [createPanel(1000, 500)];

		const result = optimize({
			sheetTemplate: sheet,
			panels,
			bladeThickness: 3,
			depth: 0,
		});

		expect(typeof result).toBe("object");
		if (typeof result !== "string") {
			expect(result.sheets.length).toBe(1);
			expect(result.sheets[0].panels.length).toBe(1);
			expect(result.sheets[0].cuts.length).toBe(0);
			expect(result.sheets[0].freeSpaces.length).toBe(0);
			expect(result.wastePercentage).toBe(0);
		}
		assertValidLayout(result, panels, sheet, 3);
	});

	it("should tile a 2x2 grid with zero blade thickness with 0% waste on 1 sheet", () => {
		// 1000 x 1000 sheet, 4 panels of 500 x 500.
		const sheet = createSheet(1000, 1000);
		const panels = [
			createPanel(500, 500),
			createPanel(500, 500),
			createPanel(500, 500),
			createPanel(500, 500),
		];

		const result = optimize({
			sheetTemplate: sheet,
			panels: structuredClone(panels),
			bladeThickness: 0,
			depth: 1,
		});

		expect(typeof result).toBe("object");
		if (typeof result !== "string") {
			expect(result.sheets.length).toBe(1);
			expect(result.sheets[0].panels.length).toBe(4);
			expect(result.wastePercentage).toBe(0);
		}
		assertValidLayout(result, panels, sheet, 0);
	});

	it("should account for blade kerf when tiling 2x2 grid", () => {
		// 4 panels of 500 x 500 with blade 3mm -> required dimensions: 500 + 3 + 500 = 1003.
		// On 1003 x 1003 sheet, all 4 panels should fit on 1 sheet.
		const sheet = createSheet(1003, 1003);
		const panels = [
			createPanel(500, 500),
			createPanel(500, 500),
			createPanel(500, 500),
			createPanel(500, 500),
		];

		const result = optimize({
			sheetTemplate: sheet,
			panels: structuredClone(panels),
			bladeThickness: 3,
			depth: 1,
		});

		expect(typeof result).toBe("object");
		if (typeof result !== "string") {
			expect(result.sheets.length).toBe(1);
			expect(result.sheets[0].panels.length).toBe(4);
		}
		assertValidLayout(result, panels, sheet, 3);
	});

	it("should require a 2nd sheet when blade kerf causes panels to exceed dimensions", () => {
		// 2 panels of 1000 x 500.
		// On 1000 x 1000 sheet:
		// With blade 0 -> fits on 1 sheet (500 + 500 = 1000).
		// With blade 3 -> 500 + 3 + 500 = 1003 > 1000 -> requires 2 sheets.
		const sheet = createSheet(1000, 1000);
		const panels = [createPanel(1000, 500), createPanel(1000, 500)];

		const resultBlade0 = optimize({
			sheetTemplate: sheet,
			panels: structuredClone(panels),
			bladeThickness: 0,
			depth: 0,
			allowRotation: false,
		});
		expect(typeof resultBlade0).toBe("object");
		if (typeof resultBlade0 !== "string") {
			expect(resultBlade0.sheets.length).toBe(1);
		}
		assertValidLayout(resultBlade0, panels, sheet, 0, false);

		const resultBlade3 = optimize({
			sheetTemplate: sheet,
			panels: structuredClone(panels),
			bladeThickness: 3,
			depth: 0,
			allowRotation: false,
		});
		expect(typeof resultBlade3).toBe("object");
		if (typeof resultBlade3 !== "string") {
			expect(resultBlade3.sheets.length).toBe(2);
		}
		assertValidLayout(resultBlade3, panels, sheet, 3, false);
	});

	it("should produce a single horizontal cut when panel matches free space length", () => {
		// Sheet: 1000 x 1000. Panel: 1000 x 400.
		// Length matches, so only width is remainder -> 1 horizontal cut.
		const sheet = createSheet(1000, 1000);
		const panels = [createPanel(1000, 400)];

		const result = optimize({
			sheetTemplate: sheet,
			panels,
			bladeThickness: 3,
			depth: 0,
			allowRotation: false,
		});

		expect(typeof result).toBe("object");
		if (typeof result !== "string") {
			expect(result.sheets[0].cuts.length).toBe(1);
			expect(result.sheets[0].cuts[0]).toEqual({
				x: 0,
				y: 400,
				length: 1000,
				direction: "horizontal",
			});
			expect(result.sheets[0].freeSpaces.length).toBe(1);
			expect(result.sheets[0].freeSpaces[0]).toEqual({
				x: 0,
				y: 403,
				length: 1000,
				width: 597, // 1000 - 400 - 3
			});
		}
	});

	it("should produce a single vertical cut when panel matches free space width", () => {
		// Sheet: 1000 x 1000. Panel: 400 x 1000.
		// Width matches, so only length is remainder -> 1 vertical cut.
		const sheet = createSheet(1000, 1000);
		const panels = [createPanel(400, 1000)];

		const result = optimize({
			sheetTemplate: sheet,
			panels,
			bladeThickness: 4,
			depth: 0,
			allowRotation: false,
		});

		expect(typeof result).toBe("object");
		if (typeof result !== "string") {
			expect(result.sheets[0].cuts.length).toBe(1);
			expect(result.sheets[0].cuts[0]).toEqual({
				x: 400,
				y: 0,
				length: 1000,
				direction: "vertical",
			});
			expect(result.sheets[0].freeSpaces.length).toBe(1);
			expect(result.sheets[0].freeSpaces[0]).toEqual({
				x: 404,
				y: 0,
				length: 596, // 1000 - 400 - 4
				width: 1000,
			});
		}
	});

	it("should produce both horizontal and vertical cuts when panel is smaller in both dimensions", () => {
		// Sheet: 1000 x 1000. Panel: 600 x 400.
		const sheet = createSheet(1000, 1000);
		const panels = [createPanel(600, 400)];

		const result = optimize({
			sheetTemplate: sheet,
			panels,
			bladeThickness: 3,
			depth: 0,
			allowRotation: false,
		});

		expect(typeof result).toBe("object");
		if (typeof result !== "string") {
			expect(result.sheets[0].cuts.length).toBe(2);
			expect(result.sheets[0].cuts).toContainEqual({
				x: 0,
				y: 400,
				length: 1000,
				direction: "horizontal",
			});
			expect(result.sheets[0].cuts).toContainEqual({
				x: 600,
				y: 0,
				length: 400,
				direction: "vertical",
			});
			expect(result.sheets[0].freeSpaces.length).toBe(2);
		}
		assertValidLayout(result, panels, sheet, 3, false);
	});

	it("should optimize packing using rotation when panels have swapped dimensions", () => {
		const squareSheet = createSheet(1000, 1000);
		const testPanels = [createPanel(800, 500), createPanel(500, 800)];

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

		expect(typeof resultNoRotation).toBe("object");
		expect(typeof resultWithRotation).toBe("object");

		if (
			typeof resultNoRotation !== "string" &&
			typeof resultWithRotation !== "string"
		) {
			expect(resultNoRotation.sheets.length).toBe(2);
			expect(resultWithRotation.sheets.length).toBe(1);
		}
		assertValidLayout(resultNoRotation, testPanels, squareSheet, 0, false);
		assertValidLayout(resultWithRotation, testPanels, squareSheet, 0, true);
	});

	it("should correctly handle multi-sheet spillover when panels exceed single sheet capacity", () => {
		// Sheet 1000 x 1000. 5 panels of 600 x 600.
		// Since 600 + 600 > 1000, only 1 panel can fit per sheet -> requires 5 sheets.
		const sheet = createSheet(1000, 1000);
		const panels = [
			createPanel(600, 600),
			createPanel(600, 600),
			createPanel(600, 600),
			createPanel(600, 600),
			createPanel(600, 600),
		];

		const result = optimize({
			sheetTemplate: sheet,
			panels: structuredClone(panels),
			bladeThickness: 3,
			depth: 1,
		});

		expect(typeof result).toBe("object");
		if (typeof result !== "string") {
			expect(result.sheets.length).toBe(5);
			for (const s of result.sheets) {
				expect(s.panels.length).toBe(1);
			}
		}
		assertValidLayout(result, panels, sheet, 3);
	});

	it("should produce valid layout with different lookahead depths (depth 0, 1, 2, 3)", () => {
		const sheet = createSheet(2000, 1000);
		const panels = [
			createPanel(900, 450),
			createPanel(800, 400),
			createPanel(700, 350),
			createPanel(600, 300),
			createPanel(500, 250),
		];

		for (const depth of [0, 1, 2, 3]) {
			const result = optimize({
				sheetTemplate: sheet,
				panels: structuredClone(panels),
				bladeThickness: 3,
				depth,
				allowRotation: true,
			});

			assertValidLayout(result, panels, sheet, 3, true);
		}
	});

	it("should achieve fewer or equal sheets and explore more variants at deeper lookahead", () => {
		const sheet = createSheet(1000, 1000);
		const panels = [
			createPanel(600, 500),
			createPanel(500, 800),
			createPanel(400, 500),
			createPanel(500, 400),
		];

		const resDepth0 = optimize({
			sheetTemplate: sheet,
			panels: structuredClone(panels),
			bladeThickness: 0,
			depth: 0,
			allowRotation: true,
		});

		const resDepth2 = optimize({
			sheetTemplate: sheet,
			panels: structuredClone(panels),
			bladeThickness: 0,
			depth: 2,
			allowRotation: true,
		});

		expect(typeof resDepth0).toBe("object");
		expect(typeof resDepth2).toBe("object");

		if (typeof resDepth0 !== "string" && typeof resDepth2 !== "string") {
			expect(resDepth2.sheets.length).toBeLessThanOrEqual(
				resDepth0.sheets.length,
			);
			expect(resDepth2.fittings).toBeGreaterThan(resDepth0.fittings);
		}
	});

	it("should support decoupled searchDepth and searchWidth options", () => {
		const sheet = createSheet(2000, 1000);
		const panels = [
			createPanel(800, 400),
			createPanel(700, 350),
			createPanel(600, 300),
			createPanel(500, 250),
		];

		// Narrow search width (W = 1)
		const resNarrow = optimize({
			sheetTemplate: sheet,
			panels: structuredClone(panels),
			bladeThickness: 3,
			searchDepth: 2,
			searchWidth: 1,
			allowRotation: true,
		});

		// Wide search width (W = 16)
		const resWide = optimize({
			sheetTemplate: sheet,
			panels: structuredClone(panels),
			bladeThickness: 3,
			searchDepth: 2,
			searchWidth: 16,
			allowRotation: true,
		});

		expect(typeof resNarrow).toBe("object");
		expect(typeof resWide).toBe("object");

		if (typeof resNarrow !== "string" && typeof resWide !== "string") {
			assertValidLayout(resNarrow, panels, sheet, 3, true);
			assertValidLayout(resWide, panels, sheet, 3, true);

			// Wider search explores more candidate variants
			expect(resWide.fittings).toBeGreaterThan(resNarrow.fittings);
		}
	});

	it("should pack mixed bulky panels and full-span strips on a single sheet using multi-pass sorting", () => {
		// Sheet: 1000 x 1000 (area 1,000,000)
		// Panel B: 600 x 800 (area 480,000, max span 800)
		// Panel A: 1000 x 200 (area 200,000, max span 1000)
		// Panel C: 400 x 400 (area 160,000)
		// Panel D: 400 x 400 (area 160,000)
		// Total area: 1,000,000 (perfect tiling of the sheet).
		//
		// If sorted purely by Area (600x800 first), placing 600x800 first on 1000x1000
		// leaves remnants of 400x1000 and 600x200. Without rotation, the 1000x200 panel
		// cannot fit (1000 > 400 and 1000 > 600), forcing a 2nd sheet.
		//
		// Multi-pass (Max-Span pass) places 1000x200 first, leaving a clean 1000x800 space
		// where 600x800 and the two 400x400 panels pack perfectly on 1 SINGLE SHEET!
		const sheet = createSheet(1000, 1000);
		const panels = [
			createPanel(600, 800),
			createPanel(1000, 200),
			createPanel(400, 400),
			createPanel(400, 400),
		];

		const resultNoRotation = optimize({
			sheetTemplate: sheet,
			panels: structuredClone(panels),
			bladeThickness: 0,
			depth: 1,
			allowRotation: false,
		});

		expect(typeof resultNoRotation).toBe("object");
		if (typeof resultNoRotation !== "string") {
			expect(resultNoRotation.sheets.length).toBe(1);
			expect(resultNoRotation.sheets[0].panels.length).toBe(4);
			expect(resultNoRotation.wastePercentage).toBe(0);
			assertValidLayout(resultNoRotation, panels, sheet, 0, false);
		}

		const resultRotation = optimize({
			sheetTemplate: sheet,
			panels: structuredClone(panels),
			bladeThickness: 0,
			depth: 1,
			allowRotation: true,
		});

		expect(typeof resultRotation).toBe("object");
		if (typeof resultRotation !== "string") {
			expect(resultRotation.sheets.length).toBe(1);
			expect(resultRotation.sheets[0].panels.length).toBe(4);
			expect(resultRotation.wastePercentage).toBe(0);
			assertValidLayout(resultRotation, panels, sheet, 0, true);
		}
	});

	it("should achieve 0% waste on 1 sheet for edge-strip + two half-width panels under allowRotation", () => {
		// Sheet: 1000 x 1000 (area 1,000,000)
		// Panel 1: 1000 x 150 (strip, area 150,000, max span 1000)
		// Panel 2: 500 x 850 (area 425,000, max span 850)
		// Panel 3: 500 x 850 (area 425,000, max span 850)
		// Total area = 1,000,000 (perfect tiling)
		const sheet = createSheet(1000, 1000);
		const panels = [
			createPanel(500, 850),
			createPanel(500, 850),
			createPanel(1000, 150),
		];

		const result = optimize({
			sheetTemplate: sheet,
			panels,
			bladeThickness: 0,
			depth: 1,
			allowRotation: true,
		});

		expect(typeof result).toBe("object");
		if (typeof result !== "string") {
			expect(result.sheets.length).toBe(1);
			expect(result.sheets[0].panels.length).toBe(3);
			expect(result.wastePercentage).toBe(0);
			assertValidLayout(result, panels, sheet, 0, true);
		}
	});

	it("should select vertical through-cut when panel is taller than wide to maximize contiguous remnant", () => {
		// Sheet: 1000 x 1000. Panel: 400 x 600.
		// Vertical through-cut produces:
		// Cut 1: vertical cut at X=400, spanning length=1000 (direction: vertical)
		// Remnant 2: (1000 - 400 - 3) x 1000 = 597 x 1000 (area: 597,000)
		// Horizontal through-cut would produce:
		// Remnant 2: 1000 x (1000 - 600 - 3) = 1000 x 397 (area: 397,000)
		// Dynamic cut selection selects vertical through-cut because 597,000 > 397,000.
		const sheet = createSheet(1000, 1000);
		const panels = [createPanel(400, 600)];

		const result = optimize({
			sheetTemplate: sheet,
			panels,
			bladeThickness: 3,
			depth: 0,
			allowRotation: false,
		});

		expect(typeof result).toBe("object");
		if (typeof result !== "string") {
			expect(result.sheets[0].cuts.length).toBe(2);
			// Expect vertical through-cut spanning full height
			expect(result.sheets[0].cuts).toContainEqual({
				x: 400,
				y: 0,
				length: 1000,
				direction: "vertical",
			});
			// Expect horizontal sub-cut across panel width
			expect(result.sheets[0].cuts).toContainEqual({
				x: 0,
				y: 600,
				length: 400,
				direction: "horizontal",
			});
			assertValidLayout(result, panels, sheet, 3, false);
		}
	});
});
