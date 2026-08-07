import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './QuranArabicCourse.css';
import api from '../../../../services/api';

type Resource = {
  id: number;
  title: string;
  url: string | null;
  resource_format: 'video' | 'audio' | 'pdf';
  position: number;
  is_locked: boolean;
};

type SubTopic = {
  id: number;
  title: string;
  description: string;
  position: number;
  resources: Resource[];
};

type Topic = {
  id: number;
  title: string;
  description: string;
  position: number;
  subtopics: SubTopic[];
};

type Course = {
  id: number;
  title: string;
  description: string;
  long_description: string;
  duration: string;
  instructor_name: string;
  rating: string;
  topics: Topic[];
};

const STORAGE_KEY = (courseId: string) => `hikmah_progress_${courseId}`;

const QuranArabicCourse = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  const [activeSubTopic, setActiveSubTopic] = useState<SubTopic | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<number[]>([]);
  const [assessments, setAssessments] = useState<{ id: number; name: string; assessment_type: string; question_count: number }[]>([]);

  // Load saved progress
  useEffect(() => {
    if (id) {
      const saved = localStorage.getItem(STORAGE_KEY(id));
      if (saved) setCompletedIds(JSON.parse(saved));
    }
  }, [id]);

  // Fetch assessments (module tests / final exam) for this course
  useEffect(() => {
    if (!id) return;
    api.get(`/api/v1/courses/assessments/?course=${id}`)
      .then((res) => setAssessments(res.data))
      .catch(() => {});
  }, [id]);

  // Fetch course
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/v1/courses/${id}/`);
        const data: Course = response.data;
        setCourse(data);

        if (data.topics.length > 0) {
          const firstTopic = data.topics[0];
          setActiveTopic(firstTopic);
          setExpandedTopics([firstTopic.id]);

          if (firstTopic.subtopics.length > 0) {
            const firstSubTopic = firstTopic.subtopics[0];
            setActiveSubTopic(firstSubTopic);

            if (firstSubTopic.resources.length > 0) {
              setActiveResource(firstSubTopic.resources[0]);
            }
          }
        }

        // Enroll the student the moment they open a course (safe to call repeatedly).
        // Silently ignored if not signed in — local progress still works either way.
        api.post(`/api/v1/courses/${id}/enroll/`).catch(() => {});
      } catch {
        setError('Failed to load course. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  // Flatten all resources for prev/next navigation
  const allResources = course?.topics.flatMap(topic =>
    topic.subtopics.flatMap(subtopic =>
      subtopic.resources.map(resource => ({
        ...resource,
        subtopicId: subtopic.id,
        topicId: topic.id,
      }))
    )
  ) ?? [];

  const activeIndex = allResources.findIndex(r => r.id === activeResource?.id);
  const totalLessons = allResources.length;
  const completedCount = completedIds.filter(cid =>
    allResources.some(r => r.id === cid)
  ).length;
  const progressPercent = totalLessons > 0
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;

  const markCompleted = (resourceId: number) => {
    if (!completedIds.includes(resourceId)) {
      const updated = [...completedIds, resourceId];
      setCompletedIds(updated);
      if (id) localStorage.setItem(STORAGE_KEY(id), JSON.stringify(updated));

      // If this was the last resource in its lesson, record the lesson as complete
      // server-side so it shows up on the My Learning page.
      const resourceEntry = allResources.find(r => r.id === resourceId);
      if (resourceEntry) {
        const parentTopic = course?.topics.find(t => t.id === resourceEntry.topicId);
        const parentSubTopic = parentTopic?.subtopics.find(s => s.id === resourceEntry.subtopicId);
        const allDone = parentSubTopic?.resources.every(
          r => r.id === resourceId || updated.includes(r.id)
        );
        if (parentSubTopic && allDone) {
          api.post(`/api/v1/courses/subtopics/${parentSubTopic.id}/complete/`).catch(() => {});
        }
      }
    }
  };

  const handleResourceSelect = (resource: Resource, subtopic: SubTopic, topic: Topic) => {
    setActiveResource(resource);
    setActiveSubTopic(subtopic);
    setActiveTopic(topic);
    if (!expandedTopics.includes(topic.id)) {
      setExpandedTopics(prev => [...prev, topic.id]);
    }
  };

  const toggleTopic = (topicId: number) => {
    setExpandedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(t => t !== topicId)
        : [...prev, topicId]
    );
  };

  const navigateResource = (direction: 'prev' | 'next') => {
    if (!course) return;
    let targetIndex = activeIndex;
    if (direction === 'prev' && activeIndex > 0) targetIndex = activeIndex - 1;
    else if (direction === 'next' && activeIndex < allResources.length - 1) targetIndex = activeIndex + 1;
    else return;

    const target = allResources[targetIndex];
    const parentTopic = course.topics.find(t => t.id === target.topicId);
    const parentSubTopic = parentTopic?.subtopics.find(s => s.id === target.subtopicId);

    if (parentTopic && parentSubTopic) {
      setActiveTopic(parentTopic);
      setActiveSubTopic(parentSubTopic);
      setActiveResource(target);
      if (!expandedTopics.includes(parentTopic.id)) {
        setExpandedTopics(prev => [...prev, parentTopic.id]);
      }
      if (direction === 'next' && activeResource) {
        markCompleted(activeResource.id);
      }
    }
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  if (isLoading) return (
    <div className="player-loading">
      <i className="fas fa-spinner fa-spin"></i>
      <p>Loading course...</p>
    </div>
  );

  if (error) return (
    <div className="player-error">
      <i className="fas fa-exclamation-circle"></i>
      <p>{error}</p>
      <Link to="/courses" className="back-link-dark">← Back to Courses</Link>
    </div>
  );

  if (!course) return null;

  return (
    <div className="course-container">

      {/* Top Header */}
      <header className="course-header">
        <div className="header-content">
          <div className="header-text">
            <Link to="/courses" className="back-link">← Back to Courses</Link>
            <h1>{course.title}</h1>
          </div>
          <div className="header-meta">
            <div className="course-meta">
              <span><i className="fas fa-clock"></i> {course.duration || 'TBD'}</span>
              <span><i className="fas fa-user"></i> {course.instructor_name}</span>
              <span><i className="fas fa-star"></i> {course.rating || 'New'}</span>
              <span><i className="fas fa-book-open"></i> {course.topics.length} modules</span>
            </div>
            <div className="course-progress-bar">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <span>{progressPercent}% complete · {completedCount}/{totalLessons} lessons</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="course-main-content">

        {/* LEFT — Sidebar always visible */}
        <div className="syllabus-sidebar">
          <div className="sidebar-header">
            <h3>Course Content</h3>
            <span className="lesson-count">{completedCount}/{totalLessons}</span>
          </div>

          <div className="syllabus-list">
            {course.topics.map((topic) => {
              const isExpanded = expandedTopics.includes(topic.id);
              const isActiveModule = activeTopic?.id === topic.id;

              return (
                <div key={topic.id} className="module">

                  {/* Module header */}
                  <div
                    className={`module-title ${isActiveModule ? 'active-module' : ''}`}
                    onClick={() => toggleTopic(topic.id)}
                  >
                    <i className={`fas ${isExpanded ? 'fa-folder-open' : 'fa-folder'}`}></i>
                    <span>{topic.title}</span>
                    <small>{topic.subtopics.length} lessons</small>
                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} chevron`}></i>
                  </div>

                  {/* Subtopics */}
                  {isExpanded && (
                    <div className="lessons-list">
                      {topic.subtopics.length === 0 ? (
                        <div className="no-lessons">No lessons yet</div>
                      ) : (
                        topic.subtopics.map((subtopic) => {
                          const isActiveSubTopic = activeSubTopic?.id === subtopic.id;
                          const subtopicCompleted = subtopic.resources.length > 0 &&
                            subtopic.resources.every(r => completedIds.includes(r.id));

                          return (
                            <div key={subtopic.id} className="subtopic-group">

                              {/* Subtopic header */}
                              <div className={`subtopic-title ${isActiveSubTopic ? 'active-subtopic' : ''}`}>
                                <i
                                  className={`fas ${subtopicCompleted ? 'fa-check-circle' : 'fa-circle'} subtopic-dot`}
                                  style={{
                                    color: subtopicCompleted ? '#16a34a'
                                      : isActiveSubTopic ? 'var(--primary)'
                                      : '#d1d5db'
                                  }}
                                ></i>
                                <span>{subtopic.title}</span>
                                <small>{subtopic.resources.length}</small>
                              </div>

                              {/* Resources */}
                              {subtopic.resources.map((resource) => {
                                const isActive = activeResource?.id === resource.id;
                                const isCompleted = completedIds.includes(resource.id);
                                return (
                                  <div
                                    key={resource.id}
                                    className={`lesson-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${resource.is_locked ? 'locked-row' : ''}`}
                                    onClick={() => handleResourceSelect(resource, subtopic, topic)}
                                  >
                                    <div className="lesson-play-icon">
                                      {isCompleted ? (
                                        <i className="fas fa-check-circle" style={{ color: '#16a34a' }}></i>
                                      ) : isActive ? (
                                        <i className="fas fa-play-circle" style={{ color: 'var(--primary)' }}></i>
                                      ) : (
                                        <i className={`fas ${
                                          resource.resource_format === 'video' ? 'fa-play-circle' :
                                          resource.resource_format === 'audio' ? 'fa-headphones' :
                                          'fa-file-pdf'
                                        }`} style={{ color: '#9ca3af' }}></i>
                                      )}
                                    </div>
                                    <div className="lesson-info">
                                      <div className="lesson-title">
                                        {resource.title}
                                        {resource.is_locked && (
                                          <i className="fas fa-lock lock-badge" title="Subscribe to unlock"></i>
                                        )}
                                      </div>
                                      <div className="lesson-duration">{resource.resource_format}</div>
                                    </div>
                                    {isActive && (
                                      <i className="fas fa-circle" style={{ color: 'var(--primary)', fontSize: '0.4rem' }}></i>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {assessments.length > 0 && (
            <div className="syllabus-assessments">
              <h4>Tests &amp; Exam</h4>
              {assessments.map((a) => (
                <Link key={a.id} to={`/assessments/${a.id}`} className="assessment-link">
                  <i className={`fas ${a.assessment_type === 'Exam' ? 'fa-award' : 'fa-file-circle-check'}`}></i>
                  <span>{a.name}</span>
                  <span className="assessment-link-count">{a.question_count} Qs</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Player always on the right */}
        {activeResource ? (
          <div className="video-content-area">
            <div className="video-player-container">

              {activeResource.is_locked ? (
                <div className="locked-panel">
                  <div className="locked-icon"><i className="fas fa-lock"></i></div>
                  <h3>This lesson is locked</h3>
                  <p>Subscribe to unlock every course and lesson on Hikmah for a full year.</p>
                  <button className="unlock-btn" onClick={() => navigate('/subscribe')}>
                    Subscribe to unlock
                  </button>
                </div>
              ) : (
              <>
              {/* Video */}
              {activeResource.resource_format === 'video' && (
                <div className="video-player">
                  <iframe
                    src={getEmbedUrl(activeResource.url ?? '')}
                    title={activeResource.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              {/* Audio */}
              {activeResource.resource_format === 'audio' && (
                <div className="audio-player-wrapper">
                  <i className="fas fa-headphones audio-icon"></i>
                  <h3>{activeResource.title}</h3>
                  <audio controls style={{ width: '100%' }}>
                    <source src={activeResource.url ?? ''} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

                  {/* PDF viewer */}
{activeResource.resource_format === 'pdf' && (
  <div className="pdf-wrapper">
    <i className="fas fa-file-pdf pdf-icon"></i>
    <h3>{activeResource.title}</h3>

    <a
      href={activeResource.url ?? '#'}
      target="_blank"
      rel="noreferrer"
      className="pdf-open-btn"
    >
      <i className="fas fa-download"></i> Open PDF
    </a>
  </div>
)}
              </>
              )}
              {/* Lesson Info */}
              <div className="video-info">
                <div className="video-info-top">
                  <div>
                    <h2>{activeResource.title}</h2>
                    <p className="lesson-topic-name">
                      <i className="fas fa-folder"></i> {activeTopic?.title}
                      <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem', margin: '0 0.3rem' }}></i>
                      {activeSubTopic?.title}
                    </p>
                    <p className="lesson-description">{activeSubTopic?.description}</p>
                  </div>
                  <button
                    className={`mark-complete-btn ${completedIds.includes(activeResource.id) ? 'already-done' : ''}`}
                    onClick={() => markCompleted(activeResource.id)}
                  >
                    {completedIds.includes(activeResource.id)
                      ? <><i className="fas fa-check"></i> Completed</>
                      : <><i className="far fa-check-circle"></i> Mark Complete</>
                    }
                  </button>
                </div>
                <div className="lesson-meta">
                  <span>Resource {activeIndex + 1} of {totalLessons}</span>
                  <span className="format-badge">{activeResource.resource_format}</span>
                </div>
              </div>

              {/* Navigation */}
              <div className="video-navigation">
                <button
                  className="nav-btn prev"
                  onClick={() => navigateResource('prev')}
                  disabled={activeIndex === 0}
                >
                  <i className="fas fa-arrow-left"></i> Previous
                </button>
                <button
                  className="nav-btn next"
                  onClick={() => navigateResource('next')}
                  disabled={activeIndex === allResources.length - 1}
                >
                  Next <i className="fas fa-arrow-right"></i>
                </button>
              </div>

            </div>
          </div>
        ) : (
          <div className="video-content-area">
            <div className="no-content">
              <i className="fas fa-play-circle"></i>
              <h3>Select a lesson to begin</h3>
              <p>Choose a lesson from the sidebar to start learning.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default QuranArabicCourse;