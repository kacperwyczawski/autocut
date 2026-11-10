import type { Cut } from "./cut";
import type { FreeSpace } from "./freeSpace";
import type { OptimizationRequest } from "./optimizationRequest";
import type { OptimizationResult } from "./optimizationResult";
import type { PanelTemplate } from "./panelTemplate";
import type { sheet } from "./sheet";
import type { SheetTemplate } from "./sheetTemplate";

export function rotatePanel(panel: PanelTemplate): PanelTemplate {
	return {
		length: panel.width,
		width: panel.length,
		edgeReduction: panel.edgeReduction
			? {
					top: panel.edgeReduction.left,
					right: panel.edgeReduction.top,
					bottom: panel.edgeReduction.right,
					left: panel.edgeReduction.bottom,
					thickness: panel.edgeReduction.thickness,
				}
			: {
					top: false,
					right: false,
					bottom: false,
					left: false,
					thickness: 0,
				},
	};
}

/**
 * 2D Guillotine Bin Packing with Multi-Pass Sorting (Area, Semi-Perimeter, Max-Span),
 * Dynamic Guillotine Cut Splitting, Best Short Side Fit (BSSF), and Lookahead Beam Search.
 *
 * Algorithm architecture:
 * 1. Multi-Pass Heuristics: Evaluates 3 distinct geometric sort orderings (Area, Semi-Perimeter, Max Span)
 *    to eliminate blind spots with high-aspect-ratio strips and bulky monolithic panels.
 * 2. Dynamic Cut Splitting: Evaluates both Horizontal-First and Vertical-First guillotine through-cuts,
 *    preserving the largest contiguous leftover offcuts for future panels.
 * 3. Best Short Side Fit (BSSF): Selects the tightest fitting free rectangle to minimize sliver waste.
 * 4. Bounded Beam Search: Uses searchDepth lookahead and bounded searchWidth to explore upcoming panels
 *    without exponential explosion.
 */
export function optimize(
	request: OptimizationRequest,
	progressCallback?: (placedPanels: number, totalPanels: number) => void,
): OptimizationResult {
	const {
		sheetTemplate,
		panels,
		bladeThickness,
		depth,
		searchDepth: explicitSearchDepth,
		searchWidth: explicitSearchWidth,
		allowRotation = true,
	} = request;

	const searchDepth = explicitSearchDepth ?? depth ?? 2;
	const searchWidth = explicitSearchWidth ?? (searchDepth === 0 ? 1 : 16);

	const validationError = validatePanels(panels, sheetTemplate, allowRotation);
	if (validationError) {
		return validationError;
	}

	if (panels.length === 0) {
		return "no panels to optimize";
	}

	const startTime = performance.now();

	// Generate candidate panel sequences across 3 complementary geometric sorting heuristics
	const uniqueOrders = getUniquePanelOrders(panels);
	const totalExpectedProgress = uniqueOrders.length * panels.length;
	let globalProgress = 0;

	let bestSheets: sheet[] | null = null;
	let totalFittings = 0;

	for (const order of uniqueOrders) {
		const { sheets, fittings } = runPackingPass(
			order,
			sheetTemplate,
			bladeThickness,
			searchDepth,
			searchWidth,
			allowRotation,
			() => {
				globalProgress++;
				if (progressCallback) {
					progressCallback(globalProgress, totalExpectedProgress);
				}
			},
		);

		totalFittings += fittings;

		if (!bestSheets || compareSheets(sheets, bestSheets) < 0) {
			bestSheets = sheets;
		}
	}

	const finalSheets = bestSheets ?? [];
	const endTime = performance.now();

	return {
		sheets: finalSheets,
		bladeThickness,
		wastePercentage: getWastePercentage(finalSheets),
		time: endTime - startTime,
		fittings: totalFittings,
	};
}

/**
 * Generates unique panel sort sequences across:
 * 1. Area Descending (DAF): Prioritizes large monolithic panels.
 * 2. Semi-Perimeter Descending (DPF): Linear $L + W$ scaling that balances bulk and span.
 * 3. Max Span Descending (DLSF): Prioritizes edge-to-edge spans (plinths, beams, trim).
 */
