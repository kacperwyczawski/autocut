using AutoCut.Core.Panels;

namespace AutoCut.Core.Optimization;

public class Optimizer
{
    public OptimizationResult Optimize(StockPanel stockPanelTemplate, IEnumerable<CompressedPanel> compressedPanels,
        OptimizerOptions options)
    {
        var panels = compressedPanels.SelectMany(panel => panel.Decompress());
        return Optimize(stockPanelTemplate, panels, options);
    }

    public OptimizationResult Optimize(StockPanel stockPanelTemplate, IEnumerable<Panel> panels,
        OptimizerOptions options)
    {
        // TODO: check if list or enumerable is faster in freeRectangles than sorted set
        var freeRectangles = new SortedSet<FreeSpace>();
        var panelsToProcess = panels
            .OrderByDescending(p => p.Rectangle.Length)
            .ThenByDescending(p => p.Rectangle.Width)
            .ToList();
        var optimizedStockPanels = new List<OptimizedStockPanel>();

        foreach (var panel in panelsToProcess)
        {
            // extract smallest fit, if there is none, create new stock panel
            var fit = freeRectangles.FirstOrDefault(freeSpace =>
                freeSpace.PositionedRectangle.Rectangle.Length >= panel.Rectangle.Length &&
                freeSpace.PositionedRectangle.Rectangle.Width >= panel.Rectangle.Width);
            if (fit is null)
            {
                var newStockPanel = OptimizedStockPanel.Empty(stockPanelTemplate);
                optimizedStockPanels.Add(newStockPanel);
                fit = new FreeSpace(stockPanelTemplate.Panel.Rectangle.ToPositioned(0, 0), newStockPanel);
            }
            else
            {
                freeRectangles.Remove(fit);
            }

            // place panel
            fit.OptimizedStockPanel.Panels.Add(panel.ToPositioned(
                fit.PositionedRectangle.Position.X,
                fit.PositionedRectangle.Position.Y));

            // add new free rectangles
            freeRectangles.UnionWith(GenerateNewFreeRectangles(fit, panel, options));
        }

        return new OptimizationResult(options, optimizedStockPanels);
    }

    private static IEnumerable<FreeSpace> GenerateNewFreeRectangles(FreeSpace fit, Panel currentPanel,
        OptimizerOptions options)
    {
        if (fit.PositionedRectangle.Rectangle == currentPanel.Rectangle)
        {
            // panel fits perfectly 👌
            // so no new free rectangles
        }
        else if (fit.PositionedRectangle.Rectangle.Length == currentPanel.Rectangle.Length)
        {
            yield return fit with
            {
                PositionedRectangle = new PositionedRectangle(
                    Position: fit.PositionedRectangle.Position with
                    {
                        Y = fit.PositionedRectangle.Position.Y + currentPanel.Rectangle.Width + options.BladeThickness
                    },
                    Rectangle: fit.PositionedRectangle.Rectangle with
                    {
                        Width = fit.PositionedRectangle.Rectangle.Width - currentPanel.Rectangle.Width
                    })
            };
        }
        else if (fit.PositionedRectangle.Rectangle.Width == currentPanel.Rectangle.Width)
        {
            yield return fit with
            {
                PositionedRectangle = new PositionedRectangle(
                    Position: fit.PositionedRectangle.Position with
                    {
                        X = fit.PositionedRectangle.Position.X + currentPanel.Rectangle.Length + options.BladeThickness
                    },
                    Rectangle: fit.PositionedRectangle.Rectangle with
                    {
                        Length = fit.PositionedRectangle.Rectangle.Length - currentPanel.Rectangle.Length
                    })
            };
        }
        else
        {
            // prefer horizontal split/cut

            // panel below
            yield return fit with
            {
                PositionedRectangle = new PositionedRectangle(
                    Position: fit.PositionedRectangle.Position with
                    {
                        Y = fit.PositionedRectangle.Position.Y + currentPanel.Rectangle.Width + options.BladeThickness
                    },
                    Rectangle: fit.PositionedRectangle.Rectangle with
                    {
                        Width = fit.PositionedRectangle.Rectangle.Width - currentPanel.Rectangle.Width -
                                options.BladeThickness
                    })
            };

            // panel to the right
            yield return fit with
            {
                PositionedRectangle = new PositionedRectangle(
                    Position:
                    fit.PositionedRectangle.Position with
                    {
                        X = fit.PositionedRectangle.Position.X + currentPanel.Rectangle.Length + options.BladeThickness
                    },
                    Rectangle:
                    new Rectangle(
                        Length:
                        fit.PositionedRectangle.Rectangle.Length
                        - currentPanel.Rectangle.Length
                        - options.BladeThickness,
                        Width:
                        currentPanel.Rectangle.Width + options.BladeThickness))
            };
        }
    }
}