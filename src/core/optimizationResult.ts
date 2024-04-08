import type { OptimizedSheet } from "./optimizedSheet";

export type OptimizationResult = {
	sheets: OptimizedSheet[];
	bladeThickness: number;
	wastePercentage: number;
};
