namespace AutoCut.Core.Optimization;

public class OptimizerSettings
{
    /// <summary>
    /// Blade thickness in mm
    /// </summary>
    public int BladeThickness { get; set; }
    
    public OptimizationMethod Method { get; set; } = OptimizationMethod.OwnAlgorithm;
    
    public enum OptimizationMethod
    {
        OwnAlgorithm
    }
}