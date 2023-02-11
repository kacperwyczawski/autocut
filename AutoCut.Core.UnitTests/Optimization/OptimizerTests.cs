using AutoCut.Core.Optimization;
using AutoCut.Core.Panels;
using FluentAssertions;

namespace AutoCut.Core.UnitTests.Optimization;

public class OptimizerTests
{
    [Fact]
    public void NoPanels()
    {
        // arrange
        var stockPanel = StockPanel.Default;
        var optimizer = new Optimizer();

        // act
        var actual = optimizer.Optimize(stockPanel, new List<Panel>());

        // assert
        actual.OptimizedStockPanels.Should().BeEmpty();
    }

    [Fact]
    public void SinglePanel()
    {
        // arrange
        var panels = new List<Panel>
        {
            new(new Rectangle(100, 100), EdgeBanding.NoEdges)
        };
        var stockPanel = StockPanel.Default;
        var optimizer = new Optimizer();

        // act
        var actual = optimizer.Optimize(stockPanel, panels);

        // assert
        actual.OptimizedStockPanels.Single().Panels
            .Should().ContainSingle("",
                new PositionedPanel(
                    new PositionedRectangle(
                        new Rectangle(100, 100),
                        new Position(0, 0)),
                    EdgeBanding.NoEdges));
        actual.OptimizedStockPanels
            .Should().ContainSingle();
    }

    [Fact]
    public void OneRow()
    {
        var panels = new List<Panel>
        {
            new(new Rectangle(100, 200), EdgeBanding.NoEdges),
            new(new Rectangle(100, 200), EdgeBanding.NoEdges),
            new(new Rectangle(100, 200), EdgeBanding.NoEdges),
            new(new Rectangle(100, 200), EdgeBanding.NoEdges),
        };
        var stockPanel = StockPanel.Default;
        var optimizer = new Optimizer();

        var actual = optimizer.Optimize(stockPanel, panels);

        actual.OptimizedStockPanels.Single().Panels
            .Should().BeEquivalentTo(
                new List<PositionedPanel>
                {
                    new(new PositionedRectangle(new Rectangle(100, 200), new Position(0, 0)), EdgeBanding.NoEdges),
                    new(new PositionedRectangle(new Rectangle(100, 200), new Position(100, 0)), EdgeBanding.NoEdges),
                    new(new PositionedRectangle(new Rectangle(100, 200), new Position(200, 0)), EdgeBanding.NoEdges),
                    new(new PositionedRectangle(new Rectangle(100, 200), new Position(300, 0)), EdgeBanding.NoEdges)
                });
    }

    [Fact]
    public void OneRowIncludingBlade()
    {
        var panels = new List<Panel>
        {
            new(new Rectangle(100, 200), EdgeBanding.NoEdges),
            new(new Rectangle(100, 200), EdgeBanding.NoEdges),
            new(new Rectangle(100, 200), EdgeBanding.NoEdges)
        };
        var stockPanel = StockPanel.Default;
        var optimizer = new Optimizer { Settings = { BladeThickness = 3 } };

        var actual = optimizer.Optimize(stockPanel, panels);

        actual.Settings.BladeThickness.Should().Be(3);
        actual.OptimizedStockPanels.Single().Panels
            .Should().BeEquivalentTo(
                new List<PositionedPanel>
                {
                    new(new PositionedRectangle(new Rectangle(100, 200), new Position(0, 0)), EdgeBanding.NoEdges),
                    new(new PositionedRectangle(new Rectangle(100, 200), new Position(103, 0)), EdgeBanding.NoEdges),
                    new(new PositionedRectangle(new Rectangle(100, 200), new Position(206, 0)), EdgeBanding.NoEdges)
                });
    }

    [Fact]
    public void OneRowDifferentSizes()
    {
        var panels = new List<Panel>
        {
            new(new Rectangle(100, 200), EdgeBanding.NoEdges),
            new(new Rectangle(100, 200), EdgeBanding.NoEdges),
            new(new Rectangle(50, 50), EdgeBanding.NoEdges),
            new(new Rectangle(50, 50), EdgeBanding.NoEdges)
        };
        var stockPanel = StockPanel.Default;
        var optimizer = new Optimizer();

        var actual = optimizer.Optimize(stockPanel, panels);

        actual.OptimizedStockPanels.Single().Panels
            .Should().BeEquivalentTo(
                new List<PositionedPanel>
                {
                    new(new PositionedRectangle(new Rectangle(100, 200), new Position(0, 0)), EdgeBanding.NoEdges),
                    new(new PositionedRectangle(new Rectangle(100, 200), new Position(100, 0)), EdgeBanding.NoEdges),
                    new(new PositionedRectangle(new Rectangle(50, 50), new Position(200, 0)), EdgeBanding.NoEdges),
                    new(new PositionedRectangle(new Rectangle(50, 50), new Position(250, 0)), EdgeBanding.NoEdges)
                });
    }

