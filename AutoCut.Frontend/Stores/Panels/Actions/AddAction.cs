﻿using AutoCut.Core.Models;

namespace AutoCut.Frontend.Stores.Panels.Actions;

public class AddAction
{
    public AddAction(CompressedPanel panel)
    {
        Panel = panel;
    }

    public CompressedPanel Panel { get; }
}