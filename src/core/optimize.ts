import { toRaw } from "vue";
import type { Cut } from "./cut";
import type { FreeSpace } from "./freeSpace";
import type { OptimizationResult } from "./optimizationResult";
import type { PanelTemplate } from "./panelTemplate";
import type { sheet } from "./sheet";
import type { SheetTemplate } from "./sheetTemplate";

export function optimize(
	sheetTemplate: SheetTemplate,
	panels: PanelTemplate[],
	bladeThickness: number,
	depth: number,
): OptimizationResult {
	// biome-ignore lint/style/noParameterAssign: panels needs to be free of Proxies
	panels = panels.map((panel) => toRaw(panel));
	validatePanels(panels, sheetTemplate);
	const startTime = performance.now();
	panels.sort((a, b) =>
		a.length === b.length ? b.width - a.width : b.length - a.length,
	);
	// TODO: apply edge reduction
	const sheets: sheet[] = [];
	for (let panelIndex = 0; panelIndex < panels.length; panelIndex++) {
		const generations: Generation[] = [];
		for (let i = 0; i <= depth; i++) {
			const currentPanel = panels[panelIndex + i];
			if (!currentPanel) {
				break;
			}
			// TODO: rotation possibility
			// TODO: setting to disable rotation
			const previousGeneration = generations[i - 1] ?? [
				{
					sheets: sheets,
				},
			];
			generations[i] = [];
			const nextGeneration = generations[i];
			for (const previousVariant of previousGeneration) {
				const fits = findFits(previousVariant.sheets, currentPanel);
				for (const fit of fits) {
					// place on existing sheet, in free space
					const newSheets = structuredClone(previousVariant.sheets);
					newSheets[fit.sheetIndex].panels.push({
						template: currentPanel,
						x: newSheets[fit.sheetIndex].freeSpaces[fit.freeSpaceIndex].x,
						y: newSheets[fit.sheetIndex].freeSpaces[fit.freeSpaceIndex].y,
					});
					const newData = generateNewData(
						newSheets[fit.sheetIndex].freeSpaces[fit.freeSpaceIndex],
						currentPanel,
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
						baseFit: i === 0 ? fit : previousVariant.baseFit,
					});
				}
				// place on new sheet
				const fit = {
					x: 0,
					y: 0,
					length: sheetTemplate.length,
					width: sheetTemplate.width,
				};
				const newData = generateNewData(fit, currentPanel, bladeThickness);
				const newSheet: sheet = {
					template: { ...sheetTemplate },
					panels: [],
					cuts: newData.cuts,
					freeSpaces: newData.freeSpaces,
				};
				newSheet.panels.push({
					template: currentPanel,
					x: 0, // TODO: sheet edge reduction
					y: 0,
				});
				nextGeneration.push({
					sheets: [...previousVariant.sheets, newSheet],
					baseFit:
						i === 0
							? {
									x: 0,
									y: 0,
									length: sheetTemplate.length,
									width: sheetTemplate.width,
							  }
							: previousVariant.baseFit,
				});
			}
			if (nextGeneration.length === 1) {
				break;
			}
		}
		const bestFit = getBestVariant(generations[generations.length - 1]).baseFit;
		if ("sheetIndex" in bestFit) {
			sheets[bestFit.sheetIndex].panels.push({
				template: panels[panelIndex],
				x: sheets[bestFit.sheetIndex].freeSpaces[bestFit.freeSpaceIndex].x,
				y: sheets[bestFit.sheetIndex].freeSpaces[bestFit.freeSpaceIndex].y,
			});
			const newData = generateNewData(
				sheets[bestFit.sheetIndex].freeSpaces[bestFit.freeSpaceIndex],
				panels[panelIndex],
				bladeThickness,
			);
			sheets[bestFit.sheetIndex].freeSpaces.splice(
				bestFit.freeSpaceIndex,
				1,
				...newData.freeSpaces,
			);
			sheets[bestFit.sheetIndex].cuts.push(...newData.cuts);
		} else {
			const newData = generateNewData(
				bestFit,
				panels[panelIndex],
				bladeThickness,
			);
			const newSheet: sheet = {
				template: structuredClone(sheetTemplate),
				panels: [
					{
						template: panels[panelIndex],
						x: bestFit.x,
						y: bestFit.y,
					},
				],
				cuts: newData.cuts,
				freeSpaces: newData.freeSpaces,
			};
			sheets.push(newSheet);
		}
	}
	const endTime = performance.now();
	return {
		sheets: sheets,
		bladeThickness,
		wastePercentage: getWastePercentage(sheets),
		time: endTime - startTime,
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

function validatePanels(panels: PanelTemplate[], sheet: SheetTemplate) {
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

function generateNewData(
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
		const newFreeSpace = { ...oldFit };
		newFreeSpace.y = oldFit.y + panel.width + bladeThickness;
		newFreeSpace.width = oldFit.width - panel.width;
		freeSpaces.push(newFreeSpace);

		const newCut: Cut = {
			x: oldFit.x,
			y: oldFit.y + panel.width,
			length: oldFit.length,
			direction: "horizontal",
		};
		cuts.push(newCut);
	} else if (oldFit.width === panel.width) {
		const newFreeSpace = { ...oldFit };
		newFreeSpace.x = oldFit.x + panel.length + bladeThickness;
		newFreeSpace.length = oldFit.length - panel.length;
		freeSpaces.push(newFreeSpace);

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

		const newFreeSpaceToTheRight = { ...oldFit };
		newFreeSpaceToTheRight.x = oldFit.x + panel.length + bladeThickness;
		newFreeSpaceToTheRight.length =
			oldFit.length - panel.length - bladeThickness;
		newFreeSpaceToTheRight.width = panel.width;
		freeSpaces.push(newFreeSpaceToTheRight);

		const newFreeSpaceBelow = { ...oldFit };
		newFreeSpaceBelow.y = oldFit.y + panel.width + bladeThickness;
		newFreeSpaceBelow.width = oldFit.width - panel.width - bladeThickness;
		freeSpaces.push(newFreeSpaceBelow);

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

type Variant = {
	sheets: sheet[];
	baseFit:
		| {
				sheetIndex: number;
				freeSpaceIndex: number;
		  }
		| FreeSpace;
};

type Generation = Variant[];
