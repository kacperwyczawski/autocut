using System.ComponentModel.DataAnnotations;

namespace AutoCut.Core.Panels;

public class EdgeBanding
{
    [Range(0, 2)] public int EdgesAlongLenght { get; set; }

    [Range(0, 2)] public int EdgesAlongWidth { get; set; }

    public EdgeBanding(int edgesAlongLenght, int edgesAlongWidth)
    {
        if (edgesAlongLenght is < 0 or > 2)
            throw new ArgumentOutOfRangeException(nameof(edgesAlongLenght));
        if (edgesAlongWidth is < 0 or > 2)
            throw new ArgumentOutOfRangeException(nameof(edgesAlongWidth));

        EdgesAlongLenght = edgesAlongLenght;
        EdgesAlongWidth = edgesAlongWidth;
    }

    public static EdgeBanding AllEdges => new EdgeBanding(2, 2);
    public static EdgeBanding NoEdges => new EdgeBanding(0, 0);
}