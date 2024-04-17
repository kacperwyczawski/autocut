import { toRaw } from "vue";
import type { FreeSpace } from "./freeSpace";
import type { OptimizationResult } from "./optimizationResult";
import type { OptimizedSheet } from "./optimizedSheet";
import type { Panel } from "./panel";
import type { Sheet } from "./sheet";

export function optimize(
	sheet: Sheet,
	panels: Panel[],
	bladeThickness: number,
	depth: number,
): OptimizationResult {
	// biome-ignore list/style/noParameterAssign: panels needs to be free of Proxies
	panels = panels.map((panel) => toRaw(panel));
	validatePanels(panels, sheet);
	const startTime = performance.now();
	panels.sort((a, b) =>
		a.length === b.length ? b.width - a.width : b.length - a.length,
	);
	// TODO: apply edge reduction
	const optimizedSheets: OptimizedSheet[] = [];
	for (let panelIndex = 0; panelIndex < panels.length; panelIndex++) {
		const generations: Generation[] = [];
		// TODO: abort when there is only one variant in generation 0
		for (let i = 0; i <= depth; i++) {
			const currentPanel = panels[panelIndex + i];
			if (!currentPanel) {
				break;
			}
			// TODO: rotation possibility
			// TODO: setting to disable rotation
			const previousGeneration = generations[i - 1] ?? [
				{
					sheets: optimizedSheets,
				},
			];
			generations[i] = [];
			const nextGeneration = generations[i];
			for (const previousVariant of previousGeneration) {
				const fits = findFits(previousVariant.sheets, currentPanel);
				for (const fit of fits) {
					const newOptimizedSheets = structuredClone(previousVariant.sheets);
					newOptimizedSheets[fit.sheetIndex].panels.push({
						panel: currentPanel,
						x: newOptimizedSheets[fit.sheetIndex].freeSpaces[fit.freeSpaceIndex]
							.x,
						y: newOptimizedSheets[fit.sheetIndex].freeSpaces[fit.freeSpaceIndex]
							.y,
					});
					const newFreeSpaces = generateNewFreeSpaces(
						newOptimizedSheets[fit.sheetIndex].freeSpaces[fit.freeSpaceIndex],
						currentPanel,
						bladeThickness,
					);
					newOptimizedSheets[fit.sheetIndex].freeSpaces.splice(
						fit.freeSpaceIndex,
						1,
						...newFreeSpaces,
					);
					nextGeneration.push({
						sheets: newOptimizedSheets,
						baseFit: i === 0 ? fit : previousVariant.baseFit,
					});
				}
				const fit = {
					x: 0,
					y: 0,
					length: sheet.length,
					width: sheet.width,
				};
				const newOptimizedSheet: OptimizedSheet = {
					sheet: { ...sheet },
					panels: [],
					cuts: [],
					freeSpaces: generateNewFreeSpaces(fit, currentPanel, bladeThickness),
				};
				newOptimizedSheet.panels.push({
					panel: currentPanel,
					x: 0, // TODO: sheet edge reduction
					y: 0,
				});
				nextGeneration.push({
					sheets: [...previousVariant.sheets, newOptimizedSheet],
					baseFit:
						i === 0
							? {
									x: 0,
									y: 0,
									length: sheet.length,
									width: sheet.width,
							  }
							: previousVariant.baseFit,
				});
			}
		}
		const finalGeneration = generations[generations.length - 1];
		const bestVariant = finalGeneration.sort(
			(
				a,
				b, // TODO: abstract sorting functions
			) =>
				// TODO: sort by cut count and cut total length
				a.sheets.length - b.sheets.length,
		)[0];
		const bestFit = bestVariant.baseFit;
		if ("sheetIndex" in bestFit) {
			optimizedSheets[bestFit.sheetIndex].panels.push({
				panel: panels[panelIndex],
				x: optimizedSheets[bestFit.sheetIndex].freeSpaces[
					bestFit.freeSpaceIndex
				].x,
				y: optimizedSheets[bestFit.sheetIndex].freeSpaces[
					bestFit.freeSpaceIndex
				].y,
			});
			const newFreeSpaces = generateNewFreeSpaces(
				optimizedSheets[bestFit.sheetIndex].freeSpaces[bestFit.freeSpaceIndex],
				panels[panelIndex],
				bladeThickness,
			);
			optimizedSheets[bestFit.sheetIndex].freeSpaces.splice(
				bestFit.freeSpaceIndex,
				1,
				...newFreeSpaces,
			);
		} else {
			const newOptimizedSheet = {
				sheet: structuredClone(sheet),
				panels: [
					{
						panel: panels[panelIndex],
						x: bestFit.x,
						y: bestFit.y,
					},
				],
				cuts: [],
				freeSpaces: generateNewFreeSpaces(
					bestFit,
					panels[panelIndex],
					bladeThickness,
				),
			};
			optimizedSheets.push(newOptimizedSheet);
		}
	}
	const endTime = performance.now();
	return {
		sheets: optimizedSheets,
		bladeThickness,
		wastePercentage: getWastePercentage(optimizedSheets),
		time: endTime - startTime,
	};
}

