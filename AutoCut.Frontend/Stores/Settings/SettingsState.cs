using System.Globalization;
using AutoCut.Core.Optimization;

namespace AutoCut.Frontend.Stores.Settings;

public record SettingsState
{
    public OptimizerOptions OptimizerOptions { get; init; } = new();

    public bool IsDrawerOpen { get; init; }
    public bool IsDarkMode { get; init; }

    public CultureInfo Culture { get; init; }
}