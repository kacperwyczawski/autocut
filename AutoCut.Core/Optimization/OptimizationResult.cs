using AutoCut.Core.Panels;

namespace AutoCut.Core.Optimization;

public record OptimizationResult(OptimizerSettings Settings, List<OptimizedStockPanel> OptimizedStockPanels);