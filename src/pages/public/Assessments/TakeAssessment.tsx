import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../../services/api';
import './AssessmentPages.css';

interface ChoiceOption {
  id: number;
  text: string;
  position: number;
}

interface QuestionData {
  id: number;
  text: string;
  question_type: 'single' | 'multi' | 'boolean';
  points: number;
  position: number;
  choices: ChoiceOption[];
}

interface StartResponse {
  attempt: { id: number; attempt_number: number };
  time_limit_minutes: number | null;
  questions: QuestionData[];
}

const TakeAssessment = () => {
  const { id } = useParams(); // assessment id
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    const start = async () => {
      try {
        setIsLoading(true);
        setError('');
        const res = await api.post<StartResponse>(`/api/v1/courses/assessments/${id}/start/`);
        setAttemptId(res.data.attempt.id);
        setQuestions(res.data.questions);
        if (res.data.time_limit_minutes) {
          setSecondsLeft(res.data.time_limit_minutes * 60);
        }
      } catch (err: unknown) {
        const anyErr = err as { response?: { data?: { error?: string } } };
        setError(anyErr?.response?.data?.error || 'Could not start this assessment. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async () => {
    if (!attemptId || submittedRef.current) return;
    submittedRef.current = true;
    setIsSubmitting(true);
    try {
      await api.post(`/api/v1/courses/attempts/${attemptId}/submit/`);
      navigate(`/assessments/attempts/${attemptId}/review`);
    } catch {
      setError('Failed to submit. Please try again.');
      submittedRef.current = false;
      setIsSubmitting(false);
    }
  };

  // Countdown timer — auto-submits when it hits zero
  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => (s !== null ? s - 1 : s)), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const saveAnswer = async (questionId: number, selected: number[]) => {
    if (!attemptId) return;
    try {
      await api.post(`/api/v1/courses/attempts/${attemptId}/answer/`, {
        question: questionId,
        selected_choices: selected,
      });
    } catch {
      // Non-fatal — the student's local selection still holds; they can retry by re-selecting
    }
  };

  const handleSingleSelect = (question: QuestionData, choiceId: number) => {
    const selected = [choiceId];
    setAnswers((prev) => ({ ...prev, [question.id]: selected }));
    saveAnswer(question.id, selected);
  };

  const handleMultiToggle = (question: QuestionData, choiceId: number) => {
    const current = answers[question.id] || [];
    const selected = current.includes(choiceId)
      ? current.filter((c) => c !== choiceId)
      : [...current, choiceId];
    setAnswers((prev) => ({ ...prev, [question.id]: selected }));
    saveAnswer(question.id, selected);
  };

  if (isLoading) {
    return (
      <div className="assessment-page">
        <div className="assessment-state"><i className="fas fa-spinner fa-spin"></i> Loading...</div>
      </div>
    );
  }

  if (error && questions.length === 0) {
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

  const question = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="assessment-page">
      <div className="assessment-topbar">
        <div className="assessment-progress-text">
          Question {currentIndex + 1} of {questions.length} &middot; {answeredCount} answered
        </div>
        {secondsLeft !== null && (
          <div className={`assessment-timer ${secondsLeft < 60 ? 'urgent' : ''}`}>
            <i className="fas fa-clock"></i> {formatTime(secondsLeft)}
          </div>
        )}
      </div>

      <div className="assessment-progress-track">
        <div className="assessment-progress-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
      </div>

      {question && (
        <div className="assessment-question-card">
          <div className="assessment-question-meta">
            <span className="assessment-type-badge">
              {question.question_type === 'single' ? 'Choose one' : question.question_type === 'multi' ? 'Choose all that apply' : 'True or False'}
            </span>
            <span>{question.points} point{question.points !== 1 ? 's' : ''}</span>
          </div>
          <h2>{question.text}</h2>

          <div className="assessment-choices">
            {question.choices.map((choice) => {
              const isSelected = (answers[question.id] || []).includes(choice.id);
              return (
                <label key={choice.id} className={`assessment-choice ${isSelected ? 'selected' : ''}`}>
                  <input
                    type={question.question_type === 'multi' ? 'checkbox' : 'radio'}
                    name={`question-${question.id}`}
                    checked={isSelected}
                    onChange={() =>
                      question.question_type === 'multi'
                        ? handleMultiToggle(question, choice.id)
                        : handleSingleSelect(question, choice.id)
                    }
                  />
                  <span>{choice.text}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div className="assessment-nav">
        <button
          className="assessment-btn-secondary"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
        >
          <i className="fas fa-arrow-left"></i> Previous
        </button>

        <div className="assessment-nav-dots">
          {questions.map((q, i) => (
            <button
              key={q.id}
              className={`assessment-dot ${i === currentIndex ? 'active' : ''} ${answers[q.id] ? 'answered' : ''}`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to question ${i + 1}`}
            />
          ))}
        </div>

        {currentIndex < questions.length - 1 ? (
          <button className="assessment-btn-primary" onClick={() => setCurrentIndex((i) => i + 1)}>
            Next <i className="fas fa-arrow-right"></i>
          </button>
        ) : (
          <button className="assessment-btn-primary" onClick={() => setShowConfirm(true)}>
            <i className="fas fa-flag-checkered"></i> Submit
          </button>
        )}
      </div>

      {showConfirm && (
        <div className="assessment-modal-overlay" onClick={() => !isSubmitting && setShowConfirm(false)}>
          <div className="assessment-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Submit this attempt?</h3>
            <p>
              You've answered {answeredCount} of {questions.length} question{questions.length !== 1 ? 's' : ''}.
              {answeredCount < questions.length && ' Unanswered questions will be scored as incorrect.'}
              {' '}This cannot be undone.
            </p>
            <div className="assessment-modal-actions">
              <button className="assessment-btn-secondary" disabled={isSubmitting} onClick={() => setShowConfirm(false)}>
                Keep Working
              </button>
              <button className="assessment-btn-primary" disabled={isSubmitting} onClick={handleSubmit}>
                {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeAssessment;
