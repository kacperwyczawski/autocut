using AutoCut.Core.Optimization;
using Fluxor;

namespace AutoCut.Frontend.Stores.Settings;

public class SettingsFeature : Feature<SettingsState>
{
    public override string GetName() => "Settings";

    protected override SettingsState GetInitialState()
    {
        var options = new OptimizerOptions
        {
            BladeThickness = 3
        };
        
        return new SettingsState { OptimizerOptions = options };
    }
}