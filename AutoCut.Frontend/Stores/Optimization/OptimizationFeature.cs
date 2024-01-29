using AutoCut.Core.Models;
using Fluxor;

namespace AutoCut.Frontend.Stores.Optimization;

public class OptimizationFeature : Feature<OptimizationState>
{
    public override string GetName() => "Optimization";

    protected override OptimizationState GetInitialState()
    {
        return new OptimizationState { OptimizedSheets = new List<OptimizedSheet>() };
    }
}