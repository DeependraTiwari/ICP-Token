import React, { useEffect, useState } from "react";

export default function TimerDisplay() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      setElapsed(Math.floor((now - start) / 1000)); // in seconds
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="text-center mt-5">
      <p className="text-sm text-gray-300">⏱️ Uptime</p>
      <p className="text-lg font-mono text-cyan-300 animate-glow">
        {formatTime(elapsed)}
      </p>
    </div>
  );
}
