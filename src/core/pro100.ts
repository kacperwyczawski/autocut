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

const DASH_REGEX = /^[\u002d\u2010-\u2015\u2212\ufe63\uff0d]$/;

function parseEdge(val: string): { first: boolean; second: boolean } {
	const trimmed = val?.trim() ?? "";
	if (trimmed === "=") {
		return { first: true, second: true };
	}
	if (DASH_REGEX.test(trimmed)) {
		return { first: true, second: false };
	}
	return { first: false, second: false };
}

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
