namespace AutoCut.Core.Models.Panels;

public static class PanelUtilities
{
    public static IEnumerable<Panel> Decompress(this CompressedPanel compressedPanel) =>
        Enumerable.Repeat(compressedPanel.ToPanel(), compressedPanel.Quantity);

    public static Panel ToPanel<TFrom>(this TFrom from) where TFrom : Panel =>
        new Panel(from.Lenght, from.Width);
}