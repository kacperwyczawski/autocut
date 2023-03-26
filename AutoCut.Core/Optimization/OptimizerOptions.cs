﻿namespace AutoCut.Core.Optimization;

public class OptimizerOptions
{
    /// <summary>
    /// Blade thickness in mm
    /// </summary>
    public decimal BladeThickness { get; set; }

    /// <summary>
    /// Edge banding thickness in mm
    /// </summary>
    public decimal PanelEdgeReductionThickness { get; set; }

    /// <summary>
    /// Stock panel edge cutting thickness in mm
    /// </summary>
    public decimal SheetEdgeReductionThickness { get; set; }
}