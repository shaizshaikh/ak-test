import React from 'react';
import { Trophy } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const LeaderboardItem = ({ participant, rank, isCurrentUser = false }) => {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'warning';
      case 2: return 'secondary';
      case 3: return 'info';
      default: return 'light';
    }
  };

  return (
    <div className={`p-3 rounded d-flex align-items-center ${
      rank <= 3 ? `bg-${getRankColor(rank)} bg-opacity-10 border border-${getRankColor(rank)}` : 'bg-light border'
    } ${isCurrentUser ? 'border-primary border-2' : ''}`}>
      <div className="me-3 text-center" style={{minWidth: '50px'}}>
        <div className={`fw-bold ${rank <= 3 ? `text-${getRankColor(rank)}` : 'text-muted'}`}>
          #{rank}
        </div>
        {getRankIcon(rank) && <div>{getRankIcon(rank)}</div>}
      </div>
      
      <div className="flex-grow-1">
        <div className="d-flex align-items-center">
          <h6 className="mb-0 me-2">{participant.name}</h6>
          {isCurrentUser && <Badge variant="info" className="ms-2">You</Badge>}
        </div>
        <div className="d-flex align-items-center mt-1">
          <small className="text-muted me-3">
            Accuracy: {participant.accuracy || 0}%
          </small>
          {participant.avgTime && (
            <small className="text-muted">
              Avg Time: {participant.avgTime}s
            </small>
          )}
        </div>
      </div>
      
      <div className="text-end">
        <div className="fw-bold text-primary h5 mb-0">{participant.points || 0}</div>
        <small className="text-muted">points</small>
      </div>
    </div>
  );
};

const Leaderboard = ({ 
  participants = [], 
  title = "Leaderboard", 
  currentUser = null,
  showTop = null 
}) => {
  const sortedParticipants = [...participants].sort((a, b) => (b.points || 0) - (a.points || 0));
  const displayParticipants = showTop ? sortedParticipants.slice(0, showTop) : sortedParticipants;

  return (
    <Card>
      <Card.Header>
        <Card.Title className="mb-1">
          <Trophy size={20} className="me-2 text-warning" />
          {title}
        </Card.Title>
        <small className="text-muted">
          {participants.length} participant{participants.length !== 1 ? 's' : ''}
        </small>
      </Card.Header>
      <Card.Body>
        {displayParticipants.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-muted mb-2">🏆</div>
            <p className="text-muted mb-0">No participants yet</p>
          </div>
        ) : (
          <div className="d-grid gap-3">
            {displayParticipants.map((participant, index) => (
              <LeaderboardItem
                key={`${participant.name}-${index}`}
                participant={participant}
                rank={index + 1}
                isCurrentUser={currentUser && participant.name === currentUser}
              />
            ))}
          </div>
        )}
        
        {showTop && participants.length > showTop && (
          <div className="text-center mt-3">
            <small className="text-muted">
              Showing top {showTop} of {participants.length} participants
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default Leaderboard;