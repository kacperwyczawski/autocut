import type { PanelTemplate } from "./panelTemplate";
import type { SheetTemplate } from "./sheetTemplate";

export type OptimizationRequest = {
    sheetTemplate: SheetTemplate;
    panels: PanelTemplate[];
    bladeThickness: number;
    depth: number;
};