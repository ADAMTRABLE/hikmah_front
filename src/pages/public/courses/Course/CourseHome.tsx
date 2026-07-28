import { useState, useEffect } from 'react';
import './CourseHome.css';
import { Link } from 'react-router-dom';
import api from '../../../../services/api';

type Course = {
  id: number;
  title: string;
  description: string;
  long_description: string;
  duration: string;
  instructor_name: string;
  rating: string;
  icon: string;
  tag: string;
  cover_image: string | null;
  category: number;
  category_name: string;
  category_slug: string;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  course_count: number;
};

const arabicQuotes = [
  "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ",
  "يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ",
  "اقْرَأْ وَرَبُّكَ الْأَكْرَمُ"
];

const CourseHome = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [arabicQuoteIndex, setArabicQuoteIndex] = useState<number>(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Rotate arabic quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setArabicQuoteIndex(prev => (prev + 1) % arabicQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch categories and courses from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [coursesRes, categoriesRes] = await Promise.all([
          api.get('/api/v1/courses/'),
          api.get('/api/v1/courses/categories/'),
        ]);
        setCourses(coursesRes.data);
        setCategories(categoriesRes.data);
      } catch {
        setError('Failed to load courses. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCourses = activeCategory === 'all'
    ? courses
    : courses.filter(course => course.category_slug === activeCategory);

  return (
    <div className="course-home">
      {/* Hero Section */}
      <section className="hero">
        <h1>Islamic Knowledge Courses</h1>
        <p>Embark on a journey of spiritual growth and intellectual enlightenment with our comprehensive Islamic curriculum taught by qualified scholars.</p>
        <div className="arabic-hero">{arabicQuotes[arabicQuoteIndex]}</div>
        <p>"Seeking knowledge is an obligation upon every Muslim." - Prophet Muhammad (PBUH)</p>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="section-title">
          <h2>Course Categories</h2>
        </div>

        {/* Category tabs — from backend */}
        <div className="category-tabs">
          <button
            className={`tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Courses
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              className={`tab-btn ${activeCategory === category.slug ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.slug)}
            >
              {category.name}
              {category.course_count > 0 && (
                <span style={{
                  marginLeft: '6px',
                  background: 'rgba(255,255,255,0.3)',
                  borderRadius: '10px',
                  padding: '1px 7px',
                  fontSize: '0.8rem'
                }}>
                  {category.course_count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#027173' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
            <p style={{ marginTop: '1rem' }}>Loading courses...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
            <i className="fas fa-exclamation-circle" style={{ fontSize: '2rem' }}></i>
            <p style={{ marginTop: '1rem' }}>{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredCourses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#777' }}>
            <i className="fas fa-book-open" style={{ fontSize: '2rem' }}></i>
            <p style={{ marginTop: '1rem' }}>No courses found in this category yet.</p>
          </div>
        )}

        {/* Courses grid */}
        {!isLoading && !error && filteredCourses.length > 0 && (
          <div className="courses-grid">
            {filteredCourses.map(course => (
              <div
                key={course.id}
                className="course-card"
                onMouseEnter={e => e.currentTarget.classList.add('hovered')}
                onMouseLeave={e => e.currentTarget.classList.remove('hovered')}
              >
                <div className="course-cover">
                  {course.cover_image ? (
                    <img src={course.cover_image} alt={course.title} loading="lazy" />
                  ) : (
                    <div className="course-cover-fallback">
                      <i className={`fas fa-${course.icon || 'book-quran'}`}></i>
                    </div>
                  )}
                  <div className="course-cover-overlay" />
                  {course.category_name && (
                    <span className="course-category-badge">{course.category_name}</span>
                  )}
                  {course.tag && (
                    <span className="course-tag-badge">{course.tag}</span>
                  )}
                </div>

                <div className="course-body">
                  <h3>{course.title}</h3>
                  <p className="course-description">
                    {course.description}
                  </p>

                  <div className="course-meta">
                    <div className="meta-item">
                      <i className="fas fa-user-tie"></i>
                      <span>{course.instructor_name}</span>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-clock"></i>
                      <span>{course.duration || 'Self-paced'}</span>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-star"></i>
                      <span>{course.rating || 'New'}</span>
                    </div>
                  </div>

                  <Link to={`/courses/${course.id}`} className="enroll-btn">
                    Enroll Now <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-column">
            <h3>Hikmah Institute</h3>
            <p>Premier online Islamic education platform providing authentic knowledge with qualified scholars.</p>
            <p>"Seeking knowledge is obligatory upon every Muslim."</p>
          </div>
          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Courses</a></li>
              <li><a href="#">Faculty</a></li>
              <li><a href="#">Events</a></li>
              <li><a href="#">Library</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Contact Us</h3>
            <ul>
              <li><i className="fas fa-envelope"></i> contact@Hikmah.edu</li>
              <li><i className="fas fa-phone"></i> +1 (234) 567-8900</li>
              <li><i className="fas fa-map-marker-alt"></i> 123 Knowledge Street, Islamic City</li>
            </ul>
          </div>
        </div>
        <div className="copyright">
          <p>&copy; {new Date().getFullYear()} Hikmah Premier Institute. All rights reserved.</p>
          <p>Designed with <i className="fas fa-heart"></i> for the Ummah</p>
        </div>
      </footer>
    </div>
  );
};

export default CourseHome;