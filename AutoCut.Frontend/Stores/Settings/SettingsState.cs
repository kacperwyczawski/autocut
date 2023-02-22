using AutoCut.Core.Optimization;

namespace AutoCut.Frontend.Stores.Settings;

public record SettingsState
{
    public OptimizerOptions OptimizerOptions { get; init; } = new();
}