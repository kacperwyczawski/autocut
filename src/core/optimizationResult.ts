import type { sheet } from "./sheet";

export type OptimizationResult =
	| {
			sheets: sheet[];
			bladeThickness: number;
			wastePercentage: number;
			time: number;
			fittings: number;
	  }
	| "at least one panel is bigger than the sheet"
	| "no panels to optimize";