function getUniquePanelOrders(panels: PanelTemplate[]): PanelTemplate[][] {
	const sortByArea = (list: PanelTemplate[]) =>
		[...list].sort((a, b) => {
			const areaA = a.length * a.width;
			const areaB = b.length * b.width;
			if (areaA !== areaB) return areaB - areaA;
			const maxA = Math.max(a.length, a.width);
			const maxB = Math.max(b.length, b.width);
			if (maxA !== maxB) return maxB - maxA;
			return b.length - a.length;
		});

	const sortByPerimeter = (list: PanelTemplate[]) =>
		[...list].sort((a, b) => {
			const perimA = a.length + a.width;
			const perimB = b.length + b.width;
			if (perimA !== perimB) return perimB - perimA;
			const maxA = Math.max(a.length, a.width);
			const maxB = Math.max(b.length, b.width);
			if (maxA !== maxB) return maxB - maxA;
			return b.length - a.length;
		});

	const sortByMaxSpan = (list: PanelTemplate[]) =>
		[...list].sort((a, b) => {
			const maxA = Math.max(a.length, a.width);
			const maxB = Math.max(b.length, b.width);
			if (maxA !== maxB) return maxB - maxA;
			const minA = Math.min(a.length, a.width);
			const minB = Math.min(b.length, b.width);
			if (minA !== minB) return minB - minA;
			return b.length - a.length;
		});

	const strategies = [
		sortByArea(panels),
		sortByPerimeter(panels),
		sortByMaxSpan(panels),
	];

	// Deduplicate sequences that yield identical element orders
	const uniqueOrders: PanelTemplate[][] = [];
	for (const order of strategies) {
		const isDuplicate = uniqueOrders.some((existing) =>
			existing.every((p, i) => p === order[i]),
		);
		if (!isDuplicate) {
			uniqueOrders.push(order);
		}
	}

	return uniqueOrders;
}

