using AutoCut.Core.Models;

namespace AutoCut.Frontend.Stores.Optimization;

public record OptimizationState
{
    public List<OptimizedSheet> OptimizedSheets { get; init; } = new();
}