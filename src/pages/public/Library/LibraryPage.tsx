import React, { useState, useRef, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './LibraryPage.css';

// --- Types ---
type Category =
  | 'Quran'
  | 'Arabic'
  | 'Tafseer'
  | 'History'
  | 'Seerah'
  | 'Aqeedah'
  | 'Fiqh'
  | 'Spirituality'
  | 'Family';

type SurahName = string;

const ALL_SURAHS: { number: number; name: string }[] = [
  { number: 1, name: 'Al-Fatihah' }, { number: 2, name: 'Al-Baqarah' }, { number: 3, name: "Aal-E-Imran" },
  { number: 4, name: 'An-Nisa' }, { number: 5, name: "Al-Ma'idah" }, { number: 6, name: "Al-An'am" },
  { number: 7, name: "Al-A'raf" }, { number: 8, name: 'Al-Anfal' }, { number: 9, name: 'At-Tawbah' },
  { number: 10, name: 'Yunus' }, { number: 11, name: 'Hud' }, { number: 12, name: 'Yusuf' },
  { number: 13, name: "Ar-Ra'd" }, { number: 14, name: 'Ibrahim' }, { number: 15, name: 'Al-Hijr' },
  { number: 16, name: 'An-Nahl' }, { number: 17, name: 'Al-Isra' }, { number: 18, name: 'Al-Kahf' },
  { number: 19, name: 'Maryam' }, { number: 20, name: 'Ta-Ha' }, { number: 21, name: 'Al-Anbiya' },
  { number: 22, name: 'Al-Hajj' }, { number: 23, name: "Al-Mu'minun" }, { number: 24, name: 'An-Nur' },
  { number: 25, name: 'Al-Furqan' }, { number: 26, name: "Ash-Shu'ara" }, { number: 27, name: 'An-Naml' },
  { number: 28, name: 'Al-Qasas' }, { number: 29, name: 'Al-Ankabut' }, { number: 30, name: 'Ar-Rum' },
  { number: 31, name: 'Luqman' }, { number: 32, name: 'As-Sajdah' }, { number: 33, name: 'Al-Ahzab' },
  { number: 34, name: 'Saba' }, { number: 35, name: 'Fatir' }, { number: 36, name: 'Ya-Sin' },
  { number: 37, name: 'As-Saffat' }, { number: 38, name: 'Sad' }, { number: 39, name: 'Az-Zumar' },
  { number: 40, name: 'Ghafir' }, { number: 41, name: 'Fussilat' }, { number: 42, name: 'Ash-Shuraa' },
  { number: 43, name: 'Az-Zukhruf' }, { number: 44, name: 'Ad-Dukhan' }, { number: 45, name: 'Al-Jathiyah' },
  { number: 46, name: 'Al-Ahqaf' }, { number: 47, name: 'Muhammad' }, { number: 48, name: 'Al-Fath' },
  { number: 49, name: 'Al-Hujurat' }, { number: 50, name: 'Qaf' }, { number: 51, name: 'Adh-Dhariyat' },
  { number: 52, name: 'At-Tur' }, { number: 53, name: 'An-Najm' }, { number: 54, name: 'Al-Qamar' },
  { number: 55, name: 'Ar-Rahman' }, { number: 56, name: "Al-Waqi'ah" }, { number: 57, name: 'Al-Hadid' },
  { number: 58, name: 'Al-Mujadila' }, { number: 59, name: 'Al-Hashr' }, { number: 60, name: 'Al-Mumtahanah' },
  { number: 61, name: 'As-Saff' }, { number: 62, name: "Al-Jumu'ah" }, { number: 63, name: 'Al-Munafiqun' },
  { number: 64, name: 'At-Taghabun' }, { number: 65, name: 'At-Talaq' }, { number: 66, name: 'At-Tahrim' },
  { number: 67, name: 'Al-Mulk' }, { number: 68, name: 'Al-Qalam' }, { number: 69, name: 'Al-Haqqah' },
  { number: 70, name: "Al-Ma'arij" }, { number: 71, name: 'Nuh' }, { number: 72, name: 'Al-Jinn' },
  { number: 73, name: 'Al-Muzzammil' }, { number: 74, name: 'Al-Muddaththir' }, { number: 75, name: 'Al-Qiyamah' },
  { number: 76, name: 'Al-Insan' }, { number: 77, name: 'Al-Mursalat' }, { number: 78, name: 'An-Naba' },
  { number: 79, name: "An-Nazi'at" }, { number: 80, name: 'Abasa' }, { number: 81, name: 'At-Takwir' },
  { number: 82, name: 'Al-Infitar' }, { number: 83, name: 'Al-Mutaffifin' }, { number: 84, name: 'Al-Inshiqaq' },
  { number: 85, name: 'Al-Buruj' }, { number: 86, name: 'At-Tariq' }, { number: 87, name: "Al-A'la" },
  { number: 88, name: 'Al-Ghashiyah' }, { number: 89, name: 'Al-Fajr' }, { number: 90, name: 'Al-Balad' },
  { number: 91, name: 'Ash-Shams' }, { number: 92, name: 'Al-Layl' }, { number: 93, name: 'Ad-Duhaa' },
  { number: 94, name: 'Ash-Sharh' }, { number: 95, name: 'At-Tin' }, { number: 96, name: 'Al-Alaq' },
  { number: 97, name: 'Al-Qadr' }, { number: 98, name: 'Al-Bayyinah' }, { number: 99, name: 'Az-Zalzalah' },
  { number: 100, name: 'Al-Adiyat' }, { number: 101, name: "Al-Qari'ah" }, { number: 102, name: 'At-Takathur' },
  { number: 103, name: 'Al-Asr' }, { number: 104, name: 'Al-Humazah' }, { number: 105, name: 'Al-Fil' },
  { number: 106, name: 'Quraysh' }, { number: 107, name: "Al-Ma'un" }, { number: 108, name: 'Al-Kawthar' },
  { number: 109, name: 'Al-Kafirun' }, { number: 110, name: 'An-Nasr' }, { number: 111, name: 'Al-Masad' },
  { number: 112, name: 'Al-Ikhlas' }, { number: 113, name: 'Al-Falaq' }, { number: 114, name: 'An-Nas' },
];

type ResourceType = 'video' | 'pdf' | 'audio' | 'article' | 'book' | 'presentation' | string;

interface ResourceMetaVideo {
  duration?: string;
  views?: string;
  listens?: string;
}
interface ResourceMetaDoc {
  pages?: string;
  downloads?: string;
}
type ResourceMeta = ResourceMetaVideo & ResourceMetaDoc;

interface Resource {
  id: number;
  category: Category | string;
  subcategory: string;
  title: string;
  description: string;
  author: string;
  authorInitials?: string;
  type: ResourceType;
  meta: ResourceMeta;
  icon: string;
  url: string | null;
  isLocked: boolean;
}

type Subcategories = Record<string, string[]>;

// --- Component ---
const LibraryPage: React.FC = () => {
  const navigate = useNavigate();

  // State - typed
  const [activeFilter, setActiveFilter] = useState<ResourceType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Quran');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [selectedSurah, setSelectedSurah] = useState<SurahName>('Al-Fatihah');
  const [surahSearch, setSurahSearch] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // File upload/form state
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [formData, setFormData] = useState({
    resourceTitle: '',
    resourceAuthor: '',
    resourceType: '',
    resourceCategory: '',
    resourceDescription: '',
    contactEmail: '',
    contactPhone: '',
    additionalNotes: ''
  });

  // file input ref (typed)
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Categories / subcategories / surahs
  const categories: Category[] = [
    'Quran',
    'Arabic',
    'Tafseer',
    'History',
    'Seerah',
    'Aqeedah',
    'Fiqh',
    'Spirituality',
    'Family'
  ];

  const subcategories: Subcategories = {
    Arabic: ['All', 'Topics', 'Deep Dives', 'Special Editions'],
    Tafseer: ['All', 'Topics', 'Deep Dives', 'Special Editions'],
    History: ['All', 'Topics', 'Deep Dives', 'Special Editions'],
    Seerah: ['All', 'Topics', 'Deep Dives', 'Special Editions'],
    Aqeedah: ['All', 'Topics', 'Deep Dives', 'Special Editions'],
    Fiqh: ['All', 'Topics', 'Deep Dives', 'Special Editions'],
    Spirituality: ['All', 'Topics', 'Deep Dives', 'Special Editions'],
    Family: ['All', 'Topics', 'Deep Dives', 'Special Editions']
  };

  // Arabic quotes
  const arabicQuotes = [
    'قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ',
    'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ',
    'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ'
  ];
  const [arabicQuoteIndex] = useState<number>(0);

  // Resources fetched from the backend library API
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Canonical category/type choices for the "Contribute" form — fetched from the backend
  // so the values sent on submit always match what the API accepts (no hardcoded duplicate list).
  const [metaCategories, setMetaCategories] = useState<{ value: string; label: string }[]>([]);
  const [metaResourceTypes, setMetaResourceTypes] = useState<{ value: string; label: string }[]>([]);

  // Raw shape returned by the Django API (snake_case)
  type ApiResource = {
    id: number;
    category: string;
    subcategory: string;
    title: string;
    description: string;
    author_name: string;
    author_initials?: string;
    resource_type: string;
    icon: string;
    url: string | null;
    meta: ResourceMeta;
    is_locked: boolean;
  };

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        setError('');
        const res = await api.get<ApiResource[]>('/api/v1/library/resources/');
        const mapped: Resource[] = res.data.map((r) => ({
          id: r.id,
          category: r.category,
          subcategory: r.subcategory,
          title: r.title,
          description: r.description,
          author: r.author_name,
          authorInitials: r.author_initials,
          type: r.resource_type,
          meta: r.meta,
          icon: r.icon,
          url: r.url,
          isLocked: r.is_locked,
        }));
        setResources(mapped);
      } catch {
        setError('Failed to load library resources. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, []);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await api.get<{ categories: { value: string; label: string }[]; resource_types: { value: string; label: string }[] }>('/api/v1/library/meta/');
        setMetaCategories(res.data.categories);
        setMetaResourceTypes(res.data.resource_types);
      } catch {
        // If this fails, the Contribute form selects just render empty — resource browsing above is unaffected
      }
    };
    fetchMeta();
  }, []);

  // Renders the action buttons for a resource card — swaps to a
  // "Subscribe to unlock" prompt when the resource is locked instead of
  // linking to a (blanked-out) url.
  const renderResourceActions = (res: Resource) => {
    if (res.isLocked) {
      return (
        <div className="resource-actions">
          <button className="action-btn locked-action" onClick={() => navigate('/subscribe')}>
            <i className="fas fa-lock" /> Subscribe to unlock
          </button>
        </div>
      );
    }

    return (
      <div className="resource-actions">
        <a href={res.url ?? '#'} target="_blank" rel="noopener noreferrer" className="action-btn">
          <i className={
            res.type === 'video' ? 'fas fa-play' :
            res.type === 'audio' ? 'fas fa-play' :
            res.type === 'pdf' ? 'fas fa-eye' : 'fas fa-book-open'
          } />
          {res.type === 'video' ? 'Watch' : res.type === 'audio' ? 'Listen' : res.type === 'pdf' ? 'Preview' : 'Read'}
        </a>

        <a href={res.type === 'pdf' ? (res.url ?? '#') : '#'} download={res.type === 'pdf'} className="action-btn">
          <i className="fas fa-download" /> Download
        </a>
      </div>
    );
  };

  // Filtering logic
  const filteredResources = resources.filter((res) => {
    const matchesCategory =
      selectedCategory === 'Quran'
        ? res.category === 'Quran' && res.subcategory === selectedSurah
        : res.category === selectedCategory && (selectedSubcategory === 'All' || res.subcategory === selectedSubcategory);

    const matchesType = activeFilter === 'all' || res.type === activeFilter;
    const matchesSearch =
      searchQuery === '' ||
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.author.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesType && matchesSearch;
  });

  // Group the currently filtered resources by type, in a sensible display order,
  // so the page reads as organized shelves (Videos, Audio, Articles, PDFs, Books)
  // rather than one mixed grid.
  const TYPE_ORDER: { type: ResourceType; label: string; icon: string }[] = [
    { type: 'video', label: 'Videos', icon: 'fa-circle-play' },
    { type: 'audio', label: 'Audio', icon: 'fa-headphones' },
    { type: 'article', label: 'Articles', icon: 'fa-file-lines' },
    { type: 'pdf', label: 'PDFs & Notes', icon: 'fa-file-pdf' },
    { type: 'book', label: 'Books', icon: 'fa-book' },
    { type: 'presentation', label: 'Presentations', icon: 'fa-display' },
  ];

  const groupedResources = TYPE_ORDER.map((group) => ({
    ...group,
    items: filteredResources.filter((r) => r.type === group.type),
  })).filter((group) => group.items.length > 0);

  const filteredSurahs = ALL_SURAHS.filter(
    (s) => surahSearch.trim() === '' ||
      s.name.toLowerCase().includes(surahSearch.trim().toLowerCase()) ||
      String(s.number).includes(surahSearch.trim())
  );

  // Surahs that currently have at least one resource, so the sidebar can flag them
  const surahsWithContent = new Set(
    resources.filter((r) => r.category === 'Quran').map((r) => r.subcategory)
  );

  // --- Handlers (typed) ---
  const handleFilterClick = (filter: ResourceType | 'all') => {
    setActiveFilter(filter);
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSubcategory('All');
    if (category === 'Quran') {
      setSelectedSurah('Al-Fatihah');
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileUploaded(true);
      setFileName(e.target.files[0].name);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append('resource_title', formData.resourceTitle);
    payload.append('resource_author', formData.resourceAuthor);
    payload.append('resource_type', formData.resourceType);
    payload.append('resource_category', formData.resourceCategory);
    payload.append('resource_description', formData.resourceDescription);
    payload.append('contact_email', formData.contactEmail);
    if (formData.contactPhone) payload.append('contact_phone', formData.contactPhone);
    if (formData.additionalNotes) payload.append('additional_notes', formData.additionalNotes);
    if (fileInputRef.current?.files?.[0]) {
      payload.append('file', fileInputRef.current.files[0]);
    }

    try {
      await api.post('/api/v1/library/submissions/', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Your resource has been submitted for review! Our scholars will evaluate it and you will be notified once it is approved.');
    } catch {
      alert('Something went wrong submitting your resource. Please try again.');
      return;
    }

    // Reset form
    setFormData({
      resourceTitle: '',
      resourceAuthor: '',
      resourceType: '',
      resourceCategory: '',
      resourceDescription: '',
      contactEmail: '',
      contactPhone: '',
      additionalNotes: ''
    });

    // Reset file upload
    setFileUploaded(false);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getResourceTypeClass = (type: ResourceType) => {
    switch (type) {
      case 'video':
        return 'video';
      case 'pdf':
        return 'pdf';
      case 'audio':
        return 'audio';
      case 'article':
        return 'article';
      default:
        return '';
    }
  };

  // --- JSX ---
  return (
    <div className="library-page">
      {/* Hero Section */}
      <section className="library-hero">
        <h1>Hikmah Islamic Knowledge Repository</h1>
        <p>Access a vast collection of authentic Islamic resources including articles, lectures, books, and multimedia content.</p>
        <div className="arabic-hero">{arabicQuotes[arabicQuoteIndex]}</div>
        <p>"Say: Are those who know equal to those who do not know?" - Quran 39:9</p>
      </section>

      {/* Category Tabs */}
      <div className="library-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`library-tab ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Library Container */}
      <section className="library-container">
        {/* Search & Filters */}
        <div className="search-section">
          <h2>Search Our Library</h2>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for resources, topics, authors..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button className="search-btn"><i className="fas fa-search" /></button>
          </div>

          <div className="filter-options">
            <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => handleFilterClick('all')}>All Resources</button>
            <button className={`filter-btn ${activeFilter === 'video' ? 'active' : ''}`} onClick={() => handleFilterClick('video')}>Videos</button>
            <button className={`filter-btn ${activeFilter === 'pdf' ? 'active' : ''}`} onClick={() => handleFilterClick('pdf')}>PDFs</button>
            <button className={`filter-btn ${activeFilter === 'audio' ? 'active' : ''}`} onClick={() => handleFilterClick('audio')}>Audios</button>
            <button className={`filter-btn ${activeFilter === 'article' ? 'active' : ''}`} onClick={() => handleFilterClick('article')}>Articles</button>
          </div>
        </div>

        {/* Loading / Error states */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#027173' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }} />
            <p style={{ marginTop: '1rem' }}>Loading library resources...</p>
          </div>
        )}

        {!isLoading && error && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
            <i className="fas fa-exclamation-circle" style={{ fontSize: '2rem' }} />
            <p style={{ marginTop: '1rem' }}>{error}</p>
          </div>
        )}

        {/* Subcategory/Surah selection */}
        {!isLoading && !error && (
        selectedCategory === 'Quran' ? (
          <div className="quran-layout">
            <aside className="surah-list">
              <h3>Browse by Surah</h3>
              <div className="surah-search">
                <i className="fas fa-search" />
                <input
                  type="text"
                  placeholder="Search surah name or number..."
                  value={surahSearch}
                  onChange={(e) => setSurahSearch(e.target.value)}
                />
              </div>
              <div className="surah-scroll">
                {filteredSurahs.map((surah) => (
                  <button
                    key={surah.number}
                    className={`surah-item ${selectedSurah === surah.name ? 'active' : ''} ${surahsWithContent.has(surah.name) ? 'has-content' : ''}`}
                    onClick={() => setSelectedSurah(surah.name)}
                  >
                    <span className="surah-number">{surah.number}</span>
                    <span className="surah-name">{surah.name}</span>
                    {surahsWithContent.has(surah.name) && <span className="surah-dot" title="Has resources" />}
                  </button>
                ))}
                {filteredSurahs.length === 0 && <p className="no-resources">No surah matches your search.</p>}
              </div>
            </aside>

            <section className="resource-display">
              <div className="resource-display-header">
                <h3>{selectedSurah}</h3>
                <span className="resource-count">{filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}</span>
              </div>

              {groupedResources.map((group) => (
                <div className="resource-shelf" key={group.type}>
                  <h4 className="shelf-title"><i className={`fas ${group.icon}`} /> {group.label}</h4>
                  <div className="resource-grid">
                    {group.items.map((res) => (
                      <div key={res.id} className="resource-card">
                        <div className={`resource-header ${getResourceTypeClass(res.type)}`}>
                          <div className="resource-icon"><i className={`fas fa-${res.icon}`} /></div>
                          <div className="resource-category">
                            {res.type.charAt(0).toUpperCase() + res.type.slice(1)}
                            {res.isLocked && <i className="fas fa-lock lock-badge" title="Subscribe to unlock" />}
                          </div>
                        </div>

                        <div className="resource-body">
                          <h3>{res.title}</h3>
                          <div className="resource-author">
                            <div className="author-avatar">{res.authorInitials}</div>
                            <span>{res.author}</span>
                          </div>

                          <p className="resource-description">{res.description}</p>

                          <div className="resource-meta">
                            {(res.type === 'video' || res.type === 'audio') ? (
                              <>
                                <span><i className="fas fa-clock" /> {res.meta.duration}</span>
                                <span>
                                  <i className={res.type === 'video' ? 'fas fa-eye' : 'fas fa-headphones'} />{res.type === 'video' ? ` ${res.meta.views}` : ` ${res.meta.listens}`}
                                </span>
                              </>
                            ) : (
                              <>
                                <span><i className="fas fa-file" /> {res.meta.pages}</span>
                                <span><i className="fas fa-download" /> {res.meta.downloads}</span>
                              </>
                            )}
                          </div>

                          {renderResourceActions(res)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {groupedResources.length === 0 && <p className="no-resources">No resources for {selectedSurah} yet — check back soon, or explore another surah.</p>}
            </section>
          </div>
        ) : (
          <div>
            <div className="subcategory-tabs">
              <h3>Filter by Type</h3>
              {(subcategories[selectedCategory] || []).map((sub: string) => (
                <button
                  key={sub}
                  className={`subcategory-tab ${selectedSubcategory === sub ? 'active' : ''}`}
                  onClick={() => setSelectedSubcategory(sub)}
                >
                  {sub}
                </button>
              ))}
            </div>

            {groupedResources.map((group) => (
              <div className="resource-shelf" key={group.type}>
                <h4 className="shelf-title"><i className={`fas ${group.icon}`} /> {group.label}</h4>
                <div className="resource-grid">
                  {group.items.map((res) => (
                    <div key={res.id} className="resource-card">
                      <div className={`resource-header ${getResourceTypeClass(res.type)}`}>
                        <div className="resource-icon"><i className={`fas fa-${res.icon}`} /></div>
                        <div className="resource-category">
                          {res.type.charAt(0).toUpperCase() + res.type.slice(1)}
                          {res.isLocked && <i className="fas fa-lock lock-badge" title="Subscribe to unlock" />}
                        </div>
                      </div>

                      <div className="resource-body">
                        <h3>{res.title}</h3>
                        <div className="resource-author">
                          <div className="author-avatar">{res.authorInitials}</div>
                          <span>{res.author}</span>
                        </div>

                        <p className="resource-description">{res.description}</p>

                        <div className="resource-meta">
                          {(res.type === 'video' || res.type === 'audio') ? (
                            <>
                              <span><i className="fas fa-clock" /> {res.meta.duration}</span>
                              <span>
                                <i className={res.type === 'video' ? 'fas fa-eye' : 'fas fa-headphones'} />{res.type === 'video' ? ` ${res.meta.views}` : ` ${res.meta.listens}`}
                              </span>
                            </>
                          ) : (
                            <>
                              <span><i className="fas fa-file" /> {res.meta.pages}</span>
                              <span><i className="fas fa-download" /> {res.meta.downloads}</span>
                            </>
                          )}
                        </div>

                        {renderResourceActions(res)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {groupedResources.length === 0 && <p className="no-resources">No resources found.</p>}
          </div>
        )
        )}

        {/* Submission Section */}
        <div className="submission-section">
          <div className="section-header">
            <h2>Contribute to Our Library</h2>
            <p>Share your knowledge with the community by submitting resources for review. All submissions will be evaluated by our scholars before being added to the library.</p>
          </div>

          <form className="submission-form" onSubmit={handleSubmit}>
            <div className="form-group full-width">
              <h3 className="form-section-title">Resource Information</h3>
            </div>

            <div className="form-group">
              <label htmlFor="resourceTitle">Resource Title <span>*</span></label>
              <input
                type="text"
                id="resourceTitle"
                name="resourceTitle"
                className="form-control"
                placeholder="Enter resource title"
                value={formData.resourceTitle}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="resourceAuthor">Your Name <span>*</span></label>
              <input
                type="text"
                id="resourceAuthor"
                name="resourceAuthor"
                className="form-control"
                placeholder="Enter your name"
                value={formData.resourceAuthor}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="resourceType">Resource Type <span>*</span></label>
              <select
                id="resourceType"
                name="resourceType"
                className="form-control"
                value={formData.resourceType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select resource type...</option>
                {metaResourceTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="resourceCategory">Category <span>*</span></label>
              <select
                id="resourceCategory"
                name="resourceCategory"
                className="form-control"
                value={formData.resourceCategory}
                onChange={handleInputChange}
                required
              >
                <option value="">Select category...</option>
                {metaCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="resourceDescription">Description <span>*</span></label>
              <textarea
                id="resourceDescription"
                name="resourceDescription"
                className="form-control"
                placeholder="Describe your resource in detail..."
                value={formData.resourceDescription}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="resource-file">Upload Resource <span>*</span></label>
              <div className="file-upload" id="upload-area" onClick={handleFileUploadClick}>
                {fileUploaded ? (
                  <>
                    <i className="fas fa-check-circle" style={{ color: '#27ae60' }} />
                    <h3>{fileName}</h3>
                    <p>Ready for submission</p>
                  </>
                ) : (
                  <>
                    <i className="fas fa-cloud-upload-alt" />
                    <h3>Click to upload or drag and drop</h3>
                    <p>Supported formats: PDF, MP4, MP3, DOCX (Max size: 100MB)</p>
                  </>
                )}
                <input
                  type="file"
                  id="resource-file"
                  className="file-input"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contactEmail">Your Email <span>*</span></label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                className="form-control"
                placeholder="Enter your email"
                value={formData.contactEmail}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactPhone">Phone Number</label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                className="form-control"
                placeholder="Enter your phone number"
                value={formData.contactPhone}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="additionalNotes">Additional Notes</label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                className="form-control"
                placeholder="Any additional information about your submission..."
                value={formData.additionalNotes}
                onChange={handleInputChange}
              />
            </div>

            <button type="submit" className="submit-btn">
              <i className="fas fa-paper-plane" /> Submit for Review
            </button>
          </form>
        </div>
      </section>

      {/* Footer (kept as original) */}
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
              <li><a href="#"><i className="fas fa-arrow-right" /> About Us</a></li>
              <li><a href="#"><i className="fas fa-arrow-right" /> Courses</a></li>
              <li><a href="#"><i className="fas fa-arrow-right" /> Events</a></li>
              <li><a href="#"><i className="fas fa-arrow-right" /> Library</a></li>
              <li><a href="#"><i className="fas fa-arrow-right" /> Contact</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Contact Us</h3>
            <ul>
              <li><a href="#"><i className="fas fa-envelope" /> library@Hikmah.edu</a></li>
              <li><a href="#"><i className="fas fa-phone" /> +1 (234) 567-8902</a></li>
              <li><a href="#"><i className="fas fa-map-marker-alt" /> 123 Knowledge Street, Islamic City</a></li>
            </ul>
          </div>
        </div>

        <div className="copyright">
          <p>&copy; 2023 Hikmah Premier Institute. All rights reserved.</p>
          <p>Designed with <i className="fas fa-heart" /> for the Ummah</p>
        </div>
      </footer>
    </div>
  );
};

export default LibraryPage;
