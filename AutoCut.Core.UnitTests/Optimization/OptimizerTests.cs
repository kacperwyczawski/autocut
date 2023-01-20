using AutoCut.Core.Models.Panels;
using AutoCut.Core.Optimization;
using FluentAssertions;

namespace AutoCut.Core.UnitTests.Optimization;

public class OptimizerTests
{
    [Fact]
    public void NoPanels()
    {
        // arrange
        var stockPanel = new StockPanel(2800, 2070, 18);
        var optimizer = new Optimizer();

        // act
        var actual = optimizer.Optimize(stockPanel, new List<Panel>());

        // assert
        actual.OptimizedPanels.Should().BeEmpty();
        actual.UsedStockPanels.Should().BeEmpty();
    }

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
    public void OneRow()
    {
        var panels = new List<Panel>
        {
            new(100, 200),
            new(100, 200),
            new(100, 200),
            new(100, 200),
        };
        var stockPanel = new StockPanel(2800, 2070, 18);
        var optimizer = new Optimizer();

        var actual = optimizer.Optimize(stockPanel, panels);

        actual.OptimizedPanels.Should().BeEquivalentTo(
            new List<PositionedPanel>
            {
                new(100, 200, 0, 0),
                new(100, 200, 100, 0),
                new(100, 200, 200, 0),
                new(100, 200, 300, 0)
            });
        actual.UsedStockPanels.Should().HaveCount(1);
    }

    [Fact]
    public void OneRowIncludingBlade()
    {
        var panels = new List<Panel>
        {
            new(100, 200),
            new(100, 200),
            new(100, 200)
        };
        var stockPanel = new StockPanel(2800, 2070, 18);
        var optimizer = new Optimizer { Settings = { BladeThickness = 3 } };

        var actual = optimizer.Optimize(stockPanel, panels);

        actual.OptimizedPanels.Should().BeEquivalentTo(
            new List<PositionedPanel>
            {
                new(100, 200, 0, 0),
                new(100, 200, 103, 0),
                new(100, 200, 206, 0)
            });
        actual.Settings.BladeThickness.Should().Be(3);
    }

    [Fact]
    public void OneRowDifferentSizes()
    {
        var panels = new List<Panel>
        {
            new(100, 200),
            new(100, 200),
            new(50, 50),
            new(50, 50)
        };
        var stockPanel = new StockPanel(2800, 2070, 18);
        var optimizer = new Optimizer();

        var actual = optimizer.Optimize(stockPanel, panels);

        actual.OptimizedPanels.Should().BeEquivalentTo(
            new List<PositionedPanel>
            {
                new(100, 200, 0, 0),
                new(100, 200, 100, 0),
                new(50, 50, 200, 0),
                new(50, 50, 250, 0)
            });
    }

    [Fact]
    public void MultipleRows()
    {
        var panels = new List<CompressedPanel> { new(100, 200, 5) };
        var stockPanel = new StockPanel(210, 2000, 10);
        var optimizer = new Optimizer();

        var actual = optimizer.Optimize(stockPanel, panels);

        actual.OptimizedPanels.Should().BeEquivalentTo(
            new List<PositionedPanel>
            {
                new(100, 200, 0, 0),
                new(100, 200, 100, 0),
                new(100, 200, 0, 200),
                new(100, 200, 100, 200),
                new(100, 200, 0, 400)
            });
    }

    [Fact]
    public void MultipleRowsMultipleSizes()
    {
        var panels = new List<CompressedPanel>
        {
            new(100, 100, 5),
            new(50, 50, 2)
        };
        var stockPanel = new StockPanel(300, 300, 10);
        var optimizer = new Optimizer();

        var actual = optimizer.Optimize(stockPanel, panels);

        actual.OptimizedPanels
            .Should().BeSubsetOf(new List<PositionedPanel>
            {
                new(100, 100, 0, 0),
                new(100, 100, 100, 0),
                new(100, 100, 200, 0),
                new(100, 100, 0, 100),
                new(100, 100, 100, 100),

                new(50, 50, 200, 100),
                new(50, 50, 200, 150),
                new(50, 50, 250, 100)
            })
            .And.HaveCount(7);
    }
}