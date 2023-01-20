using AutoCut.Core.Models.Panels;

namespace AutoCut.Core.Optimization;

public record OptimizationResult(
    int RequiredStockPanelsCount,
    OptimizerSettings Settings,
    IReadOnlyList<StockPanel> StockPanels,
    IEnumerable<PositionedPanel> OptimizedPanels);