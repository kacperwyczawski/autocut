using AutoCut.Core.Models.Interfaces;

namespace AutoCut.Core.Models;

public class Panel : IRectangle
{
    public decimal Length { get; set; }

    public decimal Width { get; set; }

    public EdgeReduction EdgeReduction { get; set; }

    public string Name { get; set; }

    public Panel(decimal length, decimal width, EdgeReduction edgeReduction, string name = "")
    {
        Length = length;
        Width = width;
        EdgeReduction = edgeReduction;
        Name = name;
    }

    public static Panel Default => new(1, 1, EdgeReduction.NoEdges);
}