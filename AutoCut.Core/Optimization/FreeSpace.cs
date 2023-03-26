using AutoCut.Core.Models;
using AutoCut.Core.Models.Interfaces;

namespace AutoCut.Core.Optimization;

public class FreeSpace : IPosition, IRectangle, IComparable<FreeSpace>, IComparable
{
    public decimal X { get; set; }

    public decimal Y { get; set; }

    public decimal Length { get; set; }

    public decimal Width { get; set; }

    public OptimizedSheet Sheet { get; }

    public FreeSpace(decimal x, decimal y, decimal length, decimal width, OptimizedSheet sheet)
    {
        X = x;
        Y = y;
        Length = length;
        Width = width;
        Sheet = sheet;
    }

    public int CompareTo(FreeSpace? other)
    {
        if (ReferenceEquals(this, other)) return 0;
        if (ReferenceEquals(null, other)) return 1;
        var lengthComparison =
            Length.CompareTo(other.Length);
        return lengthComparison == 0
            ? Width.CompareTo(other.Width)
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

    public FreeSpace Clone() => new(X, Y, Length, Width, Sheet);
}