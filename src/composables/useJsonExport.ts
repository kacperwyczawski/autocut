import { toValue } from "vue";

/**
 * Returns a function that triggers the download of a JSON file with the given data
 * @param data Data to export
 * @param name Name to be used for the exported file, without the extension
 */
export default function useJsonExport<T extends Blob>(
	data: T,
	name: string,
): void {
	const blob = new Blob([toValue(data)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.style.display = "none";
	a.href = url;
	a.download = `${name}.json`;
	a.click();
	URL.revokeObjectURL(url);
}
