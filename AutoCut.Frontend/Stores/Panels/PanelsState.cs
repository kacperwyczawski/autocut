using AutoCut.Core.Models;

namespace AutoCut.Frontend.Stores.Panels;

public record PanelsState
{
    public List<CompressedPanel> Panels { get; init; } = new();
}