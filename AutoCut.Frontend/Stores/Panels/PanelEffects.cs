using AutoCut.Frontend.Stores.Optimization.Actions;
using AutoCut.Frontend.Stores.Panels.Actions;
using Fluxor;

namespace AutoCut.Frontend.Stores.Panels;

public class PanelEffects
{
    [EffectMethod(typeof(ResetAction))]
    public Task ResetAction(IDispatcher dispatcher)
    {
        dispatcher.Dispatch(new OptimizeAction());
        return Task.CompletedTask;
    }
}