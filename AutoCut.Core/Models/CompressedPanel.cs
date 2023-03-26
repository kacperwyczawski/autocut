namespace AutoCut.Core.Models;

public class CompressedPanel
{
    public Panel Panel { get; }

    public int Quantity { get; set; }

    public CompressedPanel(Panel panel, int quantity)
    {
        Panel = panel;
        Quantity = quantity;
    }

    public IEnumerable<Panel> Decompress() =>
        Enumerable.Repeat(Panel, Quantity);

    public static CompressedPanel Default => new CompressedPanel(Panel.Default, 0);
}