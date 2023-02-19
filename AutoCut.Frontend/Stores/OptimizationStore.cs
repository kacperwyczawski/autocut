using AutoCut.Core.Optimization;
using AutoCut.Core.Panels;
using Fluxor;

namespace AutoCut.Frontend.Stores;

public record OptimizationState
{
    public List<OptimizedStockPanel> OptimizedStockPanels { get; init; } = new();
}

public class OptimizationFeature : Feature<OptimizationState>
{
    public override string GetName() => "Optimization";

    protected override OptimizationState GetInitialState()
    {
        return new OptimizationState { OptimizedStockPanels = new List<OptimizedStockPanel>() };
    }
}

public class OptimizationOptimizeAction
{
}

public class OptimizationSetOptimizedPanelsAction
{
    public OptimizationSetOptimizedPanelsAction(List<OptimizedStockPanel> optimizedStockPanels)
    {
        OptimizedStockPanels = optimizedStockPanels;
    }

    public List<OptimizedStockPanel> OptimizedStockPanels { get; }
}

public static class OptimizationReducers
{
    [ReducerMethod]
    public static OptimizationState ReduceOptimizationSetOptimizedPanelsAction(OptimizationState state, OptimizationSetOptimizedPanelsAction action)
    {
        return state with { OptimizedStockPanels = action.OptimizedStockPanels };
    }
}

public class OptimizationEffects
{
    private readonly IState<PanelsState> _panelsState;

    public OptimizationEffects(IState<PanelsState> panelsState)
    {
        _panelsState = panelsState;
    }

    [EffectMethod(typeof(OptimizationOptimizeAction))]
    public async Task HandleOptimizationOptimizeAction(IDispatcher dispatcher)
    {
        // TODO: make optimizer async
        
        var optimizer = new Optimizer();
        var panels = _panelsState.Value.Panels;
        var result = optimizer.Optimize(StockPanel.Default, panels, new OptimizerOptions());
        dispatcher.Dispatch(new OptimizationSetOptimizedPanelsAction(result.OptimizedStockPanels));
    }
}