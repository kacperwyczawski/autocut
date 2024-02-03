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
) {
  // TODO: fail if there is a panel bigger than the sheet
  console.info("Optimization started");
  let freeRectangles: FreeSpace[] = [];
  panels.sort((a, b) => {
    if (a.length === b.length) {
      return b.width - a.width;
    } else {
      return b.length - a.length;
    }
  });
  // TODO: apply edge reduction
  let optimizedSheets: OptimizedSheet[] = [];

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

    // add new free rectangles
    freeRectangles.push(
      ...generateNewFreeRectangles(fit, panel, bladeThickness),
    );
  }

  return optimizedSheets;
}

function generateNewFreeRectangles(
  fit: FreeSpace,
  currentPanel: Panel,
  bladeThickness: number,
): FreeSpace[] {
  if (fit.length === currentPanel.length && fit.width === currentPanel.width) {
    // panel fits perfectly 👌
    // so no new free rectangles
    return [];
  } else if (fit.length === currentPanel.length) {
    const result = { ...fit };
    result.y = fit.y + currentPanel.width + bladeThickness;
    result.width = fit.width - currentPanel.width;
    return [result];
  } else if (fit.width === currentPanel.width) {
    const result = { ...fit };
    result.x = fit.x + currentPanel.length + bladeThickness;
    result.length = fit.length - currentPanel.length;
    return [result];
  } else {
    // TODO: maybe change preference based on length/width ratio of sheet
    // prefer horizontal split/cut

    const panelBelow = { ...fit };
    panelBelow.y = fit.y + currentPanel.width + bladeThickness;
    panelBelow.width = fit.width - currentPanel.width - bladeThickness;

    const panelToTheRight = { ...fit };
    panelToTheRight.x = fit.x + currentPanel.length + bladeThickness;
    panelToTheRight.length = fit.length - currentPanel.length - bladeThickness;
    panelToTheRight.width = currentPanel.width + bladeThickness;

    return [panelBelow, panelToTheRight];
  }
}
