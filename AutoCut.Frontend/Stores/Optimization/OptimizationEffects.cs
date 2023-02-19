using AutoCut.Core.Optimization;
using AutoCut.Core.Panels;
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
    public async Task OptimizeAction(IDispatcher dispatcher)
    {
        // TODO: make optimizer async
        
        var optimizer = new Optimizer();
        var panels = _panelsState.Value.Panels;
        var result = optimizer.Optimize(StockPanel.Default, panels, new OptimizerOptions());
        dispatcher.Dispatch(new SetOptimizedPanelsAction(result.OptimizedStockPanels));
    }
}