function runPackingPass(
	panels: PanelTemplate[],
	sheetTemplate: SheetTemplate,
	bladeThickness: number,
	searchDepth: number,
	searchWidth: number,
	allowRotation: boolean,
	onPanelPlaced?: () => void,
): { sheets: sheet[]; fittings: number } {
	const sheets: sheet[] = [];
	let fittings = 0;

	const newSheetSpace: FreeSpace = {
		x: sheetTemplate.edgeReduction.left,
		y: sheetTemplate.edgeReduction.top,
		length:
			sheetTemplate.length -
			sheetTemplate.edgeReduction.left -
			sheetTemplate.edgeReduction.right,
		width:
			sheetTemplate.width -
			sheetTemplate.edgeReduction.top -
			sheetTemplate.edgeReduction.bottom,
	};

	for (let panelIndex = 0; panelIndex < panels.length; panelIndex++) {
		const lookaheadSteps = Math.min(
			searchDepth,
			panels.length - 1 - panelIndex,
		);
		let currentBeam: Variant[] = [
			{ sheets, baseFit: null as unknown as BaseFit },
		];

		for (let step = 0; step <= lookaheadSteps; step++) {
			const panelToPlace = panels[panelIndex + step];
			const isFirstGeneration = step === 0;
			const nextCandidates: Variant[] = [];

			const orientations =
				allowRotation && panelToPlace.length !== panelToPlace.width
					? [panelToPlace, rotatePanel(panelToPlace)]
					: [panelToPlace];

			for (const variant of currentBeam) {
				let hasExistingFit = false;

				for (const orientedPanel of orientations) {
					const fits = findFits(variant.sheets, orientedPanel);

					for (const fit of fits) {
						hasExistingFit = true;
						const space =
							variant.sheets[fit.sheetIndex].freeSpaces[fit.freeSpaceIndex];
						const splitDirections: ("horizontal" | "vertical")[] =
							space.length > orientedPanel.length &&
							space.width > orientedPanel.width
								? ["horizontal", "vertical"]
								: ["horizontal"];

						for (const splitDirection of splitDirections) {
							fittings++;
							const newSheets = cloneSheets(variant.sheets);
							const chosenSpace =
								newSheets[fit.sheetIndex].freeSpaces[fit.freeSpaceIndex];

							newSheets[fit.sheetIndex].panels.push({
								template: orientedPanel,
								x: chosenSpace.x,
								y: chosenSpace.y,
							});

							const newData = generateNewSpacesAndCuts(
								chosenSpace,
								orientedPanel,
								bladeThickness,
								splitDirection,
							);

							newSheets[fit.sheetIndex].freeSpaces.splice(
								fit.freeSpaceIndex,
								1,
								...newData.freeSpaces,
							);
							newSheets[fit.sheetIndex].cuts.push(...newData.cuts);

							nextCandidates.push({
								sheets: newSheets,
								baseFit: isFirstGeneration
									? {
											panel: orientedPanel,
											sheetIndex: fit.sheetIndex,
											freeSpaceIndex: fit.freeSpaceIndex,
											splitDirection,
										}
									: variant.baseFit,
							});
						}
					}

					// Option to place on a new sheet
					if (
						orientedPanel.length <= newSheetSpace.length &&
						orientedPanel.width <= newSheetSpace.width
					) {
						if (!hasExistingFit || searchDepth > 0) {
							const splitDirections: ("horizontal" | "vertical")[] =
								newSheetSpace.length > orientedPanel.length &&
								newSheetSpace.width > orientedPanel.width
									? ["horizontal", "vertical"]
									: ["horizontal"];

							for (const splitDirection of splitDirections) {
								fittings++;
								const newData = generateNewSpacesAndCuts(
									newSheetSpace,
									orientedPanel,
									bladeThickness,
									splitDirection,
								);
								const newSheet: sheet = {
									template: { ...sheetTemplate },
									panels: [
										{
											template: orientedPanel,
											x: newSheetSpace.x,
											y: newSheetSpace.y,
										},
									],
									cuts: newData.cuts,
									freeSpaces: newData.freeSpaces,
								};

								nextCandidates.push({
									sheets: [...cloneSheets(variant.sheets), newSheet],
									baseFit: isFirstGeneration
										? {
												panel: orientedPanel,
												...newSheetSpace,
												splitDirection,
											}
										: variant.baseFit,
								});
							}
						}
					}
				}
			}

			if (nextCandidates.length === 0) {
				break;
			}

			nextCandidates.sort(compareVariants);
			currentBeam = nextCandidates.slice(0, searchWidth);
		}

		// Choose best variant from horizon and commit root action
		const bestVariant = currentBeam[0];
		const bestFit = bestVariant.baseFit;

		if ("sheetIndex" in bestFit) {
			const targetSpace =
				sheets[bestFit.sheetIndex].freeSpaces[bestFit.freeSpaceIndex];
			sheets[bestFit.sheetIndex].panels.push({
				template: bestFit.panel,
				x: targetSpace.x,
				y: targetSpace.y,
			});
			const newData = generateNewSpacesAndCuts(
				targetSpace,
				bestFit.panel,
				bladeThickness,
				bestFit.splitDirection,
			);
			sheets[bestFit.sheetIndex].freeSpaces.splice(
				bestFit.freeSpaceIndex,
				1,
				...newData.freeSpaces,
			);
			sheets[bestFit.sheetIndex].cuts.push(...newData.cuts);
		} else {
			const newData = generateNewSpacesAndCuts(
				bestFit,
				bestFit.panel,
				bladeThickness,
				bestFit.splitDirection,
			);
			const newSheet: sheet = {
				template: structuredClone(sheetTemplate),
				panels: [
					{
						template: bestFit.panel,
						x: bestFit.x,
						y: bestFit.y,
					},
				],
				cuts: newData.cuts,
				freeSpaces: newData.freeSpaces,
			};
			sheets.push(newSheet);
		}

		if (onPanelPlaced) {
			onPanelPlaced();
		}
	}

	return { sheets, fittings };
}

function cloneSheets(sheets: sheet[]): sheet[] {
	return sheets.map((s) => ({
		template: s.template,
		panels: [...s.panels],
		cuts: [...s.cuts],
		freeSpaces: [...s.freeSpaces],
	}));
}

/**
 * Best Short Side Fit (BSSF) with Best Long Side Fit (BLSF) tie-breaker.
 * Standard heuristic for 2D Guillotine Bin Packing (Jylänki et al.)
 */
