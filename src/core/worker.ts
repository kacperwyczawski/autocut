import type { OptimizationRequest } from "./optimizationRequest"
import { optimize } from "./optimize"

addEventListener("message", (e: MessageEvent<OptimizationRequest>) => {
    const result = optimize(
        e.data,
        (placedPanels, totalPanels) => postMessage({ placedPanels, totalPanels })
    )
    postMessage(result)
});