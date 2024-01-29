using AutoCut.Core.Models;
using Fluxor;

namespace AutoCut.Frontend.Stores.Panels;

public class PanelsFeature : Feature<PanelsState>
{
    public override string GetName() => "Panels";

    protected override PanelsState GetInitialState()
    {
        return new PanelsState { Panels = new List<CompressedPanel>() };
    }
}