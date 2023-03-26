using AutoCut.Core.Models;
using AutoCut.Core.Optimization;
using AutoCut.Frontend.Stores.Optimization.Actions;
using AutoCut.Frontend.Stores.Panels;
using Fluxor;

namespace AutoCut.Frontend.Stores.Optimization;

public class OptimizationEffects
{
    private readonly IState<PanelsState> _panelsState;

    public OptimizationEffects(IState<PanelsState> panelsState)
    {
        _panelsState = panelsState;
    }

    [EffectMethod(typeof(OptimizeAction))]
    public Task OptimizeAction(IDispatcher dispatcher)
    {
        // TODO: make optimizer async

        var optimizer = new Optimizer();
        var panels = _panelsState.Value.Panels;
        var result = optimizer.Optimize(Sheet.Default, panels, new OptimizerOptions());
        dispatcher.Dispatch(new SetOptimizedPanelsAction(result.OptimizedSheets));
        return Task.CompletedTask;
    }
}