using AutoCut.Core.Models.Panels;
using AutoCut.Core.Optimization;

namespace AutoCut.Core.UnitTests.Optimization;

public class OptimizerTests
{
    [Fact]
    public void SinglePanel()
    {
        // arrange
        var panels = new List<Panel> { new(100, 100) };
        var stockPanel = new StockPanel(2800, 2070, 18);
        var optimizer = new Optimizer();

        var expected = new OptimizationResult(
            1,
            new OptimizerSettings(),
            new List<StockPanel> { stockPanel },
            new List<OptimizedPanel> { new(100, 100, 0, 0) });
        
        // act
        var actual = optimizer.Optimize(stockPanel, panels);
        
        // assert
        Assert.Equal(expected, actual);
    }
}