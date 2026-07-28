import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../services/api';
import './AssessmentPages.css';

interface ChoiceOption {
  id: number;
  text: string;
}

interface ReviewAnswer {
  id: number;
  question: number;
  question_text: string;
  question_points: number;
  question_choices: ChoiceOption[];
  selected_choice_ids: number[];
  correct_choice_ids: number[];
  points_earned: number;
}

interface AttemptSummary {
  id: number;
  assessment_name: string;
  attempt_number: number;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  submitted_at: string;
}

interface ReviewResponse {
  attempt: AttemptSummary;
  answers: ReviewAnswer[];
}

const AssessmentReview = () => {
  const { attemptId } = useParams();
  const [data, setData] = useState<ReviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError('');
        const res = await api.get<ReviewResponse>(`/api/v1/courses/attempts/${attemptId}/review/`);
        setData(res.data);
      } catch {
        setError('Failed to load this result. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [attemptId]);

  if (isLoading) {
    return (
      <div className="assessment-page">
        <div className="assessment-state"><i className="fas fa-spinner fa-spin"></i> Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="assessment-page">
        <div className="assessment-state assessment-state-error">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <Link to="/my/learning" className="assessment-btn-secondary">Back to My Learning</Link>
        </div>
      </div>
    );
  }

  const { attempt, answers } = data;

  return (
    <div className="assessment-page">
      <div className={`assessment-result-banner ${attempt.passed ? 'passed' : 'failed'}`}>
        <i className={`fas ${attempt.passed ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i>
        <div>
          <h1>{attempt.passed ? 'You passed!' : 'Not quite there'}</h1>
          <p>{attempt.assessment_name} &middot; Attempt {attempt.attempt_number}</p>
        </div>
        <div className="assessment-result-score">
          <span className="assessment-result-percentage">{attempt.percentage}%</span>
          <span>{attempt.score} / {attempt.max_score} pts</span>
        </div>
      </div>

      <div className="assessment-review-list">
        {answers.map((answer, index) => {
          const isCorrect = answer.points_earned >= answer.question_points;
          const isPartial = answer.points_earned > 0 && answer.points_earned < answer.question_points;
          return (
            <div key={answer.id} className="assessment-review-card">
              <div className="assessment-review-header">
                <span className="assessment-review-number">Q{index + 1}</span>
                <h3>{answer.question_text}</h3>
                <span className={`assessment-review-points ${isCorrect ? 'full' : isPartial ? 'partial' : 'none'}`}>
                  {answer.points_earned} / {answer.question_points} pts
                </span>
              </div>
              <div className="assessment-review-choices">
                {answer.question_choices.map((choice) => {
                  const wasSelected = answer.selected_choice_ids.includes(choice.id);
                  const isRight = answer.correct_choice_ids.includes(choice.id);
                  let cls = '';
                  if (isRight) cls = 'correct';
                  if (wasSelected && !isRight) cls = 'incorrect';
                  return (
                    <div key={choice.id} className={`assessment-review-choice ${cls}`}>
                      <i className={`fas ${wasSelected ? 'fa-circle-dot' : 'fa-circle'}`}></i>
                      <span>{choice.text}</span>
                      {isRight && <i className="fas fa-check assessment-review-correct-mark"></i>}
                      {wasSelected && !isRight && <i className="fas fa-times assessment-review-wrong-mark"></i>}
                    </div>
                  );
                })}
                {answer.selected_choice_ids.length === 0 && (
                  <p className="assessment-review-skipped">You didn't answer this question.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="assessment-review-footer">
        <Link to="/my/learning" className="assessment-btn-secondary">Back to My Learning</Link>
      </div>
    </div>
  );
};

export default AssessmentReview;
