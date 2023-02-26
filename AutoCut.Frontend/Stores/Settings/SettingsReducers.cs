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
    
    [ReducerMethod(typeof(ToggleDrawerAction))]
    public static SettingsState ToggleDrawerAction(SettingsState state)
    {
        return state with { IsDrawerOpen = !state.IsDrawerOpen };
    }
    
    [ReducerMethod(typeof(ToggleDarkModeAction))]
    public static SettingsState ToggleDarkModeAction(SettingsState state)
    {
        return state with { IsDarkMode = !state.IsDarkMode };
    }
}