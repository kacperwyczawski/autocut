import type { EdgeReduction } from "./edgeReduction";
import type { PanelTemplate } from "./panelTemplate";

export type ParsedPanelItem = {
	panel: PanelTemplate;
	quantity: number;
};

export type ParsePro100Options = {
	defaultEdgeThickness?: number;
};

function parseNumber(val: string): number {
	return Number.parseFloat(val.trim().replace(",", "."));
}

function parseEdge(val: string): { first: boolean; second: boolean } {
	const trimmed = val?.trim() ?? "";
	if (trimmed === "=") {
		return { first: true, second: true };
	}
	if (trimmed === "-") {
		return { first: true, second: false };
	}
	return { first: false, second: false };
}

/**
 * Parses tab-separated cut list exported or copied from PRO100.
 *
 * Expected tab-separated columns:
 * [0] Name
 * [1] Length (dim 1)
 * [2] Edge 1 ('-' for 1 edge, '=' for 2 edges, empty for none)
 * [3] Width (dim 2)
 * [4] Edge 2 ('-' for 1 edge, '=' for 2 edges, empty for none)
 * [5] Board thickness (ignored)
 * [6] Quantity
 * [7] Material (ignored)
 */
export function parsePro100(
	input: string,
	options: ParsePro100Options = {},
): ParsedPanelItem[] {
	const thickness = options.defaultEdgeThickness ?? 0;
	const lines = input.split(/\r?\n/);
	const items: ParsedPanelItem[] = [];

	for (const rawLine of lines) {
		const line = rawLine.trim();
		if (!line) continue;

		const cols = line.split("\t");
		if (cols.length < 4) continue;

		const length = parseNumber(cols[1]);
		const width = parseNumber(cols[3]);

		// Skip invalid rows or headers
		if (
			Number.isNaN(length) ||
			Number.isNaN(width) ||
			length <= 0 ||
			width <= 0
		) {
			continue;
		}

		const edge1 = parseEdge(cols[2]);
		const edge2 = parseEdge(cols[4]);

		// Quantity is usually in col 6 (after board thickness in col 5),
		// or col 5 if board thickness is omitted.
		let quantity = 1;
		if (cols[6] && !Number.isNaN(parseNumber(cols[6]))) {
			quantity = Math.max(1, Math.round(parseNumber(cols[6])));
		} else if (cols[5] && !Number.isNaN(parseNumber(cols[5]))) {
			quantity = Math.max(1, Math.round(parseNumber(cols[5])));
		}

		const edgeReduction: EdgeReduction = {
			top: edge1.first,
			bottom: edge1.second,
			left: edge2.first,
			right: edge2.second,
			thickness,
		};

		// Consolidate identical panels
		const existing = items.find(
			(item) =>
				item.panel.length === length &&
				item.panel.width === width &&
				item.panel.edgeReduction.top === edgeReduction.top &&
				item.panel.edgeReduction.bottom === edgeReduction.bottom &&
				item.panel.edgeReduction.left === edgeReduction.left &&
				item.panel.edgeReduction.right === edgeReduction.right,
		);

		if (existing) {
			existing.quantity += quantity;
		} else {
			items.push({
				panel: {
					length,
					width,
					edgeReduction,
				},
				quantity,
			});
		}
	}

	return items;
}
