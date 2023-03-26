using AutoCut.Core.Models.Interfaces;

namespace AutoCut.Core.Models;

public class Sheet : IRectangle
{
    public decimal Length { get; set; }

    public decimal Width { get; set; }

    public EdgeReduction EdgeReduction { get; set; }

    public decimal Thickness { get; set; }

    public Sheet(decimal length, decimal width, EdgeReduction edgeReduction, decimal thickness)
    {
        Length = length;
        Width = width;
        EdgeReduction = edgeReduction;
        Thickness = thickness;
    }

    public static Sheet Default =>
        new Sheet(2800, 2070, EdgeReduction.NoEdges, 18);
}