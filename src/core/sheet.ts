import type { Cut } from "./cut";
import type { FreeSpace } from "./freeSpace";
import type { Panel } from "./panel";
import type { SheetTemplate } from "./sheetTemplate";

export type sheet = {
	template: SheetTemplate;
	panels: Panel[];
	cuts: Cut[];
	freeSpaces: FreeSpace[];
};