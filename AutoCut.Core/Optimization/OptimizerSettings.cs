namespace AutoCut.Core.Optimization;

public class OptimizerSettings
{
    /// <summary>
    /// Blade thickness in mm
    /// </summary>
    public int BladeThickness { get; set; }
    
    /// <summary>
    /// Edge banding thickness in mm
    /// </summary>
    public int EdgeBandingThickness { get; set; }
    
    /// <summary>
    /// Stock panel edge cutting thickness in mm
    /// </summary>
    public int StockPanelEdgeCuttingThickness { get; set; }
}