function findFits(
	sheets: sheet[],
	panel: PanelTemplate,
): {
	sheetIndex: number;
	freeSpaceIndex: number;
	shortSideFit: number;
	longSideFit: number;
}[] {
	const fits: {
		sheetIndex: number;
		freeSpaceIndex: number;
		shortSideFit: number;
		longSideFit: number;
	}[] = [];

	for (let sheetIndex = 0; sheetIndex < sheets.length; sheetIndex++) {
		const sheet = sheets[sheetIndex];
		for (
			let freeSpaceIndex = 0;
			freeSpaceIndex < sheet.freeSpaces.length;
			freeSpaceIndex++
		) {
			const space = sheet.freeSpaces[freeSpaceIndex];
			if (space.length >= panel.length && space.width >= panel.width) {
				const lengthRemainder = space.length - panel.length;
				const widthRemainder = space.width - panel.width;
				const shortSideFit = Math.min(lengthRemainder, widthRemainder);
				const longSideFit = Math.max(lengthRemainder, widthRemainder);

				fits.push({
					sheetIndex,
					freeSpaceIndex,
					shortSideFit,
					longSideFit,
				});
			}
		}
	}

	return fits.sort((a, b) => {
		if (a.shortSideFit !== b.shortSideFit) {
			return a.shortSideFit - b.shortSideFit;
		}
		return a.longSideFit - b.longSideFit;
	});
}

function generateNewSpacesAndCuts(
	oldFit: FreeSpace,
	panel: PanelTemplate,
	bladeThickness: number,
	splitDirection: "horizontal" | "vertical" = "horizontal",
): {
	freeSpaces: FreeSpace[];
	cuts: Cut[];
} {
	const freeSpaces: FreeSpace[] = [];
	const cuts: Cut[] = [];

	if (oldFit.length === panel.length && oldFit.width === panel.width) {
		// Exact fit - no cuts needed
	} else if (oldFit.length === panel.length) {
		// Matches length: only 1 horizontal cut needed
		const remainingWidth = oldFit.width - panel.width - bladeThickness;
		if (remainingWidth > 0) {
			freeSpaces.push({
				x: oldFit.x,
				y: oldFit.y + panel.width + bladeThickness,
				length: oldFit.length,
				width: remainingWidth,
			});
		}

		cuts.push({
			x: oldFit.x,
			y: oldFit.y + panel.width,
			length: oldFit.length,
			direction: "horizontal",
		});
	} else if (oldFit.width === panel.width) {
		// Matches width: only 1 vertical cut needed
		const remainingLength = oldFit.length - panel.length - bladeThickness;
		if (remainingLength > 0) {
			freeSpaces.push({
				x: oldFit.x + panel.length + bladeThickness,
				y: oldFit.y,
				length: remainingLength,
				width: oldFit.width,
			});
		}

		cuts.push({
			x: oldFit.x + panel.length,
			y: oldFit.y,
			length: oldFit.width,
			direction: "vertical",
		});
	} else if (splitDirection === "vertical") {
		// Panel is smaller in both dimensions: VERTICAL through-cut first
		cuts.push({
			x: oldFit.x + panel.length,
			y: oldFit.y,
			length: oldFit.width,
			direction: "vertical",
		});

		cuts.push({
			x: oldFit.x,
			y: oldFit.y + panel.width,
			length: panel.length,
			direction: "horizontal",
		});

		// Remnant 1: Below the panel (within left strip)
		const remainingWidth = oldFit.width - panel.width - bladeThickness;
		if (remainingWidth > 0) {
			freeSpaces.push({
				x: oldFit.x,
				y: oldFit.y + panel.width + bladeThickness,
				length: panel.length,
				width: remainingWidth,
			});
		}

		// Remnant 2: Right of the left strip (full width)
		const remainingLength = oldFit.length - panel.length - bladeThickness;
		if (remainingLength > 0) {
			freeSpaces.push({
				x: oldFit.x + panel.length + bladeThickness,
				y: oldFit.y,
				length: remainingLength,
				width: oldFit.width,
			});
		}
	} else {
		// Panel is smaller in both dimensions: HORIZONTAL through-cut first
		cuts.push({
			x: oldFit.x,
			y: oldFit.y + panel.width,
			length: oldFit.length,
			direction: "horizontal",
		});

		cuts.push({
			x: oldFit.x + panel.length,
			y: oldFit.y,
			length: panel.width,
			direction: "vertical",
		});

		// Remnant 1: Right of the panel (within top strip)
		const remainingLength = oldFit.length - panel.length - bladeThickness;
		if (remainingLength > 0) {
			freeSpaces.push({
				x: oldFit.x + panel.length + bladeThickness,
				y: oldFit.y,
				length: remainingLength,
				width: panel.width,
			});
		}

		// Remnant 2: Below the top strip (full length)
		const remainingWidth = oldFit.width - panel.width - bladeThickness;
		if (remainingWidth > 0) {
			freeSpaces.push({
				x: oldFit.x,
				y: oldFit.y + panel.width + bladeThickness,
				length: oldFit.length,
				width: remainingWidth,
			});
		}
	}

	return {
		freeSpaces,
		cuts,
	};
}

