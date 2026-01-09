import React, { useEffect } from "react";

export default function CountdownTimer({ timeLeft, onTimeUp }) {
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    const timer = setInterval(() => {
      onTimeUp(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  return (
    <div>
      Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
    </div>
  );
}
