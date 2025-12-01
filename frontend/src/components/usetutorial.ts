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
