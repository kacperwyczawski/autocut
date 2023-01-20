using System.Runtime.InteropServices;
using System.Runtime.InteropServices.ComTypes;
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

    public OptimizationResult Optimize(StockPanel stockPanelTemplate, IEnumerable<Panel> panels) =>
        Settings.Method switch
        {
            OptimizerSettings.OptimizationMethod.OwnAlgorithm => OptimizeUsingOwnAlgorithm(stockPanelTemplate,
                panels),
            _ => throw new InvalidOperationException("Unknown optimization method")
        };

    public OptimizationResult Optimize(StockPanel stockPanelTemplate, IEnumerable<CompressedPanel> compressedPanels)
    {
        var panels = compressedPanels.SelectMany(panel => panel.Decompress());
        return Optimize(stockPanelTemplate, panels);
    }

    private OptimizationResult OptimizeUsingOwnAlgorithm(StockPanel stockPanelTemplate,
        IEnumerable<Panel> panels)
    {
        // TODO: check if list or enumerable is faster in freeRectangles
        var usedStockPanels = new List<StockPanel> { stockPanelTemplate };
        // TODO: specify comparer in settings (applies to freeRectangles and panelsToProcess)
        var freeRectangles = new SortedSet<Panel>(PanelComparerFactory.CreateComparer())
            { stockPanelTemplate.ToPanel() };
        var panelsToProcess = panels.OrderBy(p => p.Lenght).ThenBy(p => p.Width).ToList();
        var optimizedPanels = new List<OptimizedPanel>();

        while (panelsToProcess.Any())
        {
            var optimizedPanel = FitPanel(panelsToProcess[0], out freeRectangles, out usedStockPanels);
            optimizedPanels.Add(optimizedPanel);
            panelsToProcess.RemoveAt(0);
        }

        return new OptimizationResult(
            usedStockPanels.Count,
            Settings,
            usedStockPanels,
            optimizedPanels);
    }

    /// <summary>
    /// Fits the panel into the free rectangles.
    /// </summary>
    /// <param name="panel">
    /// The panel to fit.
    /// </param>
    /// <param name="freeRectangles">
    /// The free rectangles. Will be modified and returned via out parameter.
    /// </param>
    /// <param name="usedStockPanels">
    /// The used stock panels. Will be modified and returned via out parameter.
    /// </param>
    /// <returns>
    /// The optimized panel and (via out parameter) the new free rectangles.
    /// </returns>
    private OptimizedPanel FitPanel(Panel panel, out SortedSet<Panel> freeRectangles,
        out List<StockPanel> usedStockPanels)
    {
        throw new NotImplementedException();
    }
}