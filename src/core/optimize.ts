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
	console.debug("optimize");
	console.debug("panels:", panels);
	// deproxy panels
	panels = panels.map((panel) => ({ ...panel }));
	console.debug("panels:", panels);
	validatePanels(panels, sheet);
	const startTime = performance.now();
	// TODO: consider adding freeSpaces to optimizedSheet instead of using separate array
	const freeSpaces: FreeSpace[] = [];
	panels.sort((a, b) =>
		a.length === b.length ? b.width - a.width : b.length - a.length,
	);
	console.log(panels);
	// TODO: apply edge reduction
	const optimizedSheets: OptimizedSheet[] = [];
	console.debug("start");
	for (let panelIndex = 0; panelIndex < panels.length; panelIndex++) {
		// let fit = findBestFit(freeSpaces, panel);
		// if (!fit) {
		// 	// if no fit is found, create a new sheet
		// 	const newSheet: OptimizedSheet = {
		// 		sheet: { ...sheet },
		// 		panels: [],
		// 		cuts: [],
		// 	};
		// 	optimizedSheets.push(newSheet);
		// 	fit = {
		// 		x: 0,
		// 		y: 0,
		// 		length: sheet.length,
		// 		width: sheet.width,
		// 		sheet: newSheet,
		// 	};
		// } else {
		// 	// if fit is found, remove it from free rectangles
		// 	freeSpaces.splice(freeSpaces.indexOf(fit), 1);
		// }

		// fit.sheet.panels.push({
		// 	panel,
		// 	x: fit.x,
		// 	y: fit.y,
		// });

		// HERE WAS ADDING NEW FREE SPACES AND NEW CUTS. removed that bigass elif for clarity

		// passCount++;
		// console.info(
		// 	`Pass ${passCount}: waste: ${getWastePercentage(optimizedSheets)}%`,
		// );

		// TODO: local types for this: (variant and generation)
		let generations: {
			sheets: OptimizedSheet[];
			freeSpaces: FreeSpace[];
			baseFit: FreeSpace | DetachedFreeSpace;
		}[][] = [];
		console.debug(`panel: ${panels[panelIndex].length} x ${panels[panelIndex].width}`)
		console.debug("    initial free spaces: ", freeSpaces);
		console.debug("    initial optimized sheets: ", structuredClone(optimizedSheets));
		// TODO: abort when there is only one variant in generation 0
		for (let i = 0; i <= depth; i++) {
			const currentPanel = panels[panelIndex + i];
			if (!currentPanel) {
				break;
			}
			console.debug("        generation: ", i);
			// TODO: rotation possibility
			// TODO: setting to disable rotation
			const previousGeneration = generations[i - 1]
			?? [{
				sheets: optimizedSheets,
				freeSpaces,
			}];
			generations[i] = [];
			const nextGeneration = generations[i];
			for (const previousVariant of previousGeneration) {
				const fits = findFits(previousVariant.freeSpaces, currentPanel);
				for (const fit of fits) {
					console.debug("            variant: ", fits.indexOf(fit));
					const newOptimizedSheets = [...previousVariant.sheets];
					newOptimizedSheets[newOptimizedSheets.indexOf(fit.sheet)].panels.push({
						panel: currentPanel,
						x: fit.x,
						y: fit.y,
					});
					const newFreeSpaces = generateNewFreeSpaces(
						fit,
						currentPanel,
						bladeThickness,
					);
					newFreeSpaces.concat(previousVariant.freeSpaces.filter(
						(freeSpace) => freeSpace !== fit,
					));
					nextGeneration.push({
						sheets: newOptimizedSheets,
						freeSpaces: newFreeSpaces,
						baseFit: i === 0 ? fit : previousVariant.baseFit,
					});
				}
				console.debug("            variant: ", fits.length);
				const newOptimizedSheet: OptimizedSheet = {
					sheet: { ...sheet },
					panels: [],
					cuts: [],
				};
				const fit = {
					x: 0,
					y: 0,
					length: sheet.length,
					width: sheet.width,
					sheet: newOptimizedSheet,
				};
				newOptimizedSheet.panels.push({
					panel: currentPanel,
					x: 0, // TODO: sheet edge reduction
					y: 0,
				});
				const newFreeSpaces = generateNewFreeSpaces(
					fit,
					currentPanel,
					bladeThickness,
				);
				newFreeSpaces.concat(previousVariant.freeSpaces);
				nextGeneration.push({
					sheets: [...previousVariant.sheets, newOptimizedSheet],
					freeSpaces: newFreeSpaces,
					baseFit: i === 0 ? {
						x: 0,
						y: 0,
						length: sheet.length,
						width: sheet.width,
					} : previousVariant.baseFit,
				});
			}
		}
		console.debug("    generations: ", generations);
		const finalGeneration = generations[generations.length - 1]
		console.debug("    finalGeneration: ", finalGeneration);
		const bestVariant = finalGeneration.sort((a, b) => // TODO: abstract sorting functions
			// TODO: sort by cut count and cut total length
			a.sheets.length - b.sheets.length,
		)[0];
		console.debug("    bestVariant: ", bestVariant);
		const bestFit = bestVariant.baseFit;
		console.debug(`    bestFit: ${bestFit.x} x ${bestFit.y}`);
		console.debug("    bestFit: ", bestFit);
		if ("sheet" in bestFit) {
			// do nothing, because the sheet already exists
			console.debug("    provides sheet");
		} else {
			console.debug("    new sheet needed");
			const newOptimizedSheet = {
				sheet: structuredClone(sheet),
				panels: [],
				cuts: [],
			};
			optimizedSheets.push(newOptimizedSheet);
			const newFreeSpaces = generateNewFreeSpaces(
				{
					x: 0,
					y: 0,
					length: sheet.length,
					width: sheet.width,
					sheet: optimizedSheets[optimizedSheets.length - 1],
				},
				panels[panelIndex],
				bladeThickness,
			);
			freeSpaces.push(...newFreeSpaces);
		}
		console.debug("    optimizedSheets: ", optimizedSheets);
		console.debug("    freeSpaces: ", freeSpaces);
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

function findBestFit(freeSpaces: FreeSpace[], panel: Panel): FreeSpace | null {
	const sorted = freeSpaces.sort((a, b) =>
		a.width === b.width ? a.length - b.length : a.width - b.width,
	);
	return (
		sorted.find(
			(freeSpace) =>
				freeSpace.length >= panel.length && freeSpace.width >= panel.width,
		) ?? null
	);
}

function findFits(freeSpaces: FreeSpace[], panel: Panel): FreeSpace[] {
	return freeSpaces.filter(
		(freeSpace) =>
			freeSpace.length >= panel.length && freeSpace.width >= panel.width,
	).sort((a, b) =>
		a.width === b.width ? a.length - b.length : a.width - b.width,
	);
	
	// TODO: maybe sort when new are added
	// TODO: check if sorting by area is better
}

function generateNewFreeSpaces(oldFit: FreeSpace, panel: Panel, bladeThickness: number): FreeSpace[] {
	// TODO: yield return if it exists in JavaScript
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
		newFreeSpaceToTheRight.width = panel.width + bladeThickness;
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

type FreeSpace = {
	length: number;
	width: number;
	x: number;
	y: number;
	sheet: OptimizedSheet;
};

type DetachedFreeSpace = {
	length: number;
	width: number;
	x: number;
	y: number;
};