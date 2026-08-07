import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { getMediaUrl } from '../../../utils/media';
import './MyLearningPage.css';

interface EnrollmentRow {
  id: number;
  course: number;
  course_title: string;
  course_icon: string;
  course_cover_image: string | null;
  course_instructor_name: string;
  total_lessons: number;
  completed_lessons: number;
  last_accessed: string;
}

const MyLearningPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        setIsLoading(true);
        setError('');
        const res = await api.get<EnrollmentRow[]>('/api/v1/my/learning/');
        setEnrollments(res.data);
      } catch {
        setError('Failed to load your learning. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="my-learning-page">
        <div className="my-learning-state"><i className="fas fa-spinner fa-spin"></i></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const inProgress = enrollments.filter((e) => e.completed_lessons < e.total_lessons);
  const finished = enrollments.filter((e) => e.total_lessons > 0 && e.completed_lessons >= e.total_lessons);

  const renderCard = (enrollment: EnrollmentRow) => {
    const percent = enrollment.total_lessons > 0
      ? Math.round((enrollment.completed_lessons / enrollment.total_lessons) * 100)
      : 0;
    const isComplete = percent >= 100;

    return (
      <Link to={`/courses/${enrollment.course}`} className="learning-card" key={enrollment.id}>
        <div className="learning-card-cover">
          {enrollment.course_cover_image ? (
            <img src={getMediaUrl(enrollment.course_cover_image)} alt={enrollment.course_title} />
          ) : (
            <div className="learning-card-cover-fallback">
              <i className={`fas fa-${enrollment.course_icon || 'book-quran'}`}></i>
            </div>
          )}
          {isComplete && <span className="learning-badge-complete"><i className="fas fa-check"></i> Completed</span>}
        </div>
        <div className="learning-card-body">
          <h3>{enrollment.course_title}</h3>
          <p className="learning-instructor">with {enrollment.course_instructor_name}</p>

          <div className="learning-progress-track">
            <div className="learning-progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <div className="learning-progress-meta">
            <span>{enrollment.completed_lessons} of {enrollment.total_lessons} lessons</span>
            <span>{percent}%</span>
          </div>

          <span className="learning-continue">
            {isComplete ? 'Review Course' : enrollment.completed_lessons > 0 ? 'Continue Learning' : 'Start Learning'}
            <i className="fas fa-arrow-right"></i>
          </span>
        </div>
      </Link>
    );
  };

  return (
    <div className="my-learning-page">
      <section className="my-learning-hero">
        <h1>My Learning</h1>
        <p>Pick up where you left off, or revisit a course you've completed.</p>
      </section>

      <section className="my-learning-container">
        {isLoading && (
          <div className="my-learning-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading your learning...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="my-learning-state my-learning-state-error">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && enrollments.length === 0 && (
          <div className="my-learning-empty">
            <i className="fas fa-book-open"></i>
            <h2>You haven't started any courses yet</h2>
            <p>Explore our course catalog and begin your learning journey.</p>
            <Link to="/courses" className="my-learning-browse-btn">Browse Courses</Link>
          </div>
        )}

        {!isLoading && !error && inProgress.length > 0 && (
          <div className="learning-section">
            <h2>Continue Learning</h2>
            <div className="learning-grid">
              {inProgress.map(renderCard)}
            </div>
          </div>
        )}

        {!isLoading && !error && finished.length > 0 && (
          <div className="learning-section">
            <h2>Completed</h2>
            <div className="learning-grid">
              {finished.map(renderCard)}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default MyLearningPage;
