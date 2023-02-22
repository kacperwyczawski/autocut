using AutoCut.Core.Optimization;

namespace AutoCut.Frontend.Stores.Settings.Actions;

public class UpdateOptimizerOptionsAction
{
    public UpdateOptimizerOptionsAction(OptimizerOptions optimizerOptions)
    {
        OptimizerOptions = optimizerOptions;
    }

    public OptimizerOptions OptimizerOptions { get; }
}