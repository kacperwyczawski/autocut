using AutoCut.Core.Models;
using AutoCut.Core.Optimization;

namespace AutoCut.Frontend.Stores.Settings;

public record SettingsState
{
    public required OptimizerOptions OptimizerOptions { get; init; }

    public required Sheet SheetTemplate { get; init; }
}