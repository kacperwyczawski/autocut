import type { Cut } from "./cut";
import type { OptimizationResult } from "./optimizationResult";
import type { OptimizedSheet } from "./optimizedSheet";
import type { Panel } from "./panel";
import type { Sheet } from "./sheet";

type FreeSpace = {
	length: number;
	width: number;
	x: number;
	y: number;
	sheet: OptimizedSheet;
};

export function optimize(
	sheet: Sheet,
	panels: Panel[],
	bladeThickness: number,
): OptimizationResult {
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

	const startTime = performance.now();
	const freeRectangles: FreeSpace[] = [];
	panels.sort((a, b) => {
		if (a.length === b.length) {
			return b.width - a.width;
		}
		return b.length - a.length;
	});
	// TODO: apply edge reduction
	const optimizedSheets: OptimizedSheet[] = [];
	for (const panel of panels) {
		// extract smallest fit, if there is none, create new stock panel
		let fit: FreeSpace | null =
			freeRectangles.find(
				(freeSpace) =>
					freeSpace.length >= panel.length && freeSpace.width >= panel.width,
			) ?? null;
		if (!fit) {
			const newSheet: OptimizedSheet = {
				sheet: { ...sheet },
				panels: [],
				cuts: [],
			};
			optimizedSheets.push(newSheet);
			fit = {
				x: 0,
				y: 0,
				length: sheet.length,
				width: sheet.width,
				sheet: newSheet,
			};
		} else {
			// remove fit from free rectangles
			freeRectangles.splice(freeRectangles.indexOf(fit), 1);
		}

		fit.sheet.panels.push({
			panel,
			x: fit.x,
			y: fit.y,
		});

		// generate new cuts and free rectangles if needed
		if (fit.length === panel.length && fit.width === panel.width) {
			// panel fits perfectly 👌
			// so no new free rectangles
			// TODO: Check if cuts are needed
		} else if (fit.length === panel.length) {
			const newFreeRectangle = { ...fit };
			newFreeRectangle.y = fit.y + panel.width + bladeThickness;
			newFreeRectangle.width = fit.width - panel.width;
			freeRectangles.push(newFreeRectangle);

			const newCut: Cut = {
				x: fit.x,
				y: fit.y + panel.width,
				length: fit.length,
				direction: "horizontal",
			};
			fit.sheet.cuts.push(newCut);
		} else if (fit.width === panel.width) {
			const newFreeRectangle = { ...fit };
			newFreeRectangle.x = fit.x + panel.length + bladeThickness;
			newFreeRectangle.length = fit.length - panel.length;
			freeRectangles.push(newFreeRectangle);

			const newCut: Cut = {
				x: fit.x + panel.length,
				y: fit.y,
				length: fit.width,
				direction: "vertical",
			};
			fit.sheet.cuts.push(newCut);
		} else {
			// panel is smaller than fit, so we need to create two new free rectangles and two new cuts

			// TODO: maybe change preference based on length/width ratio of sheet

			// for now prefer horizontal cut, like this:
			// +---+---+
			// | N |   | <- N = new panel
			// +---+---+
			// |       |
			// +---+---+

			const newFreeRectangleBelow = { ...fit };
			newFreeRectangleBelow.y = fit.y + panel.width + bladeThickness;
			newFreeRectangleBelow.width = fit.width - panel.width - bladeThickness;
			freeRectangles.push(newFreeRectangleBelow);

			const newFreeRectangleToTheRight = { ...fit };
			newFreeRectangleToTheRight.x = fit.x + panel.length + bladeThickness;
			newFreeRectangleToTheRight.length =
				fit.length - panel.length - bladeThickness;
			newFreeRectangleToTheRight.width = panel.width + bladeThickness;
			freeRectangles.push(newFreeRectangleToTheRight);

			const newHorizontalCut: Cut = {
				x: fit.x,
				y: fit.y + panel.width,
				length: fit.length,
				direction: "horizontal",
			};
			fit.sheet.cuts.push(newHorizontalCut);

			const newVerticalCut: Cut = {
				x: fit.x + panel.length,
				y: fit.y,
				length: panel.width + bladeThickness / 2,
				direction: "vertical",
			};
			fit.sheet.cuts.push(newVerticalCut);
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