function getWastePercentage(sheets: OptimizedSheet[]) {
	const usedArea = sheets.reduce((acc, sheet) => {
		const panelArea = sheet.panels.reduce(
			(acc, panel) => acc + panel.panel.length * panel.panel.width,
			0,
		);
		return acc + panelArea;
	}, 0);
	const totalArea = sheets.reduce(
		(acc, sheet) => acc + sheet.sheet.length * sheet.sheet.width,
		0,
	);
	return 100 - (usedArea / totalArea) * 100;
}

function validatePanels(panels: Panel[], sheet: Sheet) {
	if (
		panels.some(
			(panel) => panel.length > sheet.length || panel.width > sheet.width,
		)
	) {
		return "at least one panel is bigger than the sheet";
	}
	if (panels.length === 0) {
		return "no panels to optimize";
	}
}

function findFits(
	sheets: OptimizedSheet[],
	panel: Panel,
): {
	sheetIndex: number;
	freeSpaceIndex: number;
}[] {
	return sheets
		.flatMap((sheet, sheetIndex) =>
			sheet.freeSpaces.map((freeSpace, freeSpaceIndex) => ({
				sheetIndex,
				freeSpaceIndex,
				freeSpace,
			})),
		)
		.filter(
			(fit) =>
				fit.freeSpace.length >= panel.length &&
				fit.freeSpace.width >= panel.width,
		)
		.sort((a, b) =>
			a.freeSpace.width === b.freeSpace.width
				? a.freeSpace.length - b.freeSpace.length
				: a.freeSpace.width - b.freeSpace.width,
		);

	// TODO: maybe sort only when new are added, (insert in the right place)
	// TODO: check if sorting by area is better
}

function generateNewFreeSpaces(
	oldFit: FreeSpace,
	panel: Panel,
	bladeThickness: number,
): FreeSpace[] {
	const newFreeSpaces: FreeSpace[] = [];
	if (oldFit.length === panel.length && oldFit.width === panel.width) {
		// panel fits perfectly 👌
		// so no new free rectangles
		// TODO: Check if cuts are needed
	} else if (oldFit.length === panel.length) {
		const newFreeSpace = { ...oldFit };
		newFreeSpace.y = oldFit.y + panel.width + bladeThickness;
		newFreeSpace.width = oldFit.width - panel.width;
		newFreeSpaces.push(newFreeSpace);

		// TODO: reimplement cuts
		// const newCut: Cut = {
		// 	x: fit.x,
		// 	y: fit.y + panel.width,
		// 	length: fit.length,
		// 	direction: "horizontal",
		// };
		// fit.sheet.cuts.push(newCut);
	} else if (oldFit.width === panel.width) {
		const newFreeSpace = { ...oldFit };
		newFreeSpace.x = oldFit.x + panel.length + bladeThickness;
		newFreeSpace.length = oldFit.length - panel.length;
		newFreeSpaces.push(newFreeSpace);

		// const newCut: Cut = {
		// 	x: fit.x + panel.length,
		// 	y: fit.y,
		// 	length: fit.width,
		// 	direction: "vertical",
		// };
		// fit.sheet.cuts.push(newCut);
	} else {
		// panel is smaller than fit, so we need to create two new free rectangles and two new cuts

		// TODO: maybe change preference based on length/width ratio of sheet.
		// it would require changing the sort function of freeSpaces

		// for now prefer horizontal cut, like this:
		// +---+---+
		// | N |   | <- N = new panel
		// +---+---+
		// |       |
		// +---+---+

		// TODO: check both horizontal and vertical cuts

		const newFreeSpaceToTheRight = { ...oldFit };
		newFreeSpaceToTheRight.x = oldFit.x + panel.length + bladeThickness;
		newFreeSpaceToTheRight.length =
			oldFit.length - panel.length - bladeThickness;
		newFreeSpaceToTheRight.width = panel.width;
		newFreeSpaces.push(newFreeSpaceToTheRight);

		const newFreeSpaceBelow = { ...oldFit };
		newFreeSpaceBelow.y = oldFit.y + panel.width + bladeThickness;
		newFreeSpaceBelow.width = oldFit.width - panel.width - bladeThickness;
		newFreeSpaces.push(newFreeSpaceBelow);

		// const newHorizontalCut: Cut = {
		// 	x: fit.x,
		// 	y: fit.y + panel.width,
		// 	length: fit.length,
		// 	direction: "horizontal",
		// };
		// fit.sheet.cuts.push(newHorizontalCut);

		// const newVerticalCut: Cut = {
		// 	x: fit.x + panel.length,
		// 	y: fit.y,
		// 	length: panel.width + bladeThickness / 2,
		// 	direction: "vertical",
		// };
		// fit.sheet.cuts.push(newVerticalCut);
	}
	return newFreeSpaces;
}

type Variant = {
	sheets: OptimizedSheet[];
	baseFit:
		| {
				sheetIndex: number;
				freeSpaceIndex: number;
		  }
		| FreeSpace;
};

type Generation = Variant[];