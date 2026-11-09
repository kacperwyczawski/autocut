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

export function optimize(
	request: OptimizationRequest,
	progressCallback?: (placedPanels: number, totalPanels: number) => void,
): OptimizationResult {
	const {
		sheetTemplate,
		panels,
		bladeThickness,
		depth,
		allowRotation = true,
	} = request;
	const validationError = validatePanels(panels, sheetTemplate, allowRotation);
	if (validationError) {
		return validationError;
	}

	const startTime = performance.now();
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

	// TODO: apply edge reduction for panels
	const sheets: sheet[] = [];
	let fittings = 0;
	for (let panelIndex = 0; panelIndex < panels.length; panelIndex++) {
		const generations: Generation[] = [];
		for (let i = 0; i <= depth; i++) {
			const currentPanel = panels[panelIndex + i];
			if (!currentPanel) {
				break;
			}
			const { nextGeneration, fittings: additionalFittings } =
				generateNextGeneration(
					generations[i - 1] ?? [
						{
							sheets: sheets,
						},
					],
					currentPanel,
					i === 0,
					bladeThickness,
					sheetTemplate,
					allowRotation,
				);
			fittings += additionalFittings;
			generations[i] = nextGeneration;
			if (nextGeneration.length === 1) {
				break;
			}
		}
		const bestFit = getBestVariant(generations[generations.length - 1]).baseFit;
		if ("sheetIndex" in bestFit) {
			sheets[bestFit.sheetIndex].panels.push({
				template: bestFit.panel,
				x: sheets[bestFit.sheetIndex].freeSpaces[bestFit.freeSpaceIndex].x,
				y: sheets[bestFit.sheetIndex].freeSpaces[bestFit.freeSpaceIndex].y,
			});
			const newData = generateNewSpacesAndCuts(
				sheets[bestFit.sheetIndex].freeSpaces[bestFit.freeSpaceIndex],
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
		sheets: sheets,
		bladeThickness,
		wastePercentage: getWastePercentage(sheets),
		time: endTime - startTime,
		fittings: fittings,
	};
}

function generateNextGeneration(
	previousGeneration: Generation,
	currentPanel: PanelTemplate,
	isFirstGeneration: boolean,
	bladeThickness: number,
	sheetTemplate: SheetTemplate,
	allowRotation = true,
): {
	nextGeneration: Generation;
	fittings: number;
} {
	const nextGeneration: Generation = [];
	let fittings = 0;

	const orientations =
		allowRotation && currentPanel.length !== currentPanel.width
			? [currentPanel, rotatePanel(currentPanel)]
			: [currentPanel];

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

	for (const previousVariant of previousGeneration) {
		for (const panelToPlace of orientations) {
			const fits = findFits(previousVariant.sheets, panelToPlace);
			for (const fit of fits) {
				// place on existing sheet, in free space
				fittings++;
				const newSheets = structuredClone(previousVariant.sheets);
				newSheets[fit.sheetIndex].panels.push({
					template: panelToPlace,
					x: newSheets[fit.sheetIndex].freeSpaces[fit.freeSpaceIndex].x,
					y: newSheets[fit.sheetIndex].freeSpaces[fit.freeSpaceIndex].y,
				});
				const newData = generateNewSpacesAndCuts(
					newSheets[fit.sheetIndex].freeSpaces[fit.freeSpaceIndex],
					panelToPlace,
					bladeThickness,
				);
				newSheets[fit.sheetIndex].freeSpaces.splice(
					fit.freeSpaceIndex,
					1,
					...newData.freeSpaces,
				);
				newSheets[fit.sheetIndex].cuts.push(...newData.cuts);
				nextGeneration.push({
					sheets: newSheets,
					baseFit: isFirstGeneration
						? {
								panel: panelToPlace,
								sheetIndex: fit.sheetIndex,
								freeSpaceIndex: fit.freeSpaceIndex,
							}
						: previousVariant.baseFit,
				});
			}

			// place on new sheet
			if (
				panelToPlace.length <= newSheetSpace.length &&
				panelToPlace.width <= newSheetSpace.width
			) {
				fittings++;
				const newData = generateNewSpacesAndCuts(
					newSheetSpace,
					panelToPlace,
					bladeThickness,
				);
				const newSheet: sheet = {
					template: { ...sheetTemplate },
					panels: [
						{
							template: panelToPlace,
							x: newSheetSpace.x,
							y: newSheetSpace.y,
						},
					],
					cuts: newData.cuts,
					freeSpaces: newData.freeSpaces,
				};
				nextGeneration.push({
					sheets: [...previousVariant.sheets, newSheet],
					baseFit: isFirstGeneration
						? {
								panel: panelToPlace,
								...newSheetSpace,
							}
						: previousVariant.baseFit,
				});
			}
		}
	}
	return {
		nextGeneration,
		fittings: fittings,
	};
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

function findFits(
	sheets: sheet[],
	panel: PanelTemplate,
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
		// panel fits perfectly 👌
		// so no new free rectangles
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

		const newCut: Cut = {
			x: oldFit.x,
			y: oldFit.y + panel.width,
			length: oldFit.length,
			direction: "horizontal",
		};
		cuts.push(newCut);
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

		const newCut: Cut = {
			x: oldFit.x + panel.length,
			y: oldFit.y,
			length: oldFit.width,
			direction: "vertical",
		};
		cuts.push(newCut);
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

		const newHorizontalCut: Cut = {
			x: oldFit.x,
			y: oldFit.y + panel.width,
			length: oldFit.length,
			direction: "horizontal",
		};
		cuts.push(newHorizontalCut);

		const newVerticalCut: Cut = {
			x: oldFit.x + panel.length,
			y: oldFit.y,
			length: panel.width,
			direction: "vertical",
		};
		cuts.push(newVerticalCut);
	}
	return {
		freeSpaces,
		cuts,
	};
}

function getBestVariant(variants: Variant[]): Variant {
	return variants.sort((a, b) => {
		if (a.sheets.length !== b.sheets.length) {
			return a.sheets.length - b.sheets.length;
		}
		const aCutCount = a.sheets.reduce(
			(acc, sheet) => acc + sheet.cuts.length,
			0,
		);
		const bCutCount = b.sheets.reduce(
			(acc, sheet) => acc + sheet.cuts.length,
			0,
		);
		if (aCutCount !== bCutCount) {
			return aCutCount - bCutCount;
		}
		const aCutLength = a.sheets.reduce(
			(acc, sheet) =>
				acc + sheet.cuts.reduce((acc, cut) => acc + cut.length, 0),
			0,
		);
		const bCutLength = b.sheets.reduce(
			(acc, sheet) =>
				acc + sheet.cuts.reduce((acc, cut) => acc + cut.length, 0),
			0,
		);
		return aCutLength - bCutLength;
	})[0];
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

type Generation = Variant[];
