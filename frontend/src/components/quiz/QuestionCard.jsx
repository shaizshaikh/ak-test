import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const QuestionCard = ({ 
  question, 
  questionIndex, 
  totalQuestions,
  onAnswerSelect,
  selectedAnswer = null,
  showCorrectAnswer = false,
  disabled = false,
  timeRemaining = null
}) => {
  return (
    <Card className="question-card">
      <Card.Header className="pb-0">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <Card.Title className="mb-1">
              Question {questionIndex + 1} of {totalQuestions}
            </Card.Title>
            <small className="text-muted">Choose the best answer</small>
          </div>
          {timeRemaining !== null && (
            <Badge 
              variant={timeRemaining <= 30 ? 'danger' : timeRemaining <= 60 ? 'warning' : 'success'}
              className="fs-6"
            >
              ⏱️ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </Badge>
          )}
        </div>
      </Card.Header>
      <Card.Body>
        <div className="question-text bg-light rounded p-4 mb-4">
          <h6 className="fw-bold text-dark mb-0">{question.questionText}</h6>
        </div>
        
        <div className="row g-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = showCorrectAnswer && option === question.correctOption;
            const isWrong = showCorrectAnswer && isSelected && !isCorrect;
            
            let buttonClass = 'option-button p-3 rounded d-flex align-items-center w-100 text-start';
            
            if (isCorrect) {
              buttonClass += ' border-success bg-success bg-opacity-10';
            } else if (isWrong) {
              buttonClass += ' border-danger bg-danger bg-opacity-10';
            } else if (isSelected) {
              buttonClass += ' border-primary bg-primary bg-opacity-10';
            } else {
              buttonClass += ' border-light bg-white';
            }
            
            return (
              <div key={index} className="col-md-6">
                <button
                  className={buttonClass}
                  onClick={() => !disabled && onAnswerSelect && onAnswerSelect(index)}
                  disabled={disabled}
                >
                  <Badge variant="secondary" className="me-3">
                    {String.fromCharCode(65 + index)}
                  </Badge>
                  <span className="flex-grow-1">{option}</span>
                  {isCorrect && <span className="text-success fw-bold ms-2">✓</span>}
                  {isWrong && <span className="text-danger fw-bold ms-2">✗</span>}
                </button>
              </div>
            );
          })}
        </div>
        
        {question.time && (
          <div className="mt-3 text-muted">
            <small>⏱️ Time limit: {question.time} minutes</small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default QuestionCard;