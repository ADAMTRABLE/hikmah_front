import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import styles from './Home.module.css';

// ─── API shapes ───
interface ApiCourse {
  id: number;
  title: string;
  description: string;
  long_description: string;
  duration: string;
  rating: string;
  icon: string;
  tag: string;
  cover_image: string | null;
  category: number | null;
  category_name: string;
  category_slug: string;
  instructor_name: string;
}

interface ApiLibraryResource {
  id: number;
  category: string;
  subcategory: string;
  title: string;
  description: string;
  author_name: string;
  author_initials: string;
  resource_type: string;
  icon: string;
  url: string | null;
  is_locked: boolean;
  created_at: string;
}

interface ApiSheikh {
  id: number;
  name: string;
  title: string;
  bio: string;
  avatar_icon: string;
  is_active: boolean;
}

const Home = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [videos, setVideos] = useState<ApiLibraryResource[]>([]);
  const [articles, setArticles] = useState<ApiLibraryResource[]>([]);
  const [sheikhs, setSheikhs] = useState<ApiSheikh[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // ─── Hero background slideshow ───
  // Place your 4 photos at public/images/slide1.jpg ... slide4.jpg — no rebuild needed,
  // the page falls back to the brand gradient if a file is missing.
  const heroImages = [
    { id: 1, url: '/images/slide1.jpg', alt: 'Students studying the Quran' },
    { id: 2, url: '/images/slide2.jpg', alt: 'Islamic learning session' },
    { id: 3, url: '/images/slide3.jpg', alt: 'Community learning together' },
    { id: 4, url: '/images/slide4.jpg', alt: 'Islamic history and heritage' },
    { id: 5, url: '/images/slide5.png', alt: 'Islamic history and heritage' },
    { id: 6, url: '/images/slide6.png', alt: 'Islamic history and heritage' },
    { id: 7, url: '/images/slide7.jpg', alt: 'Islamic history and heritage' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Fetch real data ───
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        const [coursesRes, videosRes, articlesRes, sheikhsRes] = await Promise.all([
          api.get<ApiCourse[]>('/api/v1/courses/'),
          api.get<ApiLibraryResource[]>('/api/v1/library/resources/?type=video'),
          api.get<ApiLibraryResource[]>('/api/v1/library/resources/?type=article'),
          api.get<ApiSheikh[]>('/api/v1/events/sheikhs/'),
        ]);
        setCourses(coursesRes.data);
        setVideos(videosRes.data.slice(0, 8));
        setArticles(articlesRes.data.slice(0, 3));
        setSheikhs(sheikhsRes.data.filter((s) => s.is_active).slice(0, 4));
      } catch {
        setLoadError('Some content failed to load. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ─── Auto-advance the video carousel ───
  useEffect(() => {
    if (videos.length < 2) return;
    const interval = setInterval(() => {
      setActiveVideoIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
    }, 8000);
    return () => clearInterval(interval);
  }, [videos.length]);

  const categoryTabs = [
    { slug: 'all', label: 'All Courses' },
    ...Array.from(
      new Map(
        courses
          .filter((c) => c.category_slug)
          .map((c) => [c.category_slug, c.category_name])
      ).entries()
    ).map(([slug, label]) => ({ slug, label })),
  ];

  const filteredCourses =
    activeTab === 'all' ? courses : courses.filter((c) => c.category_slug === activeTab);

  const activeVideo = videos[activeVideoIndex];

  // ─── Static content (no backend model for these yet) ───
  const testimonials = [
    {
      id: 1,
      content:
        "The Arabic course completely changed my relationship with the Quran. I can now understand what I'm reading for the first time in my life.",
      author: 'Kabuya Fatwiinah',
      role: 'Arabic Student',
    },
    {
      id: 2,
      content:
        'The instructors are knowledgeable and passionate. They make complex topics easy to understand and apply in daily life.',
      author: 'Nabunya Taus',
      role: 'Tajweed Student',
    },
    {
      id: 3,
      content:
        "The community aspect is amazing. I've connected with brothers and sisters from around the world who are also seeking knowledge.",
      author: 'Kimbowa Yasin',
      role: 'Fiqh Student',
    },
  ];

  const features = [
    { icon: 'fa-graduation-cap', title: 'Qualified Instructors', desc: 'Learn from certified scholars with years of teaching experience' },
    { icon: 'fa-book-open', title: 'Comprehensive Curriculum', desc: 'Structured courses from beginner to advanced levels' },
    { icon: 'fa-users', title: 'Community Learning', desc: 'Join a global community of students and seekers of knowledge' },
    { icon: 'fa-laptop', title: 'Flexible Access', desc: 'Learn at your own pace from anywhere in the world' },
  ];

  return (
    <div className={styles.homeLanding}>

      {/* ─── HERO SECTION WITH BACKGROUND SLIDESHOW ─── */}
      <section className={styles.hero}>
        <div className={styles.heroSlideshow}>
          {heroImages.map((img, index) => (
            <div
              key={img.id}
              className={`${styles.heroSlide} ${index === currentImageIndex ? styles.active : ''}`}
              style={{ backgroundImage: `url(${img.url})` }}
              role="img"
              aria-label={img.alt}
            />
          ))}
          <div className={styles.heroSlideshowOverlay}></div>
          <div className={styles.slideIndicators}>
            {heroImages.map((_, index) => (
              <button
                key={index}
                className={`${styles.slideDot} ${index === currentImageIndex ? styles.active : ''}`}
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className={styles.heroOverlay}></div>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1>
                Deepen Your <br />
                <span className={styles.highlight}>Understanding</span> of Islam
              </h1>
              <p>
                Join thousands of students learning Quranic Arabic, Tafsir,
                and Islamic Studies with world-class instructors.
              </p>
              <div className={styles.heroButtons}>
                <Link to="/courses" className={styles.btnPrimary}>
                  <i className="fas fa-play"></i> Start Learning
                </Link>
                <Link to="/courses" className={styles.btnOutlineWhite}>
                  Explore Courses <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
              <div className={styles.heroStats}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{courses.length || '—'}</span>
                  <span className={styles.statLabel}>Courses</span>
                </div>
                <div className={styles.statDivider}></div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{sheikhs.length || '—'}</span>
                  <span className={styles.statLabel}>Instructors</span>
                </div>
                <div className={styles.statDivider}></div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>4.9★</span>
                  <span className={styles.statLabel}>Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.heroWave}>
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 40L60 50C120 60 240 80 360 75C480 70 600 40 720 35C840 30 960 50 1080 60C1200 70 1320 60 1380 55L1440 50V120H0V40Z" fill="#f8f9fa"/>
          </svg>
        </div>
      </section>

      {loadError && (
        <div className={`${styles.stateBlock} ${styles.stateBlockError}`}>
          <i className="fas fa-exclamation-circle"></i>
          {loadError}
        </div>
      )}

      {/* ─── FEATURES SECTION ─── */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Why Choose Us</span>
            <h2>Experience Transformative <br />Islamic Education</h2>
            <p>Connect to the authentic tradition with world-class instruction and community</p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((f, idx) => (
              <div key={idx} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <i className={`fas ${f.icon}`}></i>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <div className={styles.featureGlow}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COURSES SECTION ─── */}
      <section className={styles.coursesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Our Courses</span>
            <h2>Featured <span className={styles.accent}>Courses</span></h2>
            <p>Explore our most popular courses in Quranic studies and Islamic sciences</p>
          </div>

          {isLoading && (
            <div className={styles.stateBlock}>
              <i className="fas fa-spinner fa-spin"></i>
              Loading courses...
            </div>
          )}

          {!isLoading && courses.length > 0 && (
            <>
              <div className={styles.coursesTabs}>
                {categoryTabs.map((tab) => (
                  <button
                    key={tab.slug}
                    className={`${styles.tabBtn} ${activeTab === tab.slug ? styles.active : ''}`}
                    onClick={() => setActiveTab(tab.slug)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className={styles.coursesGrid}>
                {filteredCourses.slice(0, 4).map((course) => (
                  <div key={course.id} className={styles.courseCard}>
                    <div className={styles.courseImage}>
                      {course.cover_image ? (
                        <img src={course.cover_image} alt={course.title} loading="lazy" />
                      ) : (
                        <div className={styles.articleImage}>
                          <i className={`fas fa-${course.icon || 'book-quran'}`}></i>
                        </div>
                      )}
                      {course.tag && <div className={styles.courseBadge}>{course.tag}</div>}
                      <div className={styles.courseOverlay}>
                        <Link to={`/courses/${course.id}`} className={styles.btnPreview}>
                          <i className="fas fa-eye"></i> Preview
                        </Link>
                      </div>
                    </div>
                    <div className={styles.courseContent}>
                      <h3>{course.title}</h3>
                      <p>{course.description}</p>
                      <div className={styles.courseMeta}>
                        <span><i className="fas fa-clock"></i> {course.duration || 'Self-paced'}</span>
                        <span><i className="fas fa-user-graduate"></i> {course.instructor_name}</span>
                      </div>
                      <div className={styles.courseFooter}>
                        <div className={styles.coursePrice}>{course.rating ? `${course.rating} ★` : 'New'}</div>
                        <Link to={`/courses/${course.id}`} className={styles.btnEnroll}>
                          Enroll Now <i className="fas fa-arrow-right"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!isLoading && courses.length === 0 && !loadError && (
            <div className={styles.stateBlock}>
              <i className="fas fa-book-quran"></i>
              Courses are coming soon — check back shortly.
            </div>
          )}

          <div className={styles.sectionCta}>
            <Link to="/courses" className={styles.btnPrimary}>
              View All Courses <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── WATCH & LEARN (video carousel from the Library) ─── */}
      <section className={styles.videosSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Watch & Learn</span>
            <h2>Featured <span className={styles.accent}>Videos</span></h2>
            <div className={styles.headerDecoration}>
              <span>ﷺ</span>
            </div>
            <p>The latest videos from our Library, picked fresh from every category</p>
          </div>

          {isLoading && (
            <div className={styles.stateBlock}>
              <i className="fas fa-spinner fa-spin"></i>
              Loading videos...
            </div>
          )}

          {!isLoading && videos.length > 0 && activeVideo && (
            <div className={styles.videoCarousel}>
              <div className={styles.videoStage}>
                <div className={styles.videoStageFrame}>
                  {activeVideo.is_locked || !activeVideo.url ? (
                    <div className={styles.videoLockedOverlay}>
                      <i className="fas fa-lock"></i>
                      <h3>Subscribe to Watch</h3>
                      <p>This video is part of our subscriber library. Unlock it and everything else.</p>
                      <Link to="/subscribe" className={styles.btnPrimary}>
                        Subscribe Now
                      </Link>
                    </div>
                  ) : (
                    <iframe
                      src={activeVideo.url}
                      title={activeVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  )}
                </div>
                <div className={styles.videoStageMeta}>
                  <h3>{activeVideo.title}</h3>
                  <p>{activeVideo.description}</p>
                </div>
              </div>

              <div className={styles.videoPlaylist}>
                {videos.map((video, index) => (
                  <button
                    key={video.id}
                    className={`${styles.videoPlaylistItem} ${index === activeVideoIndex ? styles.active : ''} ${video.is_locked ? styles.locked : ''}`}
                    onClick={() => setActiveVideoIndex(index)}
                  >
                    <div className={styles.videoPlaylistIcon}>
                      <i className={video.is_locked ? 'fas fa-lock' : 'fas fa-play'}></i>
                    </div>
                    <div className={styles.videoPlaylistText}>
                      <h4>{video.title}</h4>
                      <span>{video.category}{video.subcategory ? ` · ${video.subcategory}` : ''}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isLoading && videos.length === 0 && !loadError && (
            <div className={styles.stateBlock}>
              <i className="fas fa-circle-play"></i>
              No videos published yet — check back soon.
            </div>
          )}

          <div className={styles.sectionCta}>
            <Link to="/library" className={styles.btnPrimary}>
              Browse Full Library <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── LATEST ARTICLES ─── */}
      <section className={styles.articlesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>From the Library</span>
            <h2>Latest <span className={styles.accent}>Articles</span></h2>
            <p>Reflections and write-ups from our scholars and community</p>
          </div>

          {isLoading && (
            <div className={styles.stateBlock}>
              <i className="fas fa-spinner fa-spin"></i>
              Loading articles...
            </div>
          )}

          {!isLoading && articles.length > 0 && (
            <div className={styles.articlesGrid}>
              {articles.map((article) => (
                <a
                  key={article.id}
                  href={article.is_locked || !article.url ? '/subscribe' : article.url}
                  target={article.is_locked || !article.url ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className={styles.articleCard}
                >
                  <div className={styles.articleImage}>
                    <span className={styles.articleCategory}>{article.category}</span>
                    <i className={article.is_locked ? 'fas fa-lock' : 'fas fa-file-lines'}></i>
                  </div>
                  <div className={styles.articleContent}>
                    <div className={styles.articleMeta}>
                      <span>{article.author_name}</span>
                      <span>·</span>
                      <span>{new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3>{article.title}</h3>
                    <p>{article.description}</p>
                    <span className={styles.articleReadMore}>
                      {article.is_locked ? 'Subscribe to read' : 'Read Article'} <i className="fas fa-arrow-right"></i>
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}

          {!isLoading && articles.length === 0 && !loadError && (
            <div className={styles.stateBlock}>
              <i className="fas fa-file-lines"></i>
              No articles published yet — check back soon.
            </div>
          )}

          <div className={styles.sectionCta}>
            <Link to="/library" className={styles.btnPrimary}>
              Read All Articles <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── INSTRUCTORS SECTION ─── */}
      <section className={styles.instructorsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Meet Our Team</span>
            <h2>World-Class <span className={styles.accent}>Instructors</span></h2>
            <p>Learn from passionate scholars and educators dedicated to your growth</p>
          </div>

          {!isLoading && sheikhs.length > 0 && (
            <div className={styles.instructorsGrid}>
              {sheikhs.map((sheikh) => (
                <div key={sheikh.id} className={styles.instructorCard}>
                  <div className={styles.instructorAvatar}>
                    <div className={styles.articleImage} style={{ height: '100%', borderRadius: '50%' }}>
                      <i className={`fas fa-${sheikh.avatar_icon || 'user'}`}></i>
                    </div>
                    <div className={styles.instructorStatus}></div>
                  </div>
                  <h4>{sheikh.name}</h4>
                  <p>{sheikh.title}</p>
                </div>
              ))}
            </div>
          )}

          {!isLoading && sheikhs.length === 0 && !loadError && (
            <div className={styles.stateBlock}>
              <i className="fas fa-users"></i>
              Instructor profiles coming soon.
            </div>
          )}
        </div>
      </section>

      {/* ─── TESTIMONIALS SECTION ─── */}
      <section className={styles.testimonialsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Testimonials</span>
            <h2>What Our <span className={styles.accent}>Students</span> Say</h2>
            <p>Real stories from students who transformed their relationship with Islam</p>
          </div>
          <div className={styles.testimonialsGrid}>
            {testimonials.map((t) => (
              <div key={t.id} className={styles.testimonialCard}>
                <div className={styles.testimonialQuote}>
                  <i className="fas fa-quote-left"></i>
                </div>
                <div className={styles.testimonialContent}>
                  <p>"{t.content}"</p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>
                    <div className={styles.articleImage} style={{ height: '100%', borderRadius: '50%', fontSize: '1.2rem' }}>
                      {t.author.charAt(0)}
                    </div>
                  </div>
                  <div className={styles.authorDetails}>
                    <h4>{t.author}</h4>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Start Your Learning Journey <br />Today</h2>
            <p>Join thousands of students worldwide who are deepening their understanding of Islam</p>
            <Link to="/register" className={styles.btnPrimary}>
              Get Started for Free <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <div className={styles.logo}>
                <div className={styles.logoIcon}>
                  <i className="fas fa-book-quran"></i>
                </div>
                <div className={styles.logoText}>
                  <h3>Hikmah Online School</h3>
                  <span>Premier Islamic Education</span>
                </div>
              </div>
              <p>
                Providing authentic Islamic knowledge worldwide through comprehensive
                courses and qualified instructors.
              </p>
              <div className={styles.footerSocial}>
                <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
              </div>
            </div>

            <div className={styles.footerSection}>
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/courses">Courses</Link></li>
                <li><Link to="/library">Library</Link></li>
                <li><Link to="/events">Events</Link></li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h4>Account</h4>
              <ul>
                <li><Link to="/my/learning">My Learning</Link></li>
                <li><Link to="/subscribe">Subscribe</Link></li>
                <li><Link to="/login">Sign In</Link></li>
                <li><Link to="/register">Register</Link></li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h4>Contact</h4>
              <ul className={styles.footerContact}>
                <li><i className="fas fa-map-marker-alt"></i> 9/A Ring Road, Garden Street</li>
                <li><i className="fas fa-envelope"></i> info@hikmahonline.com</li>
                <li><i className="fas fa-phone"></i> +123 4567 890</li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>&copy; {new Date().getFullYear()} Hikmah Online School. All rights reserved.</p>
            <div className={styles.footerLinks}>
              <a href="#">Privacy Policy</a>
              <span className={styles.footerDivider}>|</span>
              <a href="#">Terms &amp; Conditions</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
