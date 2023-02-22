using AutoCut.Frontend.Stores.Settings.Actions;
using Fluxor;

namespace AutoCut.Frontend.Stores.Settings;

public static class SettingsReducers
{
    [ReducerMethod]
    public static SettingsState UpdateOptimizerOptionsAction(SettingsState state, UpdateOptimizerOptionsAction action)
    {
        return state with { OptimizerOptions = action.OptimizerOptions };
    }
}