    [Fact]
    public void MultipleRows()
    {
        var panels = new List<CompressedPanel>
        {
            new(new Panel(new Rectangle(100, 200), EdgeBanding.NoEdges), 5)
        };
        var stockPanel = new StockPanel(new Panel(new Rectangle(210, 2000), EdgeBanding.NoEdges), 10);
        var optimizer = new Optimizer();

        var actual = optimizer.Optimize(stockPanel, panels);

        actual.OptimizedStockPanels.Single().Panels
            .Should().BeEquivalentTo(
                new List<PositionedPanel>
                {
                    new(new PositionedRectangle(new Rectangle(100, 200), new Position(0, 0)), EdgeBanding.NoEdges),
                    new(new PositionedRectangle(new Rectangle(100, 200), new Position(100, 0)), EdgeBanding.NoEdges),
                    new(new PositionedRectangle(new Rectangle(100, 200), new Position(0, 200)), EdgeBanding.NoEdges),
                    new(new PositionedRectangle(new Rectangle(100, 200), new Position(100, 200)), EdgeBanding.NoEdges),
                    new(new PositionedRectangle(new Rectangle(100, 200), new Position(0, 400)), EdgeBanding.NoEdges)
                });
    }

    [Fact]
    public void MultipleRowsMultipleSizes()
    {
        var panels = new List<CompressedPanel>
        {
            new(new Panel(new Rectangle(100, 100), EdgeBanding.NoEdges), 5),
            new(new Panel(new Rectangle(50, 50), EdgeBanding.NoEdges), 2)
        };
        var stockPanel = new StockPanel(new Panel(new Rectangle(300, 300), EdgeBanding.NoEdges), 10);
        var optimizer = new Optimizer();

        var actual = optimizer.Optimize(stockPanel, panels);

        actual.OptimizedStockPanels.Single().Panels
            .Should().BeSubsetOf(new List<PositionedPanel>
            {
                new(new PositionedRectangle(new Rectangle(100, 100), new Position(0, 0)), EdgeBanding.NoEdges),
                new(new PositionedRectangle(new Rectangle(100, 100), new Position(100, 0)), EdgeBanding.NoEdges),
                new(new PositionedRectangle(new Rectangle(100, 100), new Position(200, 0)), EdgeBanding.NoEdges),
                new(new PositionedRectangle(new Rectangle(100, 100), new Position(0, 100)), EdgeBanding.NoEdges),
                new(new PositionedRectangle(new Rectangle(100, 100), new Position(100, 100)), EdgeBanding.NoEdges),

                new(new PositionedRectangle(new Rectangle(50, 50), new Position(200, 100)), EdgeBanding.NoEdges),
                new(new PositionedRectangle(new Rectangle(50, 50), new Position(200, 150)), EdgeBanding.NoEdges),
                new(new PositionedRectangle(new Rectangle(50, 50), new Position(250, 100)), EdgeBanding.NoEdges)
            })
            .And.HaveCount(7);
    }

    [Fact]
    public void MultipleStockPanels()
    {
        var panels = new List<CompressedPanel>
        {
            new(new Panel(new Rectangle(100, 100), EdgeBanding.NoEdges), 3)
        };
        var stockPanel = new StockPanel(new Panel(new Rectangle(110, 120), EdgeBanding.NoEdges), 10);
        var optimizer = new Optimizer();

        var actual = optimizer.Optimize(stockPanel, panels);

        actual.OptimizedStockPanels
            .Should().HaveCount(3);
        foreach (var optimizedStockPanel in actual.OptimizedStockPanels)
        {
            optimizedStockPanel.Panels
                .Should().ContainSingle("",
                    new PositionedPanel(
                        new PositionedRectangle(
                            new Rectangle(100, 100),
                            new Position(0, 0)),
                        EdgeBanding.NoEdges));
        }
    }
}