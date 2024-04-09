import type { OptimizedSheet } from "./optimizedSheet";

export type OptimizationResult =
	| {
			sheets: OptimizedSheet[];
			bladeThickness: number;
			wastePercentage: number;
			time: number;
	  }
	| "at least one panel is bigger than the sheet"
	| "no panels to optimize";
