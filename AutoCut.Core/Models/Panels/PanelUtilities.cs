namespace AutoCut.Core.Models.Panels;

public static class PanelUtilities
{
    public static IEnumerable<Panel> Decompress(this CompressedPanel compressedPanel) =>
        Enumerable.Repeat(compressedPanel.ToPanel(), compressedPanel.Quantity);

    public static Panel ToPanel<TFrom>(this TFrom from) where TFrom : Panel =>
        new Panel(from.Length, from.Width);

    public static PositionedPanel ToPositioned(this Panel from, int x, int y) =>
        new PositionedPanel(from.Length, from.Width, x, y);

    public static OptimizedStockPanel EmptyOptimizedStockPanel(StockPanel stockPanel) =>
        new OptimizedStockPanel(
            stockPanel.Length, stockPanel.Width,
            stockPanel.Width,
            new List<PositionedPanel>());
}