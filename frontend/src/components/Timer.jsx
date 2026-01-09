// src/components/Timer.jsx
import React, { useEffect, useState } from "react";

function Timer({ duration, onEnd }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onEnd();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  return <div>Time Left: {timeLeft}s</div>;
}

export default Timer;
