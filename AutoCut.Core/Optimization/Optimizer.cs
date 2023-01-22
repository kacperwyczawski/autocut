using AutoCut.Core.Panels;

namespace AutoCut.Core.Optimization;

public class Optimizer
{
    public OptimizerSettings Settings { get; set; }

    public Optimizer(OptimizerSettings settings)
    {
        Settings = settings;
    }

    public Optimizer() : this(new OptimizerSettings())
    {
    }

    public OptimizationResult Optimize(StockPanel stockPanelTemplate, IEnumerable<CompressedPanel> compressedPanels)
    {
        var panels = compressedPanels.SelectMany(panel => panel.Decompress());
        return Optimize(stockPanelTemplate, panels);
    }

    public OptimizationResult Optimize(StockPanel stockPanelTemplate, IEnumerable<Panel> panels)
    {
        // TODO: check if list or enumerable is faster in freeRectangles than sorted set
        var freeRectangles = new SortedSet<FreeRectangle>();
        var panelsToProcess = panels.OrderDescending().ToList();
        var optimizedStockPanels = new List<OptimizedStockPanel>();

        foreach (var panel in panelsToProcess)
        {
            // extract smallest fit, if there is none, create new stock panel
            var fit = freeRectangles.FirstOrDefault(freeRectangle =>
                freeRectangle.Length >= panel.Length &&
                freeRectangle.Width >= panel.Width);
            if (fit is null)
            {
                var newStockPanel = PanelUtilities.EmptyOptimizedStockPanel(stockPanelTemplate);
                optimizedStockPanels.Add(newStockPanel);
                fit = new FreeRectangle(stockPanelTemplate.Length, stockPanelTemplate.Width, 0, 0, newStockPanel);
            }
            else
            {
                freeRectangles.Remove(fit);
            }

            // place panel
            var panelToPlace = panel.ToPositioned(fit.X, fit.Y);
            fit.StockPanel.Panels.Add(panelToPlace);

            // add new free rectangles
            freeRectangles.UnionWith(GenerateNewFreeRectangles(fit, panel));
        }

        return new OptimizationResult(Settings, optimizedStockPanels);
    }

    private IEnumerable<FreeRectangle> GenerateNewFreeRectangles(FreeRectangle fit, Panel currentPanel)
    {
        if (fit == currentPanel)
        {
            // panel fits perfectly 👌
            // so no new free rectangles
        }
        else if (fit.Length == currentPanel.Length)
        {
            yield return fit with
            {
                Width = fit.Width - currentPanel.Width,
                Y = fit.Y + currentPanel.Width + Settings.BladeThickness
            };
        }
        else if (fit.Width == currentPanel.Width)
        {
            yield return fit with
            {
                Length = fit.Length - currentPanel.Length,
                X = fit.X + currentPanel.Length + Settings.BladeThickness
            };
        }
        else
        {
            // prefer horizontal split/cut

            yield return fit with
            {
                Width = fit.Width - currentPanel.Width,
                Y = fit.Y + currentPanel.Width + Settings.BladeThickness
            };

            yield return fit with
            {
                Length = fit.Length - currentPanel.Length,
                Width = currentPanel.Width,
                X = fit.X + currentPanel.Length + Settings.BladeThickness
            };
        }
    }
}