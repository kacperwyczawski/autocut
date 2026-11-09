import { describe, expect, it } from "bun:test";
import { optimize } from "../optimize";
import type { PanelTemplate } from "../panelTemplate";
import { assertValidLayout, createPanel, createSheet } from "./testHelpers";

describe("Algorithm Performance & Benchmarks", () => {
	// Standard industrial sheet: 2800 x 2070 mm, 10mm edge trim on all sides
	const standardSheet = createSheet(2800, 2070, {
		top: 10,
		right: 10,
		bottom: 10,
		left: 10,
	});
	const standardBlade = 3.2;

	it("should benchmark scalability across lookahead depths (depth 0, 1, 2, 3)", () => {
		const panels: PanelTemplate[] = [
			createPanel(1200, 600),
			createPanel(1200, 600),
			createPanel(800, 400),
			createPanel(800, 400),
			createPanel(600, 400),
			createPanel(500, 300),
			createPanel(900, 350),
			createPanel(700, 450),
			createPanel(400, 400),
			createPanel(650, 350),
		];

		const depthResults: {
			depth: number;
			durationMs: number;
			fittings: number;
			sheets: number;
			wastePercentage: number;
		}[] = [];

		for (const depth of [0, 1, 2, 3]) {
			const start = performance.now();
			const result = optimize({
				sheetTemplate: standardSheet,
				panels: structuredClone(panels),
				bladeThickness: standardBlade,
				depth,
				allowRotation: true,
			});
			const durationMs = performance.now() - start;

			expect(typeof result).toBe("object");
			if (typeof result !== "string") {
				assertValidLayout(result, panels, standardSheet, standardBlade, true);

				depthResults.push({
					depth,
					durationMs,
					fittings: result.fittings,
					sheets: result.sheets.length,
					wastePercentage: result.wastePercentage,
				});
			}
		}

		// Performance regression thresholds with headroom for CI / system load
		expect(depthResults[0].durationMs).toBeLessThan(100);
		expect(depthResults[1].durationMs).toBeLessThan(250);
		expect(depthResults[2].durationMs).toBeLessThan(1000);
		expect(depthResults[3].durationMs).toBeLessThan(4000);

		// Fittings count should strictly increase with depth exploration
		expect(depthResults[1].fittings).toBeGreaterThan(depthResults[0].fittings);
		expect(depthResults[2].fittings).toBeGreaterThan(depthResults[1].fittings);
		expect(depthResults[3].fittings).toBeGreaterThan(depthResults[2].fittings);
	});

	it("should scale predictably as panel count increases (10, 25, 50 panels)", () => {
		const baseSizes = [
			{ l: 1000, w: 500 },
			{ l: 800, w: 400 },
			{ l: 600, w: 450 },
			{ l: 500, w: 300 },
			{ l: 750, w: 350 },
			{ l: 900, w: 600 },
			{ l: 400, w: 300 },
		];

		const generatePanels = (count: number): PanelTemplate[] => {
			return Array.from({ length: count }, (_, i) => {
				const size = baseSizes[i % baseSizes.length];
				return createPanel(size.l, size.w);
			});
		};

		const testSizes = [10, 25, 50];
		const scalingMetrics: {
			count: number;
			durationMs: number;
			panelsPerSec: number;
		}[] = [];

		for (const count of testSizes) {
			const panels = generatePanels(count);
			const start = performance.now();
			const result = optimize({
				sheetTemplate: standardSheet,
				panels: structuredClone(panels),
				bladeThickness: standardBlade,
				depth: 1,
				allowRotation: true,
			});
			const durationMs = performance.now() - start;

			expect(typeof result).toBe("object");
			if (typeof result !== "string") {
				assertValidLayout(result, panels, standardSheet, standardBlade, true);
				const panelsPerSec = (count / durationMs) * 1000;
				scalingMetrics.push({ count, durationMs, panelsPerSec });
			}
		}

		// 10 panels should complete in < 250ms
		expect(scalingMetrics[0].durationMs).toBeLessThan(250);

		// 25 panels should complete in < 1000ms
		expect(scalingMetrics[1].durationMs).toBeLessThan(1000);

		// 50 panels should complete in < 3000ms
		expect(scalingMetrics[2].durationMs).toBeLessThan(3000);
	});

	it("should benchmark rotation overhead comparing allowRotation true vs false", () => {
		const panels = [
			createPanel(1200, 500),
			createPanel(1100, 450),
			createPanel(900, 400),
			createPanel(800, 600),
			createPanel(700, 350),
			createPanel(600, 400),
			createPanel(500, 300),
			createPanel(750, 450),
		];

		const startNoRot = performance.now();
		const resNoRot = optimize({
			sheetTemplate: standardSheet,
			panels: structuredClone(panels),
			bladeThickness: standardBlade,
			depth: 2,
			allowRotation: false,
		});
		const durationNoRot = performance.now() - startNoRot;

		const startRot = performance.now();
		const resRot = optimize({
			sheetTemplate: standardSheet,
			panels: structuredClone(panels),
			bladeThickness: standardBlade,
			depth: 2,
			allowRotation: true,
		});
		const durationRot = performance.now() - startRot;

		expect(typeof resNoRot).toBe("object");
		expect(typeof resRot).toBe("object");

		if (typeof resNoRot !== "string" && typeof resRot !== "string") {
			assertValidLayout(resNoRot, panels, standardSheet, standardBlade, false);
			assertValidLayout(resRot, panels, standardSheet, standardBlade, true);

			// Both should complete well under 400ms
			expect(durationNoRot).toBeLessThan(400);
			expect(durationRot).toBeLessThan(400);

			// With rotation enabled, more variants and fittings are evaluated
			expect(resRot.fittings).toBeGreaterThanOrEqual(resNoRot.fittings);
		}
	});

	it("should efficiently optimize a realistic commercial cabinetry cutting order", () => {
		// Realistic complete kitchen cabinet batch (24 parts)
		const cabinetOrder: PanelTemplate[] = [
			// 4 Base cabinet sides
			createPanel(720, 560),
			createPanel(720, 560),
			createPanel(720, 560),
			createPanel(720, 560),
			// 4 Base cabinet tops/bottoms
			createPanel(564, 560),
			createPanel(564, 560),
			createPanel(564, 560),
			createPanel(564, 560),
			// 6 Internal shelves
			createPanel(564, 530),
			createPanel(564, 530),
			createPanel(564, 530),
			createPanel(564, 530),
			createPanel(564, 530),
			createPanel(564, 530),
			// 2 Tall larder sides
			createPanel(2040, 560),
			createPanel(2040, 560),
			// 4 Drawer fronts
			createPanel(176, 596),
			createPanel(176, 596),
			createPanel(176, 596),
			createPanel(176, 596),
			// 4 Base plinths / service rails
			createPanel(900, 100),
			createPanel(900, 100),
			createPanel(900, 100),
			createPanel(900, 100),
		];

		const start = performance.now();
		const result = optimize({
			sheetTemplate: standardSheet,
			panels: structuredClone(cabinetOrder),
			bladeThickness: standardBlade,
			depth: 2,
			allowRotation: true,
		});
		const duration = performance.now() - start;

		expect(typeof result).toBe("object");
		if (typeof result !== "string") {
			assertValidLayout(
				result,
				cabinetOrder,
				standardSheet,
				standardBlade,
				true,
			);

			// Full realistic 24-piece cabinet batch with depth 2 should optimize well within 1500ms
			expect(duration).toBeLessThan(1500);

			// Check that waste is reasonably low for packing 24 parts
			expect(result.wastePercentage).toBeLessThan(45);
		}
	});

	it("should maintain steady throughput under rapid repeated optimization runs", () => {
		// Simulates user rapidly toggling settings or dragging sliders
		const panels = [
			createPanel(800, 400),
			createPanel(600, 300),
			createPanel(500, 500),
			createPanel(700, 350),
		];

		const iterations = 50;
		const start = performance.now();

		for (let i = 0; i < iterations; i++) {
			const res = optimize({
				sheetTemplate: standardSheet,
				panels: structuredClone(panels),
				bladeThickness: 3,
				depth: 1,
				allowRotation: i % 2 === 0,
			});
			expect(typeof res).toBe("object");
		}

		const totalDuration = performance.now() - start;
		const averagePerRun = totalDuration / iterations;

		// Average run time across 50 iterations should be < 20ms per run
		expect(averagePerRun).toBeLessThan(20);
	});
});
