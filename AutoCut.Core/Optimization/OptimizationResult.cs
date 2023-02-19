using AutoCut.Core.Panels;

namespace AutoCut.Core.Optimization;

public record OptimizationResult(OptimizerOptions Options, List<OptimizedStockPanel> OptimizedStockPanels);