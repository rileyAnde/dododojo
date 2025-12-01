import React, { useEffect, useState } from "react";

interface SpotlightOverlayProps {
  visible: boolean;
  text: string;
  targetRef?: React.RefObject<HTMLElement>;
  onNext: () => void;
  onSkip: () => void;
}

export default function SpotlightOverlay({
  visible,
  text,
  targetRef,
  onNext,
  onSkip,
}: SpotlightOverlayProps) {
  const [rect, setRect] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    if (!visible || !targetRef?.current) return;

    const r = targetRef.current.getBoundingClientRect();
    const pad = 12;

    setRect({
      top: r.top - pad,
      left: r.left - pad,
      width: r.width + pad * 2,
      height: r.height + pad * 2
    });
  }, [visible, targetRef]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">

      {/* TOP overlay */}
      <div
        className="absolute bg-black/70 backdrop-blur-sm pointer-events-auto"
        style={{
          top: 0,
          left: 0,
          width: "100%",
          height: rect.top
        }}
      />

      {/* BOTTOM overlay */}
      <div
        className="absolute bg-black/70 backdrop-blur-sm pointer-events-auto"
        style={{
          top: rect.top + rect.height,
          left: 0,
          width: "100%",
          height: `calc(100% - ${rect.top + rect.height}px)`
        }}
      />

      {/* LEFT overlay */}
      <div
        className="absolute bg-black/70 backdrop-blur-sm pointer-events-auto"
        style={{
          top: rect.top,
          left: 0,
          width: rect.left,
          height: rect.height
        }}
      />

      {/* RIGHT overlay */}
      <div
        className="absolute bg-black/70 backdrop-blur-sm pointer-events-auto"
        style={{
          top: rect.top,
          left: rect.left + rect.width,
          width: `calc(100% - ${rect.left + rect.width}px)`,
          height: rect.height
        }}
      />

      {/* Border around spotlight */}
      <div
        className="absolute border-4 border-cyan-400 rounded-xl pointer-events-none transition-all duration-300"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        }}
      />

      {/* Tutorial content */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white text-black p-6 rounded-xl max-w-xl pointer-events-auto shadow-xl">
        <p className="text-lg mb-4">{text}</p>

        <div className="flex justify-end gap-4">
          <button
            onClick={onSkip}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Skip
          </button>

          <button
            onClick={onNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
}
