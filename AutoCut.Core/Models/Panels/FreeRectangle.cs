namespace AutoCut.Core.Models.Panels;

public record FreeRectangle(int Length, int Width, int X, int Y, OptimizedStockPanel StockPanel)
    : PositionedPanel(Length, Width, X, Y);