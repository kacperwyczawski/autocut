using AutoCut.Core.Models.Panels;

namespace AutoCut.Core.Optimization;

public record OptimizationResult(OptimizerSettings Settings, List<OptimizedStockPanel> StockPanels);