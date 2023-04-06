using AutoCut.Core.Models;
using AutoCut.Core.Optimization;

namespace AutoCut.Frontend.Stores.Settings.Actions;

public class UpdateSettingsAction
{
    public UpdateSettingsAction(OptimizerOptions optimizerOptions, Sheet sheetTemplate)
    {
        OptimizerOptions = optimizerOptions;
        SheetTemplate = sheetTemplate;
    }

    public OptimizerOptions OptimizerOptions { get; }

    public Sheet SheetTemplate { get; }
}