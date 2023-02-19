using AutoCut.Core.Panels;
using Fluxor;

namespace AutoCut.Frontend.Stores.Optimization;

public class OptimizationFeature : Feature<OptimizationState>
{
    public override string GetName() => "Optimization";

    protected override OptimizationState GetInitialState()
    {
        return new OptimizationState { OptimizedStockPanels = new List<OptimizedStockPanel>() };
    }
}