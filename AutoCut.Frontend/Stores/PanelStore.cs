using AutoCut.Core.Panels;
using Fluxor;

namespace AutoCut.Frontend.Stores;

public record PanelsState
{
    public List<CompressedPanel> Panels { get; init; } = new();
}

public class PanelsFeature : Feature<PanelsState>
{
    public override string GetName() => "Panels";

    protected override PanelsState GetInitialState()
    {
        return new PanelsState { Panels = new List<CompressedPanel>() };
    }
}

public class PanelResetAction { }
public class PanelAddAction
{
    public PanelAddAction(CompressedPanel panel)
    {
        Panel = panel;
    }

    public CompressedPanel Panel { get; }
}

public static class PanelsReducers
{
    [ReducerMethod(typeof(PanelResetAction))]
    public static PanelsState ReducePanelResetAction(PanelsState state)
    {
        return state with { Panels = new List<CompressedPanel>() };
    }
    
    [ReducerMethod]
    public static PanelsState ReducePanelAddAction(PanelsState state, PanelAddAction action)
    {
        var panels = state.Panels;
        panels.Add(action.Panel);
        return state with { Panels = panels };
    }
}