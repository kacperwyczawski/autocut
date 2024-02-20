import type { Cut } from "./cut";
import type { OptimizedPanel } from "./optimizedPanel";
import type { Sheet } from "./sheet";

export type OptimizedSheet = {
  sheet: Sheet;
  panels: OptimizedPanel[];
  cuts: Cut[];
};
