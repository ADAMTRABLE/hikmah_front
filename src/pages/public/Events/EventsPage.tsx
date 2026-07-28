// src/pages/public/events/EventsPage.tsx
import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import './EventsPage.css';

type EventCategory = 'hikmah' | 'invited';

interface EventItem {
  id: number;
  category: EventCategory;
  event_type: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string;
  status_label: string;
  registration_url: string;
  sheikh: number | null;
  sheikh_name: string;
}

interface SheikhItem {
  id: number;
  name: string;
  title: string;
  bio: string;
  avatar_icon: string;
}

const EventsPage = () => {
  const [activeCategory, setActiveCategory] = useState('hikmah');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [sheikhs, setSheikhs] = useState<SheikhItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    organization: '',
    sheikh: '',
    eventName: '',
    eventLocation: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    serviceType: '',
    theme: '',
    attendees: '',
    expectations: '',
    otherGuests: '',
    additionalInfo: ''
  });
  const [arabicQuoteIndex, setArabicQuoteIndex] = useState(0);
  
  const arabicQuotes = [
    "وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ",
    "يَا أَيُّهَا الَّذِينَ آمَنُوا ارْكَعُوا وَاسْجُدُوا وَاعْبُدُوا رَبَّكُمْ وَافْعَلُوا الْخَيْرَ لَعَلَّكُمْ تُفْلِحُونَ",
    "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ ۖ وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setArabicQuoteIndex(prev => (prev + 1) % arabicQuotes.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch events and sheikhs from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const [eventsRes, sheikhsRes] = await Promise.all([
          api.get<EventItem[]>('/api/v1/events/'),
          api.get<SheikhItem[]>('/api/v1/events/sheikhs/'),
        ]);
        setEvents(eventsRes.data);
        setSheikhs(sheikhsRes.data);
      } catch {
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const hikmahEvents = events.filter(e => e.category === 'hikmah');
  const invitedEvents = events.filter(e => e.category === 'invited');

  const formatEventDay = (dateStr: string) => new Date(dateStr).getDate().toString().padStart(2, '0');
  const formatEventMonth = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const formatTimeRange = (start: string | null, end: string | null) => {
    if (!start || !end) return 'Time TBD';
    const fmt = (t: string) => {
      const [h, m] = t.split(':');
      const hour = parseInt(h, 10);
      const suffix = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      return `${displayHour}:${m} ${suffix}`;
    };
    return `${fmt(start)} - ${fmt(end)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/api/v1/events/bookings/', {
        contact_name: formData.contactName,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        organization: formData.organization,
        sheikh: formData.sheikh ? Number(formData.sheikh) : null,
        event_name: formData.eventName,
        event_location: formData.eventLocation,
        event_date: formData.eventDate,
        start_time: formData.startTime,
        end_time: formData.endTime,
        service_type: formData.serviceType,
        theme: formData.theme,
        attendees: Number(formData.attendees),
        expectations: formData.expectations,
        other_guests: formData.otherGuests,
        additional_info: formData.additionalInfo,
      });
      alert('Your booking request has been submitted successfully!');
    } catch {
      alert('Something went wrong submitting your booking request. Please try again.');
      return;
    }

    // Reset form
    setFormData({
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      organization: '',
      sheikh: '',
      eventName: '',
      eventLocation: '',
      eventDate: '',
      startTime: '',
      endTime: '',
      serviceType: '',
      theme: '',
      attendees: '',
      expectations: '',
      otherGuests: '',
      additionalInfo: ''
    });
  };

  return (
    <div className="events-page">
      {/* Hero Section */}
      <section className="events-hero">
        <h1>Islamic Events & Programs</h1>
        <p>Join our transformative events and programs designed to deepen your understanding of Islam and strengthen your faith.</p>
        <div className="arabic-hero">{arabicQuotes[arabicQuoteIndex]}</div>
        <p>"And remind, for indeed, the reminder benefits the believers." - Quran 51:55</p>
      </section>

      {/* Events Section */}
      <section className="events-container">
        <div className="section-title">
          <h2>Upcoming Events</h2>
        </div>
        
        <div className="events-tabs">
          <button 
            className={`tab-btn ${activeCategory === 'hikmah' ? 'active' : ''}`}
            onClick={() => setActiveCategory('hikmah')}
          >
            Hikmah Events
          </button>
          <button 
            className={`tab-btn ${activeCategory === 'invited' ? 'active' : ''}`}
            onClick={() => setActiveCategory('invited')}
          >
            Sheikh Invitations
          </button>
        </div>
        
        {/* Loading / Error states */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#027173' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }} />
            <p style={{ marginTop: '1rem' }}>Loading events...</p>
          </div>
        )}

        {!isLoading && error && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
            <i className="fas fa-exclamation-circle" style={{ fontSize: '2rem' }} />
            <p style={{ marginTop: '1rem' }}>{error}</p>
          </div>
        )}

        {/* Hikmah Events */}
        {!isLoading && !error && (
        <div className={`events-section ${activeCategory === 'hikmah' ? 'active' : ''}`} id="hikmah">
          <div className="section-subtitle">Events Organized by Hikmah Institute</div>
          
          <div className="events-grid">
            {hikmahEvents.length === 0 && <p className="no-resources">No upcoming Hikmah events yet.</p>}
            {hikmahEvents.map((event) => (
              <div key={event.id} className="event-card Hikmah-card">
                <div className="event-type">{event.event_type}</div>
                <div className="event-header">
                  <div className="event-icon">
                    <i className={`fas fa-${event.icon || 'calendar'}`}></i>
                  </div>
                  <div className="event-header-text">
                    <h3>{event.title}</h3>
                    <p>{event.subtitle}</p>
                  </div>
                </div>
                <div className="event-body">
                  <div className="event-details">
                    <div className="event-date">
                      <div className="day">{formatEventDay(event.event_date)}</div>
                      <div className="month">{formatEventMonth(event.event_date)}</div>
                    </div>
                    <div className="event-info">
                      <p>{event.description}</p>
                      <div className="event-meta">
                        <span><i className="fas fa-clock"></i> {formatTimeRange(event.start_time, event.end_time)}</span>
                        <span><i className="fas fa-map-marker-alt"></i> {event.location}</span>
                      </div>
                      {event.status_label && <span className="event-status">{event.status_label}</span>}
                    </div>
                  </div>
                  <button className="btn"><i className="fas fa-calendar-plus"></i> Register Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
        
        {/* Sheikh Invitations */}
        {!isLoading && !error && (
        <div className={`events-section ${activeCategory === 'invited' ? 'active' : ''}`} id="invited">
          <div className="section-subtitle">Events Featuring Hikmah Sheikhs</div>
          
          <div className="events-grid">
            {invitedEvents.length === 0 && <p className="no-resources">No upcoming sheikh invitations yet.</p>}
            {invitedEvents.map((event) => (
              <div key={event.id} className="event-card invited-card">
                <div className="event-type">{event.event_type}</div>
                <div className="event-header">
                  <div className="event-icon">
                    <i className={`fas fa-${event.icon || 'calendar'}`}></i>
                  </div>
                  <div className="event-header-text">
                    <h3>{event.title}</h3>
                    <p>{event.subtitle || (event.sheikh_name ? `With ${event.sheikh_name}` : '')}</p>
                  </div>
                </div>
                <div className="event-body">
                  <div className="event-details">
                    <div className="event-date">
                      <div className="day">{formatEventDay(event.event_date)}</div>
                      <div className="month">{formatEventMonth(event.event_date)}</div>
                    </div>
                    <div className="event-info">
                      <p>{event.description}</p>
                      <div className="event-meta">
                        <span><i className="fas fa-clock"></i> {formatTimeRange(event.start_time, event.end_time)}</span>
                        <span><i className="fas fa-map-marker-alt"></i> {event.location}</span>
                      </div>
                      {event.status_label && <span className="event-status">{event.status_label}</span>}
                    </div>
                  </div>
                  <button className="btn"><i className="fas fa-info-circle"></i> Event Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
        
        {/* Booking Form */}
        <div className="booking-section">
          <div className="booking-header">
            <h2>Request a Sheikh for Your Event</h2>
            <p>Invite one of our qualified scholars to speak at your event. Fill out the form below and we'll respond within 48 hours.</p>
          </div>
          
          <form className="booking-form" onSubmit={handleSubmit}>
            {/* Contact Information Section */}
            <div className="form-group full-width">
              <h3 className="form-section-title">Contact Information</h3>
            </div>
            
            <div className="form-group">
              <label htmlFor="contactName">Your Full Name <span>*</span></label>
              <input 
                type="text" 
                id="contactName" 
                name="contactName"
                className="form-control" 
                placeholder="Enter your name" 
                value={formData.contactName}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="contactEmail">Email Address <span>*</span></label>
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
              <label htmlFor="contactPhone">Phone Number <span>*</span></label>
              <input 
                type="tel" 
                id="contactPhone" 
                name="contactPhone"
                className="form-control" 
                placeholder="Enter your phone number" 
                value={formData.contactPhone}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="organization">Organization/Institution</label>
              <input 
                type="text" 
                id="organization" 
                name="organization"
                className="form-control" 
                placeholder="Enter organization name" 
                value={formData.organization}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Event Information Section */}
            <div className="form-group full-width">
              <h3 className="form-section-title">Event Information</h3>
            </div>
            
            <div className="form-group">
              <label htmlFor="sheikh">Select Sheikh <span>*</span></label>
              <select 
                id="sheikh" 
                name="sheikh"
                className="form-control" 
                value={formData.sheikh}
                onChange={handleInputChange}
                required
              >
                <option value="">Choose a Sheikh...</option>
                {sheikhs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.title ? ` (${s.title})` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="eventName">Event Name <span>*</span></label>
              <input 
                type="text" 
                id="eventName" 
                name="eventName"
                className="form-control" 
                placeholder="e.g. Annual Islamic Conference" 
                value={formData.eventName}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="eventLocation">Location <span>*</span></label>
              <input 
                type="text" 
                id="eventLocation" 
                name="eventLocation"
                className="form-control" 
                placeholder="Venue address or online platform" 
                value={formData.eventLocation}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="eventDate">Date <span>*</span></label>
              <input 
                type="date" 
                id="eventDate" 
                name="eventDate"
                className="form-control" 
                value={formData.eventDate}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="startTime">Start Time <span>*</span></label>
              <input 
                type="time" 
                id="startTime" 
                name="startTime"
                className="form-control" 
                value={formData.startTime}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endTime">End Time <span>*</span></label>
              <input 
                type="time" 
                id="endTime" 
                name="endTime"
                className="form-control" 
                value={formData.endTime}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="serviceType">Type of Service Required <span>*</span></label>
              <select 
                id="serviceType" 
                name="serviceType"
                className="form-control" 
                value={formData.serviceType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select service type...</option>
                <option value="teaching">Teaching Session</option>
                <option value="counselling">Counselling</option>
                <option value="lecture">Lecture/Presentation</option>
                <option value="workshop">Workshop Facilitation</option>
                <option value="panel">Panel Discussion</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="theme">Event Theme <span>*</span></label>
              <input 
                type="text" 
                id="theme" 
                name="theme"
                className="form-control" 
                placeholder="e.g. Building Strong Muslim Families" 
                value={formData.theme}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="attendees">Expected Number of Attendees <span>*</span></label>
              <input 
                type="number" 
                id="attendees" 
                name="attendees"
                className="form-control" 
                placeholder="Approximate number" 
                min="1" 
                value={formData.attendees}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="expectations">Specific Expectations <span>*</span></label>
              <textarea 
                id="expectations" 
                name="expectations"
                className="form-control" 
                placeholder="What specifically would you like the sheikh to cover?" 
                value={formData.expectations}
                onChange={handleInputChange}
                required 
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="otherGuests">Other Sheikhs/Guests Invited</label>
              <textarea 
                id="otherGuests" 
                name="otherGuests"
                className="form-control" 
                placeholder="Names of other speakers or special guests" 
                value={formData.otherGuests}
                onChange={handleInputChange}
              ></textarea>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="additionalInfo">Additional Information</label>
              <textarea 
                id="additionalInfo" 
                name="additionalInfo"
                className="form-control" 
                placeholder="Any other important details about the event" 
                value={formData.additionalInfo}
                onChange={handleInputChange}
              ></textarea>
            </div>
            
            <button type="submit" className="submit-btn">
              <i className="fas fa-paper-plane"></i> Submit Booking Request
            </button>
          </form>
        </div>
        
        {/* Our Sheikhs */}
        <div className="sheikhs-section">
          <div className="section-title">
            <h2>Our Esteemed Sheikhs</h2>
          </div>
          
          <div className="sheikhs-grid">
            {sheikhs.length === 0 && <p className="no-resources">No sheikhs listed yet.</p>}
            {sheikhs.map((s) => (
              <div key={s.id} className="sheikh-card">
                <div className="sheikh-avatar">
                  <i className={`fas fa-${s.avatar_icon || 'user'}`}></i>
                </div>
                <div className="sheikh-details">
                  <h3>{s.name}</h3>
                  <div className="sheikh-title">{s.title}</div>
                  <p className="sheikh-bio">{s.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventsPage;