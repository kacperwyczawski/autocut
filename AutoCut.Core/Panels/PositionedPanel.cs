namespace AutoCut.Core.Models.Panels;

public record PositionedPanel(int Length, int Width, int X, int Y) : Panel(Length, Width);