using AutoCut.Frontend.Stores.Settings.Actions;
using Fluxor;

namespace AutoCut.Frontend.Stores.Settings;

public static class SettingsReducers
{
    [ReducerMethod]
    public static SettingsState UpdateSettingsAction(SettingsState state, UpdateSettingsAction action) =>
        new() { OptimizerOptions = action.OptimizerOptions, SheetTemplate = action.SheetTemplate };
}