using AutoCut.Core.Models.Panels;

namespace AutoCut.Core.UnitTests.Models.Panels;

public class PanelUtilitiesTests
{
    [Fact]
    public void Decompression()
    {
        // arrange
        var panelToDecompress = new CompressedPanel(4, 20, 5);
        var expectedPanels = new List<Panel>
        {
            new (4, 20),
            new (4, 20),
            new (4, 20),
            new (4, 20),
            new (4, 20)
        };
        
        // act
        var decompressedPanels = panelToDecompress.Decompress();
        
        // assert
        Assert.Equal(expectedPanels, decompressedPanels);
    }
}