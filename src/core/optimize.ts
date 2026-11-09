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
 * 2D Guillotine Bin Packing with Best Short Side Fit (BSSF) and Lookahead Beam Search.
 *
 * Algorithm architecture:
 * 1. Best-Fit Decreasing (BFD) ordering: Largest panels are processed first.
 * 2. Best Short Side Fit (BSSF): Selects the tightest fitting free rectangle to minimize sliver waste.
 * 3. Guillotine partitioning: Cuts rectangles orthogonally, creating valid guillotine saw cuts.
 * 4. Bounded Beam Search: Uses depth to look ahead over upcoming panels while pruning unpromising branches,
 *    preventing exponential combinatorial explosion.
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

	const startTime = performance.now();

	// Sort panels in descending order: largest items first (Best-Fit Decreasing)
	if (allowRotation) {
		panels.sort((a, b) => {
			const maxA = Math.max(a.length, a.width);
			const maxB = Math.max(b.length, b.width);
			if (maxA !== maxB) {
				return maxB - maxA;
			}
			const minA = Math.min(a.length, a.width);
			const minB = Math.min(b.length, b.width);
			return minB - minA;
		});
	} else {
		panels.sort((a, b) =>
			a.length === b.length ? b.width - a.width : b.length - a.length,
		);
	}

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
						fittings++;
						hasExistingFit = true;

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
									}
								: variant.baseFit,
						});
					}

					// Option to place on a new sheet
					if (
						orientedPanel.length <= newSheetSpace.length &&
						orientedPanel.width <= newSheetSpace.width
					) {
						// In greedy mode, only open a new sheet if it doesn't fit on existing sheets.
						// In lookahead mode, also consider opening a new sheet.
						if (!hasExistingFit || searchDepth > 0) {
							fittings++;
							const newData = generateNewSpacesAndCuts(
								newSheetSpace,
								orientedPanel,
								bladeThickness,
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
										}
									: variant.baseFit,
							});
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

		if (progressCallback) {
			progressCallback(panelIndex + 1, panels.length);
		}
	}

	const endTime = performance.now();
	return {
		sheets,
		bladeThickness,
		wastePercentage: getWastePercentage(sheets),
		time: endTime - startTime,
		fittings,
	};
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
): {
	freeSpaces: FreeSpace[];
	cuts: Cut[];
} {
	const freeSpaces: FreeSpace[] = [];
	const cuts: Cut[] = [];

	if (oldFit.length === panel.length && oldFit.width === panel.width) {
		// Exact fit
	} else if (oldFit.length === panel.length) {
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
	} else {
		// Panel is smaller in both dimensions.
		// Guillotine horizontal cut across full length, vertical cut for panel strip.
		const remainingLength = oldFit.length - panel.length - bladeThickness;
		if (remainingLength > 0) {
			freeSpaces.push({
				x: oldFit.x + panel.length + bladeThickness,
				y: oldFit.y,
				length: remainingLength,
				width: panel.width,
			});
		}

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

		cuts.push({
			x: oldFit.x + panel.length,
			y: oldFit.y,
			length: panel.width,
			direction: "vertical",
		});
	}

	return {
		freeSpaces,
		cuts,
	};
}

function compareVariants(a: Variant, b: Variant): number {
	if (a.sheets.length !== b.sheets.length) {
		return a.sheets.length - b.sheets.length;
	}

	const aCutCount = a.sheets.reduce((acc, s) => acc + s.cuts.length, 0);
	const bCutCount = b.sheets.reduce((acc, s) => acc + s.cuts.length, 0);
	if (aCutCount !== bCutCount) {
		return aCutCount - bCutCount;
	}

	const aCutLength = a.sheets.reduce(
		(acc, s) => acc + s.cuts.reduce((sum, c) => sum + c.length, 0),
		0,
	);
	const bCutLength = b.sheets.reduce(
		(acc, s) => acc + s.cuts.reduce((sum, c) => sum + c.length, 0),
		0,
	);
	if (aCutLength !== bCutLength) {
		return aCutLength - bCutLength;
	}

	const aFreeQuality = a.sheets.reduce(
		(acc, s) =>
			acc + s.freeSpaces.reduce((sum, f) => sum + (f.length * f.width) ** 2, 0),
		0,
	);
	const bFreeQuality = b.sheets.reduce(
		(acc, s) =>
			acc + s.freeSpaces.reduce((sum, f) => sum + (f.length * f.width) ** 2, 0),
		0,
	);
	return bFreeQuality - aFreeQuality;
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
	  }
	| ({
			panel: PanelTemplate;
	  } & FreeSpace);

type Variant = {
	sheets: sheet[];
	baseFit: BaseFit;
};
