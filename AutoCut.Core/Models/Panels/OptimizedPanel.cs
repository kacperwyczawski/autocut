namespace AutoCut.Core.Models.Panels;

public record OptimizedPanel(int Length, int Width, int X, int Y) : Panel(Length, Width);