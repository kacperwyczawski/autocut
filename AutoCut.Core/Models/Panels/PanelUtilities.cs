namespace AutoCut.Core.Models.Panels;

public static class PanelUtilities
{
    public static IEnumerable<Panel> DecompressPanel(CompressedPanel compressedPanel) =>
        Enumerable.Repeat(compressedPanel.ToPanel(), compressedPanel.Quantity);

    public static Panel ToPanel<T>(this T panel) where T : Panel =>
        new Panel(panel.Lenght, panel.Width);
}