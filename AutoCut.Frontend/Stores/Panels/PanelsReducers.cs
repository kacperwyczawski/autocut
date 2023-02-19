using AutoCut.Core.Panels;
using AutoCut.Frontend.Stores.Panels.Actions;
using Fluxor;

namespace AutoCut.Frontend.Stores.Panels;

public static class PanelsReducers
{
    [ReducerMethod(typeof(ResetAction))]
    public static PanelsState PanelResetAction(PanelsState state)
    {
        return state with { Panels = new List<CompressedPanel>() };
    }
    
    [ReducerMethod]
    public static PanelsState PanelAddAction(PanelsState state, AddAction action)
    {
        var panels = state.Panels;
        panels.Add(action.Panel);
        return state with { Panels = panels };
    }
}