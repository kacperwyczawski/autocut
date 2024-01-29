using AutoCut.Core.Models;

namespace AutoCut.Core.Optimization;

public record OptimizationResult(OptimizerOptions Options, List<OptimizedSheet> OptimizedSheets);