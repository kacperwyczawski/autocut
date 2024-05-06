import type { OptimizationRequest } from "./optimizationRequest"
import { optimize } from "./optimize"

console.log("worker loaded")
addEventListener("message", (e: MessageEvent<OptimizationRequest>) => {
    console.log("worker received message")
    const result = optimize(
        e.data,
        (placedPanels, totalPanels) => postMessage({ placedPanels, totalPanels })
    )
    postMessage(result)
});