using AutoCut.Core.Panels;

namespace AutoCut.Frontend.Stores.Optimization.Actions;

public class SetOptimizedPanelsAction
{
    public SetOptimizedPanelsAction(List<OptimizedStockPanel> optimizedStockPanels)
    {
        OptimizedStockPanels = optimizedStockPanels;
    }

    public List<OptimizedStockPanel> OptimizedStockPanels { get; }
}