function compareSheets(a: sheet[], b: sheet[]): number {
	if (a.length !== b.length) {
		return a.length - b.length;
	}

	const aCutCount = a.reduce((acc, s) => acc + s.cuts.length, 0);
	const bCutCount = b.reduce((acc, s) => acc + s.cuts.length, 0);
	if (aCutCount !== bCutCount) {
		return aCutCount - bCutCount;
	}

	const aCutLength = a.reduce(
		(acc, s) => acc + s.cuts.reduce((sum, c) => sum + c.length, 0),
		0,
	);
	const bCutLength = b.reduce(
		(acc, s) => acc + s.cuts.reduce((sum, c) => sum + c.length, 0),
		0,
	);
	if (aCutLength !== bCutLength) {
		return aCutLength - bCutLength;
	}

	const aFreeQuality = a.reduce(
		(acc, s) =>
			acc + s.freeSpaces.reduce((sum, f) => sum + (f.length * f.width) ** 2, 0),
		0,
	);
	const bFreeQuality = b.reduce(
		(acc, s) =>
			acc + s.freeSpaces.reduce((sum, f) => sum + (f.length * f.width) ** 2, 0),
		0,
	);
	return bFreeQuality - aFreeQuality;
}

function compareVariants(a: Variant, b: Variant): number {
	return compareSheets(a.sheets, b.sheets);
}

function getWastePercentage(sheets: sheet[]) {
	const usedArea = sheets.reduce((acc, sheet) => {
		const panelArea = sheet.panels.reduce(
			(acc, panel) => acc + panel.template.length * panel.template.width,
			0,
		);
		return acc + panelArea;
	}, 0);
	const totalArea = sheets.reduce(
		(acc, sheet) => acc + sheet.template.length * sheet.template.width,
		0,
	);
	return 100 - (usedArea / totalArea) * 100;
}

function validatePanels(
	panels: PanelTemplate[],
	sheet: SheetTemplate,
	allowRotation = true,
):
	| "at least one panel is bigger than the sheet"
	| "no panels to optimize"
	| undefined {
	if (panels.length === 0) {
		return "no panels to optimize";
	}

	const usableLength =
		sheet.length - sheet.edgeReduction.left - sheet.edgeReduction.right;
	const usableWidth =
		sheet.width - sheet.edgeReduction.top - sheet.edgeReduction.bottom;

	const hasTooBigPanel = panels.some((panel) => {
		const fitsNormal =
			panel.length <= usableLength && panel.width <= usableWidth;
		const fitsRotated =
			allowRotation &&
			panel.width <= usableLength &&
			panel.length <= usableWidth;
		return !fitsNormal && !fitsRotated;
	});

	if (hasTooBigPanel) {
		return "at least one panel is bigger than the sheet";
	}
}

type BaseFit =
	| {
			panel: PanelTemplate;
			sheetIndex: number;
			freeSpaceIndex: number;
			splitDirection: "horizontal" | "vertical";
	  }
	| ({
			panel: PanelTemplate;
			splitDirection: "horizontal" | "vertical";
	  } & FreeSpace);

type Variant = {
	sheets: sheet[];
	baseFit: BaseFit;
};
