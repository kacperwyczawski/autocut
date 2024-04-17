import type { Cut } from "./cut";
import type { OptimizedPanel } from "./optimizedPanel";
import type { Sheet } from "./sheet";
import type { FreeSpace } from "./freeSpace";

export type OptimizedSheet = {
	sheet: Sheet;
	panels: OptimizedPanel[];
	cuts: Cut[];
	freeSpaces: FreeSpace[];
};

// TODO: maybe replace this with a class called sheet and type sheet with sheetTemplate.
// Then this class could have a constructor that takes a sheetTemplate