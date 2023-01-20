namespace AutoCut.Core.Models.Panels;

public record Panel(int Length, int Width) : IComparable<Panel>
{
    public int CompareTo(Panel? other)
    {
        if (ReferenceEquals(this, other)) return 0;
        if (ReferenceEquals(null, other)) return 1;
        var lenghtComparison = Length.CompareTo(other.Length);
        return lenghtComparison == 0
            ? Width.CompareTo(other.Width) // length is equal, compare width
            : lenghtComparison; // length is not equal, return comparison
    }
    
    public static bool operator <(Panel left, Panel right) => left.CompareTo(right) < 0;
    public static bool operator >(Panel left, Panel right) => left.CompareTo(right) > 0;
    public static bool operator <=(Panel left, Panel right) => left.CompareTo(right) <= 0;
    public static bool operator >=(Panel left, Panel right) => left.CompareTo(right) >= 0;
}