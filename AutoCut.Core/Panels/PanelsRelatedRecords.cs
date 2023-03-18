namespace AutoCut.Core.Panels;

public record Rectangle(decimal Length, decimal Width)
{
    public PositionedRectangle ToPositioned(decimal x, decimal y) =>
        new PositionedRectangle(this, new Position(x, y));
}

public record Position(decimal X, decimal Y);

public record PositionedRectangle(Rectangle Rectangle, Position Position);

public record Panel(Rectangle Rectangle, EdgeBanding EdgeBanding, string Name = "")
{
    public PositionedPanel ToPositioned(decimal x, decimal y) =>
        new PositionedPanel(Rectangle.ToPositioned(x, y), EdgeBanding);
}

public record PositionedPanel(PositionedRectangle PositionedRectangle, EdgeBanding EdgeBanding);

public record CompressedPanel(Panel Panel, int Quantity)
{
    public IEnumerable<Panel> Decompress() =>
        Enumerable.Repeat(Panel, Quantity);
}

public record StockPanel(Panel Panel, decimal Thickness)
{
    public static StockPanel Default =>
        new StockPanel(
            new Panel(
                new Rectangle(2800, 2070),
                EdgeBanding.NoEdges),
            18);
}

public record OptimizedStockPanel(StockPanel StockPanel, List<PositionedPanel> Panels)
{
    public static OptimizedStockPanel Empty(StockPanel stockPanel) =>
        new OptimizedStockPanel(stockPanel, new List<PositionedPanel>());
}

public record FreeSpace(PositionedRectangle PositionedRectangle, OptimizedStockPanel OptimizedStockPanel)
    : IComparable<FreeSpace>, IComparable
{
    public int CompareTo(FreeSpace? other)
    {
        if (ReferenceEquals(this, other)) return 0;
        if (ReferenceEquals(null, other)) return 1;
        var lengthComparison =
            PositionedRectangle.Rectangle.Length.CompareTo(other.PositionedRectangle.Rectangle.Length);
        return lengthComparison == 0
            ? PositionedRectangle.Rectangle.Width.CompareTo(other.PositionedRectangle.Rectangle.Width)
            : lengthComparison;
    }

    public int CompareTo(object? obj)
    {
        if (ReferenceEquals(null, obj)) return 1;
        if (ReferenceEquals(this, obj)) return 0;
        return obj is FreeSpace other
            ? CompareTo(other)
            : throw new ArgumentException($"Object must be of type {nameof(FreeSpace)}");
    }
}