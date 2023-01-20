namespace AutoCut.Core.Models.Panels;

public class PanelComparerFactory
{
    public static IComparer<Panel> CreateComparer(ComparisonType comparisonType = ComparisonType.ByLenght) =>
        comparisonType switch
        {
            ComparisonType.ByLenght => new PanelComparerByLenght(),
            ComparisonType.ByWidth => new PanelComparerByWidth(),
            ComparisonType.ByArea => new PanelComparerByArea(),
            _ => throw new ArgumentOutOfRangeException(nameof(comparisonType), comparisonType, null)
        };

    public enum ComparisonType
    {
        ByLenght,
        ByWidth,
        ByArea
    }
}

public class PanelComparerByLenght : IComparer<Panel>
{
    public int Compare(Panel? x, Panel? y)
    {
        if (ReferenceEquals(x, y)) return 0;
        if (ReferenceEquals(null, y)) return 1;
        if (ReferenceEquals(null, x)) return -1;

        return x.Lenght.CompareTo(y.Lenght);
    }
}

public class PanelComparerByWidth : IComparer<Panel>
{
    public int Compare(Panel? x, Panel? y)
    {
        if (ReferenceEquals(x, y)) return 0;
        if (ReferenceEquals(null, y)) return 1;
        if (ReferenceEquals(null, x)) return -1;

        return x.Width.CompareTo(y.Width);
    }
}

public class PanelComparerByArea : IComparer<Panel>
{
    public int Compare(Panel? x, Panel? y)
    {
        if (ReferenceEquals(x, y)) return 0;
        if (ReferenceEquals(null, y)) return 1;
        if (ReferenceEquals(null, x)) return -1;

        return x.Area.CompareTo(y.Area);
    }
}