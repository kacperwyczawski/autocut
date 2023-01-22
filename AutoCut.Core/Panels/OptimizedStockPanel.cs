namespace AutoCut.Core.Models.Panels;

public record OptimizedStockPanel(int Length, int Width, int Thickness, List<PositionedPanel> Panels)
    : StockPanel(Length, Width, Thickness);