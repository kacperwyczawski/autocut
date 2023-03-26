using AutoCut.Frontend.Stores.Optimization.Actions;
using Fluxor;

namespace AutoCut.Frontend.Stores.Optimization;

public static class OptimizationReducers
{
    [ReducerMethod]
    public static OptimizationState SetOptimizedPanelsAction(OptimizationState state, SetOptimizedPanelsAction action)
    {
        return state with { OptimizedSheets = action.OptimizedSheets };
    }
}