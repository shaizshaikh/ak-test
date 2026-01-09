import React from "react";

export default function Leaderboard({ rankings }) {
  return (
    <div className="card p-3">
      <h5>Leaderboard</h5>
      <ol>
        {rankings.map((p, i) => (
          <li key={i}>
            {p.name}: {p.points} points
          </li>
        ))}
      </ol>
    </div>
  );
}
