namespace AutoCut.Core.Models.Panels;

public record StockPanel(int Length, int Width, int Thickness) : Panel(Length, Width);