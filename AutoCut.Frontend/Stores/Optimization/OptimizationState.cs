using AutoCut.Core.Panels;

namespace AutoCut.Frontend.Stores.Optimization;

public record OptimizationState
{
    public List<OptimizedStockPanel> OptimizedStockPanels { get; init; } = new();
}