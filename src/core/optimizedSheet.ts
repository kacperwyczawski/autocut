import type { OptimizedPanel } from "./optimizedPanel";
import type { Sheet } from "./sheet";

export type OptimizedSheet = {
    panels: OptimizedPanel[];
    sheet: Sheet;
}