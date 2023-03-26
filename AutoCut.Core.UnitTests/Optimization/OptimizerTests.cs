using AutoCut.Core.Models;
using AutoCut.Core.Optimization;
using FluentAssertions;

namespace AutoCut.Core.UnitTests.Optimization;

public class OptimizerTests
{
    [Fact]
    public void NoPanels()
    {
        // arrange
        var sheet = Sheet.Default;
        var optimizer = new Optimizer();

        // act
        var actual = optimizer.Optimize(sheet, new List<Panel>(), new OptimizerOptions());

        // assert
        actual.OptimizedSheets.Should().BeEmpty();
    }

    [Fact]
    public void SinglePanel()
    {
        var panels = new List<Panel>
        {
            new(100, 100, EdgeReduction.NoEdges)
        };
        var sheet = Sheet.Default;
        var optimizer = new Optimizer();

        var actual = optimizer.Optimize(sheet, panels, new OptimizerOptions());

        actual.OptimizedSheets.Single().Panels.Should()
            .ContainSingle("", new OptimizedPanel(panels.First(), 0, 0));
        actual.OptimizedSheets.Should().ContainSingle();
    }

    [Fact]
    public void OneRow()
    {
        var panels = new List<Panel>
        {
            new(100, 200, EdgeReduction.NoEdges),
            new(100, 200, EdgeReduction.NoEdges),
            new(100, 200, EdgeReduction.NoEdges),
            new(100, 200, EdgeReduction.NoEdges),
        };
        var sheet = Sheet.Default;
        var optimizer = new Optimizer();

        var actual = optimizer.Optimize(sheet, panels, new OptimizerOptions());

        actual.OptimizedSheets.Single().Panels.Should()
            .BeEquivalentTo(
                new List<OptimizedPanel>
                {
                    new(panels[0], 0, 0),
                    new(panels[1], 100, 0),
                    new(panels[2], 200, 0),
                    new(panels[3], 300, 0)
                });
    }

    [Fact]
    public void OneRowIncludingBlade()
    {
        var panels = new List<Panel>
        {
            new(100, 200, EdgeReduction.NoEdges),
            new(100, 200, EdgeReduction.NoEdges),
            new(100, 200, EdgeReduction.NoEdges)
        };
        var sheet = Sheet.Default;
        var optimizer = new Optimizer();
        var options = new OptimizerOptions { BladeThickness = 3 };

        var actual = optimizer.Optimize(sheet, panels, options);

        actual.Options.BladeThickness.Should().Be(3);
        actual.OptimizedSheets.Single().Panels.Should()
            .BeEquivalentTo(
                new List<OptimizedPanel>
                {
                    new(panels[0], 0, 0),
                    new(panels[1], 103, 0),
                    new(panels[2], 206, 0)
                });
    }

    [Fact]
    public void OneRowDifferentSizes()
    {
        var panels = new List<Panel>
        {
            new(100, 200, EdgeReduction.NoEdges),
            new(100, 200, EdgeReduction.NoEdges),
            new(50, 50, EdgeReduction.NoEdges),
            new(50, 50, EdgeReduction.NoEdges)
        };
        var sheet = Sheet.Default;
        var optimizer = new Optimizer();

        var actual = optimizer.Optimize(sheet, panels, new OptimizerOptions());

        actual.OptimizedSheets.Single().Panels.Should()
            .BeEquivalentTo(
                new List<OptimizedPanel>
                {
                    new(panels[0], 0, 0),
                    new(panels[1], 100, 0),
                    new(panels[2], 200, 0),
                    new(panels[3], 250, 0)
                });
    }

    [Fact]
    public void MultipleRows()
    {
        var panels = new List<CompressedPanel>
        {
            new(new Panel(100, 200, EdgeReduction.NoEdges), 5)
        };
        var sheet = new Sheet(210, 2000, EdgeReduction.NoEdges, 10);
        var optimizer = new Optimizer();

        var actual = optimizer.Optimize(sheet, panels, new OptimizerOptions());

        var expectedPanel = panels.First().Decompress().First();
        actual.OptimizedSheets.Single().Panels.Should()
            .BeEquivalentTo(
                new List<OptimizedPanel>
                {
                    new(expectedPanel, 0, 0),
                    new(expectedPanel, 100, 0),
                    new(expectedPanel, 0, 200),
                    new(expectedPanel, 100, 200),
                    new(expectedPanel, 0, 400)
                });
    }

    [Fact]
    public void MultipleRowsMultipleSizes()
    {
        var panels = new List<CompressedPanel>
        {
            new(new Panel(100, 100, EdgeReduction.NoEdges), 5),
            new(new Panel(50, 50, EdgeReduction.NoEdges), 3)
        };
        var sheet = new Sheet(300, 300, EdgeReduction.NoEdges, 10);
        var optimizer = new Optimizer();

        var actual = optimizer.Optimize(sheet, panels, new OptimizerOptions());

        var expectedPanel1 = panels.First().Decompress().First();
        var expectedPanel2 = panels.Last().Decompress().First();
        actual.OptimizedSheets.Single().Panels.Should()
            .BeEquivalentTo(new List<OptimizedPanel>
            {
                new(expectedPanel1, 0, 0),
                new(expectedPanel1, 100, 0),
                new(expectedPanel1, 200, 0),
                new(expectedPanel1, 0, 100),
                new(expectedPanel1, 100, 100),

                new(expectedPanel2, 200, 100),
                new(expectedPanel2, 250, 100),
                new(expectedPanel2, 200, 150)
            });
    }

    [Fact]
    public void MultipleSheets()
    {
        var panels = new List<CompressedPanel>
        {
            new(new Panel(100, 100, EdgeReduction.NoEdges), 3)
        };
        var sheet = new Sheet(110, 120, EdgeReduction.NoEdges, 10);
        var optimizer = new Optimizer();

        var actual = optimizer.Optimize(sheet, panels, new OptimizerOptions());

        var expectedPanel = panels.First().Decompress().First();
        actual.OptimizedSheets.Should().HaveCount(3);
        foreach (var optimizedSheet in actual.OptimizedSheets)
        {
            optimizedSheet.Panels
                .Should().ContainSingle("",
                    new OptimizedPanel(expectedPanel, 0, 0));
        }
    }
}