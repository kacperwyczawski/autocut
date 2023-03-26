using AutoCut.Core.Models;

namespace AutoCut.Frontend.Stores.Optimization.Actions;

public class SetOptimizedPanelsAction
{
    public SetOptimizedPanelsAction(List<OptimizedSheet> optimizedSheets)
    {
        OptimizedSheets = optimizedSheets;
    }

    public List<OptimizedSheet> OptimizedSheets { get; }
}