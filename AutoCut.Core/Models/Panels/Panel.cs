namespace AutoCut.Core.Models.Panels;

public record Panel(int Lenght, int Width)
{
    public int Area => Lenght * Width;
}