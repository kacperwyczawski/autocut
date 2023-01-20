using AutoCut.Core.Models.Panels;
using AutoCut.Core.Optimization;
using FluentAssertions;

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

        // act
        var actual = optimizer.Optimize(stockPanel, panels);

        // assert
        actual.OptimizedPanels.Should().BeEquivalentTo(
            new List<PositionedPanel> { new(100, 100, 0, 0) });
        actual.UsedStockPanels.Should().BeEquivalentTo(
            new List<StockPanel> { stockPanel });
    }
    
    [Fact]
    public void NoPanels()
    {
        // arrange
        var panels = new List<Panel>();
        var stockPanel = new StockPanel(2800, 2070, 18);
        var optimizer = new Optimizer();

        // act
        var actual = optimizer.Optimize(stockPanel, panels);

        // assert
        actual.OptimizedPanels.Should().BeEmpty();
        actual.UsedStockPanels.Should().BeEmpty();
    }
}