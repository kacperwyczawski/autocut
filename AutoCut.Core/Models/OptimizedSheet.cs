namespace AutoCut.Core.Models;

public class OptimizedSheet
{
    public Sheet Sheet { get; }

    public List<OptimizedPanel> Panels { get; }

    public OptimizedSheet(Sheet sheet, List<OptimizedPanel> panels)
    {
        Sheet = sheet;
        Panels = panels;
    }

    public static OptimizedSheet Empty(Sheet sheet) =>
        new OptimizedSheet(sheet, new List<OptimizedPanel>());
}