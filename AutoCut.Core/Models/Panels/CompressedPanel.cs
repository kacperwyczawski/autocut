namespace AutoCut.Core.Models.Panels;

public record CompressedPanel(int Lenght, int Width, int Quantity) : Panel(Lenght, Width);