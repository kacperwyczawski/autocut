using System.Globalization;

namespace AutoCut.Frontend.Stores.Settings.Actions;

public class UpdateCultureAction
{
    public UpdateCultureAction(CultureInfo culture)
    {
        Culture = culture;
    }

    public CultureInfo Culture { get; }
}