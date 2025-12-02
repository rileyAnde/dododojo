/*
Functions:
- useTutorial --> manages state for a multi-step tutorial sequence

Inputs:
- steps --> array of tutorial step objects to iterate through

Outputs:
- index --> current tutorial step index
- active --> boolean indicating if the tutorial is still running
- step --> the current step object
- next --> advances to the next step or ends the tutorial
- skip --> immediately deactivates the tutorial

Outside sources:
- GitHub Copilot

Authors:
- Riley Anderson, Colin Treanor, Dustin Le, Jacob Richards

Creation Date:
- 11/30/2025
*/

import { useState } from "react";

export function useTutorial(steps: any[]) {
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(true);

  const current = steps[index];

  const next = () => {
    if (index < steps.length - 1) setIndex(i => i + 1);
    else setActive(false);
  };

  const skip = () => setActive(false);

  return {
    index,
    active,
    step: current,
    next,
    skip
  };
}
