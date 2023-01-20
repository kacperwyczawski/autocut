using AutoCut.Core.Models.Panels;

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
        // TODO: check if list or enumerable is faster in freeRectangles
        var usedStockPanels = new List<StockPanel>();
        var freeRectangles = new SortedSet<PositionedPanel>();
        var panelsToProcess = panels.OrderDescending().ToList();
        var optimizedPanels = new List<PositionedPanel>();

        while (panelsToProcess.Any())
        {
            // extract first panel
            var currentPanel = panelsToProcess.First();
            panelsToProcess.RemoveAt(0);

            // extract smallest fit, if there is none, create new stock panel
            var fit = freeRectangles.FirstOrDefault(r => r.ToPanel() >= currentPanel);
            if (fit is null)
            {
                usedStockPanels.Add(stockPanelTemplate);
                fit = new PositionedPanel(stockPanelTemplate.Length, stockPanelTemplate.Width, 0, 0);
            }
            else
            {
                freeRectangles.Remove(fit);
            }

            // place panel
            var placedPanel = currentPanel.ToPositioned(fit.X, fit.Y);
            optimizedPanels.Add(placedPanel);

            // add new free rectangles
            freeRectangles.UnionWith(NewFreeRectangles(fit, currentPanel));
        }

        return new OptimizationResult(
            Settings,
            usedStockPanels,
            optimizedPanels);
    }

    private IEnumerable<PositionedPanel> NewFreeRectangles(PositionedPanel fit, Panel currentPanel)
    {
        if (fit == currentPanel)
        {
            // panel fits perfectly 👌
            // so no new free rectangles
        }
        else if (fit.Length == currentPanel.Length)
        {
            var rectangle = fit with
            {
                Width = fit.Width - currentPanel.Width,
                Y = fit.Y + currentPanel.Width
            };

            yield return rectangle;
        }
        else if (fit.Width == currentPanel.Width)
        {
            var rectangle = fit with
            {
                Length = fit.Length - currentPanel.Length,
                X = fit.X + currentPanel.Length
            };

            yield return rectangle;
        }
        else
        {
            // prefer horizontal split/cut

            var rectangleBelow = fit with
            {
                Width = fit.Width - currentPanel.Width,
                Y = fit.Y + currentPanel.Width
            };

            var rectangleToRight = fit with
            {
                Length = fit.Length - currentPanel.Length,
                Width = currentPanel.Width,
                X = fit.X + currentPanel.Length
            };

            yield return rectangleBelow;
            yield return rectangleToRight;
        }
    }
}