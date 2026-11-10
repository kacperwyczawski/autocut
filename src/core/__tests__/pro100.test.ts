import { describe, expect, it } from "bun:test";
import { parsePro100 } from "../pro100";

describe("PRO100 Parser (tab-separated)", () => {
	it("should parse standard PRO100 tab-separated lines with edge banding and ignored material", () => {
		const input = [
			"BOK\t800\t-\t800\t\t18\t1\tKolory\\biały mat",
			"BOK\t400\t=\t823\t-\t18\t2\tKolory\\biały mat",
		].join("\n");

		const result = parsePro100(input);
		expect(result).toHaveLength(2);

		// First item: 800x800, 1 side on dim1 (-), 0 sides on dim2 (), qty 1
		expect(result[0].panel.length).toBe(800);
		expect(result[0].panel.width).toBe(800);
		expect(result[0].panel.edgeReduction.top).toBe(true);
		expect(result[0].panel.edgeReduction.bottom).toBe(false);
		expect(result[0].panel.edgeReduction.left).toBe(false);
		expect(result[0].panel.edgeReduction.right).toBe(false);
		expect(result[0].quantity).toBe(1);

		// Second item: 400x823, 2 sides on dim1 (=), 1 side on dim2 (-), qty 2
		expect(result[1].panel.length).toBe(400);
		expect(result[1].panel.width).toBe(823);
		expect(result[1].panel.edgeReduction.top).toBe(true);
		expect(result[1].panel.edgeReduction.bottom).toBe(true);
		expect(result[1].panel.edgeReduction.left).toBe(true);
		expect(result[1].panel.edgeReduction.right).toBe(false);
		expect(result[1].quantity).toBe(2);
	});

	it("should ignore table headers gracefully", () => {
		const input = [
			"Nazwa\tDługość\tOkleina 1\tSzerokość\tOkleina 2\tGrubość\tIlość\tMateriał",
			"Półka\t560\t\t300\t-\t18\t4\tDąb Sonoma",
		].join("\n");

		const result = parsePro100(input);
		expect(result).toHaveLength(1);
		expect(result[0].panel.length).toBe(560);
		expect(result[0].panel.width).toBe(300);
		expect(result[0].panel.edgeReduction.top).toBe(false);
		expect(result[0].panel.edgeReduction.left).toBe(true);
		expect(result[0].quantity).toBe(4);
	});

	it("should support European comma as decimal separator", () => {
		const input = "Wieniec\t564,5\t-\t560\t=\t18\t3\tBiały";
		const result = parsePro100(input);
		expect(result).toHaveLength(1);
		expect(result[0].panel.length).toBe(564.5);
		expect(result[0].panel.width).toBe(560);
		expect(result[0].quantity).toBe(3);
	});

	it("should apply default edge reduction thickness", () => {
		const input = "Front\t716\t=\t596\t=\t18\t1\tMDF";
		const result = parsePro100(input, { defaultEdgeThickness: 2 });
		expect(result[0].panel.edgeReduction.thickness).toBe(2);
	});

	it("should merge identical panels by summing their quantities", () => {
		const input = [
			"BOK\t800\t-\t800\t\t18\t2\tKolory\\biały mat",
			"BOK\t800\t-\t800\t\t18\t3\tInny materiał",
		].join("\n");

		const result = parsePro100(input);
		expect(result).toHaveLength(1);
		expect(result[0].quantity).toBe(5);
	});

	it("should recognize Unicode dash variants like en-dash, em-dash, and minus", () => {
		const input = [
			"BOK\t720\t–\t560\t=\t18\t1\tDąb", // en-dash (U+2013) & '='
			"Wieniec\t600\t−\t400\t—\t18\t2\tBiały", // minus (U+2212) & em-dash (U+2014)
		].join("\n");

		const result = parsePro100(input);
		expect(result).toHaveLength(2);

		// First item: 1 edge on dim1 (en-dash), 2 edges on dim2 (=)
		expect(result[0].panel.edgeReduction.top).toBe(true);
		expect(result[0].panel.edgeReduction.bottom).toBe(false);
		expect(result[0].panel.edgeReduction.left).toBe(true);
		expect(result[0].panel.edgeReduction.right).toBe(true);

		// Second item: 1 edge on dim1 (minus sign), 1 edge on dim2 (em-dash)
		expect(result[1].panel.edgeReduction.top).toBe(true);
		expect(result[1].panel.edgeReduction.bottom).toBe(false);
		expect(result[1].panel.edgeReduction.left).toBe(true);
		expect(result[1].panel.edgeReduction.right).toBe(false);
	});
});
