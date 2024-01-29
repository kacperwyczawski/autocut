using System.ComponentModel.DataAnnotations;

namespace AutoCut.Core.Models;

public class EdgeReduction
{
    [Range(0, 2)] public int EdgesAlongLenght { get; set; }

    [Range(0, 2)] public int EdgesAlongWidth { get; set; }

    public EdgeReduction(int edgesAlongLenght, int edgesAlongWidth)
    {
        if (edgesAlongLenght is < 0 or > 2)
            throw new ArgumentOutOfRangeException(nameof(edgesAlongLenght));
        if (edgesAlongWidth is < 0 or > 2)
            throw new ArgumentOutOfRangeException(nameof(edgesAlongWidth));

        EdgesAlongLenght = edgesAlongLenght;
        EdgesAlongWidth = edgesAlongWidth;
    }

    public static EdgeReduction AllEdges => new EdgeReduction(2, 2);
    public static EdgeReduction NoEdges => new EdgeReduction(0, 0);
}