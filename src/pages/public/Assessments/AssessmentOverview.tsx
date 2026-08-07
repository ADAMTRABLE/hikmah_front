import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './AssessmentPages.css';

interface AssessmentInfo {
  id: number;
  name: string;
  assessment_type: 'Test' | 'Exam';
  passmark: number;
  time_limit_minutes: number | null;
  max_attempts: number | null;
  question_count: number;
}

interface AttemptRow {
  id: number;
  attempt_number: number;
  status: 'in_progress' | 'submitted';
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  started_at: string;
  submitted_at: string | null;
}

const AssessmentOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<AssessmentInfo | null>(null);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError('');
        const [assessmentRes, attemptsRes] = await Promise.all([
          api.get<AssessmentInfo>(`/api/v1/courses/assessments/${id}/`),
          api.get<AttemptRow[]>(`/api/v1/courses/assessments/${id}/my-attempts/`),
        ]);
        setAssessment(assessmentRes.data);
        setAttempts([...attemptsRes.data].sort((a, b) => b.attempt_number - a.attempt_number));
      } catch {
        setError('Failed to load this assessment. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="assessment-page">
        <div className="assessment-state"><i className="fas fa-spinner fa-spin"></i> Loading...</div>
      </div>
    );
  }

  if (error || !assessment) {
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

  const inProgress = attempts.find((a) => a.status === 'in_progress');
  const submittedCount = attempts.filter((a) => a.status === 'submitted').length;
  const attemptsExhausted = !inProgress && !!assessment.max_attempts && submittedCount >= assessment.max_attempts;
  const bestPercentage = attempts.length
    ? Math.max(...attempts.filter((a) => a.status === 'submitted').map((a) => a.percentage), 0)
    : 0;
  const hasPassed = attempts.some((a) => a.passed);

  return (
    <div className="assessment-page">
      <div className="assessment-overview-header">
        <span className="assessment-type-badge">{assessment.assessment_type === 'Exam' ? 'Course Exam' : 'Module Test'}</span>
        <h1>{assessment.name}</h1>
        <div className="assessment-overview-meta">
          <span><i className="fas fa-list-check"></i> {assessment.question_count} question{assessment.question_count !== 1 ? 's' : ''}</span>
          <span><i className="fas fa-bullseye"></i> {assessment.passmark}% to pass</span>
          <span><i className="fas fa-clock"></i> {assessment.time_limit_minutes ? `${assessment.time_limit_minutes} min` : 'Untimed'}</span>
          <span><i className="fas fa-repeat"></i> {assessment.max_attempts ? `${assessment.max_attempts} attempt${assessment.max_attempts !== 1 ? 's' : ''} allowed` : 'Unlimited attempts'}</span>
        </div>
      </div>

      {hasPassed && (
        <div className="assessment-overview-passed-banner">
          <i className="fas fa-circle-check"></i> You've already passed this {assessment.assessment_type === 'Exam' ? 'exam' : 'test'} (best score: {bestPercentage}%).
        </div>
      )}

      <div className="assessment-overview-actions">
        {attemptsExhausted ? (
          <div className="assessment-state-error" style={{ padding: '16px 0' }}>
            <i className="fas fa-lock"></i> You've used all {assessment.max_attempts} of your attempts.
          </div>
        ) : (
          <button className="assessment-btn-primary" onClick={() => navigate(`/assessments/${id}/take`)}>
            <i className={`fas ${inProgress ? 'fa-play' : 'fa-pen'}`}></i>
            {inProgress ? 'Resume Attempt' : attempts.length > 0 ? 'Start New Attempt' : 'Start'}
          </button>
        )}
      </div>

      <div className="assessment-overview-history">
        <h2>Your Attempts</h2>

        {attempts.length === 0 && (
          <p className="assessment-review-skipped">You haven't attempted this {assessment.assessment_type === 'Exam' ? 'exam' : 'test'} yet.</p>
        )}

        {attempts.length > 0 && (
          <div className="assessment-attempt-list">
            {attempts.map((a) => (
              <div key={a.id} className="assessment-attempt-row">
                <div className="assessment-attempt-row-main">
                  <span className="assessment-attempt-number">Attempt {a.attempt_number}</span>
                  {a.status === 'in_progress' ? (
                    <span className="assessment-attempt-status in-progress">In Progress</span>
                  ) : (
                    <span className={`assessment-attempt-status ${a.passed ? 'passed' : 'failed'}`}>
                      {a.passed ? 'Passed' : 'Failed'}
                    </span>
                  )}
                  <span className="assessment-attempt-date">
                    {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : `Started ${new Date(a.started_at).toLocaleDateString()}`}
                  </span>
                </div>
                <div className="assessment-attempt-row-score">
                  {a.status === 'submitted' && (
                    <>
                      <span className="assessment-attempt-percentage">{a.percentage}%</span>
                      <Link to={`/assessments/attempts/${a.id}/review`} className="assessment-btn-secondary assessment-btn-sm">
                        View Details
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentOverview;
