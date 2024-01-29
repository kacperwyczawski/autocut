using AutoCut.Core.Models;
using AutoCut.Core.Models.Interfaces;

namespace AutoCut.Core.Optimization;

public class Optimizer
{
    public OptimizationResult Optimize(
        Sheet sheetTemplate,
        IEnumerable<CompressedPanel> compressedPanels,
        OptimizerOptions options)
    {
        var panels = compressedPanels.SelectMany(panel => panel.Decompress());
        return Optimize(sheetTemplate, panels, options);
    }

    public OptimizationResult Optimize(
        Sheet sheetTemplate,
        IEnumerable<Panel> panels,
        OptimizerOptions options)
    {
        // TODO: check if list or enumerable is faster in freeRectangles than sorted set
        var freeRectangles = new SortedSet<FreeSpace>();
        var panelsToProcess = panels
            .OrderByDescending(p => p.Length)
            .ThenByDescending(p => p.Width)
            .ToList();
        var optimizedSheets = new List<OptimizedSheet>();

        foreach (var panel in panelsToProcess)
        {
            // extract smallest fit, if there is none, create new stock panel
            var fit = freeRectangles.FirstOrDefault(freeSpace =>
                freeSpace.Length >= panel.Length && freeSpace.Width >= panel.Width);
            if (fit is null)
            {
                var newSheet = OptimizedSheet.Empty(sheetTemplate);
                optimizedSheets.Add(newSheet);
                fit = new FreeSpace(0, 0, sheetTemplate.Length, sheetTemplate.Width, newSheet);
            }
            else
            {
                freeRectangles.Remove(fit);
            }

            fit.Sheet.Panels.Add(new OptimizedPanel(panel, fit.X, fit.Y));

            // add new free rectangles
            freeRectangles.UnionWith(GenerateNewFreeRectangles(fit, panel, options));
        }

        return new OptimizationResult(options, optimizedSheets);
    }

    private static IEnumerable<FreeSpace> GenerateNewFreeRectangles(
        FreeSpace fit,
        IRectangle currentPanel,
        OptimizerOptions options)
    {
        if ((fit.Length, fit.Width) == (currentPanel.Length, currentPanel.Width))
        {
            // panel fits perfectly 👌
            // so no new free rectangles
        }
        else if (fit.Length == currentPanel.Length)
        {
            var result = fit.Clone();
            result.Y = fit.Y + currentPanel.Width + options.BladeThickness;
            result.Width = fit.Width - currentPanel.Width;
            yield return result;
        }
        else if (fit.Width == currentPanel.Width)
        {
            var result = fit.Clone();
            result.X = fit.X + currentPanel.Length + options.BladeThickness;
            result.Length = fit.Length - currentPanel.Length;
            yield return result;
        }
        else
        {
            // prefer horizontal split/cut

            var panelBelow = fit.Clone();
            panelBelow.Y = fit.Y + currentPanel.Width + options.BladeThickness;
            panelBelow.Width = fit.Width - currentPanel.Width - options.BladeThickness;
            yield return panelBelow;

            var panelToTheRight = fit.Clone();
            panelToTheRight.X = fit.X + currentPanel.Length + options.BladeThickness;
            panelToTheRight.Length = fit.Length - currentPanel.Length - options.BladeThickness;
            panelToTheRight.Width = currentPanel.Width + options.BladeThickness;
            yield return panelToTheRight;
        }
    }
}