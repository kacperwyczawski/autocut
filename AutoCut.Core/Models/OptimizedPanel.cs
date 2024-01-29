using AutoCut.Core.Models.Interfaces;

namespace AutoCut.Core.Models;

public class OptimizedPanel : IPosition
{
    public Panel Panel { get; }

    public decimal X { get; set; }

    public decimal Y { get; set; }

    public OptimizedPanel(Panel panel, decimal x, decimal y)
    {
        Panel = panel;
        X = x;
        Y = y;
    }
}