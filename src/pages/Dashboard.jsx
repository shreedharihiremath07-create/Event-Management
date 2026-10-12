import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownToLine, ArrowRight, BarChart3, CalendarDays, CheckCircle2,
  ChevronDown, CircleHelp, Clock3, LayoutDashboard, MapPin,
  Menu, Plus, QrCode, Search, Ticket, Users, X, Zap
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/helpers';
import './Dashboard.css';

const getEventDate = (date) => new Date(`${date}T00:00:00`);
const formatCount = (value) => (Number(value) || 0).toLocaleString('en-IN');
const formatShortDate = (date) => getEventDate(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
const getInitials = (name) => (name || 'Admin').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase();

function DashboardNav({ onNavigate }) {
  const links = [
    { label: 'Overview', href: '#overview', icon: LayoutDashboard },
    { label: 'Manage events', href: '#events', icon: CalendarDays },
    { label: 'Analytics', href: '#analytics', icon: BarChart3 },
    { label: 'Check-in', href: '#quick-actions', icon: QrCode },
    { label: 'Discover events', href: '/events', icon: Ticket, route: true },
  ];

  return (
    <nav className="dashboard-nav" aria-label="Dashboard navigation">
      {links.map((item, index) => {
        const content = <><item.icon size={16} aria-hidden="true" /><span>{item.label}</span></>;
        const onClick = () => {
          onNavigate();
          if (!item.route) document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
        };

        return item.route ? (
          <Link key={item.label} to={item.href} className={`dashboard-nav-link${index === 0 ? ' is-active' : ''}`} onClick={onClick}>{content}</Link>
        ) : (
          <a key={item.label} href={item.href} className={`dashboard-nav-link${index === 0 ? ' is-active' : ''}`} onClick={onClick}>{content}</a>
        );
      })}
    </nav>
  );
}

function EventCard({ event, today }) {
  const eventDate = getEventDate(event.date);
  const isUpcoming = eventDate >= today;
  const lowestTicket = (event.tickets || []).reduce((min, ticket) => Math.min(min, Number(ticket.price) || 0), Infinity);

  return (
    <article className="dashboard-event-card">
      <Link to={`/events/${event.id}`} className="dashboard-event-image-link" aria-label={`View ${event.title}`}>
        <img src={event.image} alt="" className="dashboard-event-image" loading="lazy" />
        <span className="dashboard-event-category">{event.category}</span>
        <span className="dashboard-event-date">{formatShortDate(event.date)}</span>
      </Link>
      <div className="dashboard-event-body">
        <div className="dashboard-event-state">
          <span className={`dashboard-state-dot${isUpcoming ? '' : ' is-past'}`} />
          {isUpcoming ? 'Upcoming' : 'Past event'}
        </div>
        <Link to={`/events/${event.id}`} className="dashboard-event-title">{event.title}</Link>
        <p className="dashboard-event-location"><MapPin size={14} /> {event.city}{event.venue ? ` · ${event.venue}` : ''}</p>
        <div className="dashboard-event-meta">
          <span><Users size={14} /> {formatCount(event.registrations)} registered</span>
          <strong>{Number.isFinite(lowestTicket) ? formatCurrency(lowestTicket) : 'Tickets'}</strong>
        </div>
        <div className="dashboard-event-actions">
          <Link to={`/checkin/${event.id}`}><QrCode size={14} /> Check-in</Link>
          <Link to={`/lead-capture/${event.id}`}><Users size={14} /> Leads</Link>
        </div>
      </div>
    </article>
  );
}

export default function Dashboard() {
  const { events, leads, user, loading, errors, fetchLeads } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [eventRange, setEventRange] = useState('All');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const orderedEvents = useMemo(
    () => [...events].sort((a, b) => getEventDate(a.date) - getEventDate(b.date)),
    [events]
  );
  const upcomingEvents = orderedEvents.filter((event) => getEventDate(event.date) >= today);
  const categories = useMemo(
    () => ['All', ...new Set(orderedEvents.map((event) => event.category).filter(Boolean))],
    [orderedEvents]
  );
  const visibleEvents = orderedEvents.filter((event) => {
    const matchesSearch = `${event.title} ${event.category} ${event.city} ${event.venue}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesRange = eventRange === 'All'
      || (eventRange === 'Upcoming' && getEventDate(event.date) >= today)
      || (eventRange === 'Past' && getEventDate(event.date) < today);
    return matchesSearch && matchesCategory && matchesRange;
  });
  const registrationTotal = events.reduce((total, event) => total + (Number(event.registrations) || 0), 0);
  const attendeeTotal = events.reduce((total, event) => total + (Number(event.attendees) || 0), 0);
  const chartEvents = orderedEvents.slice(-7).map((event, index) => ({
    name: `Event ${index + 1}`,
    title: event.title,
    registrations: Number(event.registrations) || 0,
  }));
  const organizerName = user?.name || 'Organizer';
  const heroImage = (upcomingEvents[0] || orderedEvents[0])?.image;

  const exportEvents = () => {
    const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = [
      ['Event', 'Category', 'Date', 'City', 'Registrations', 'Attendees', 'Leads'],
      ...orderedEvents.map((event) => [
        event.title, event.category, event.date, event.city,
        event.registrations, event.attendees, event.leads,
      ]),
    ];
    const csv = rows.map((row) => row.map(quote).join(',')).join('\r\n');
    const downloadUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = 'rsr-events-report.csv';
    anchor.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const scrollToEvents = (event) => {
    event.preventDefault();
    document.querySelector('#events')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="admin-dashboard" id="overview">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <Link to="/" className="dashboard-brand" aria-label="RSR Events home">
            <span className="dashboard-brand-mark"><Zap size={20} fill="currentColor" /></span>
            <span className="dashboard-brand-copy"><strong>RSR</strong><small>EVENT GROWTH PLATFORM</small></span>
          </Link>

          <DashboardNav onNavigate={() => setMobileNavOpen(false)} />

          <div className="dashboard-header-actions">
            <button className="dashboard-export-button" type="button" onClick={exportEvents} aria-label="Export event report">
              <ArrowDownToLine size={17} /><span>Export</span>
            </button>
            <Link to="/create-event" className="dashboard-header-create"><Plus size={16} /><span>Create event</span></Link>
            <div className="dashboard-user" title={`Signed in as ${organizerName}`} aria-label={`Signed in as ${organizerName}`}>
              <span className="dashboard-avatar">{getInitials(organizerName)}</span>
              <span className="dashboard-user-name">{organizerName.split(' ')[0]}</span>
              <ChevronDown size={14} />
            </div>
            <button
              className="dashboard-mobile-menu"
              type="button"
              aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              {mobileNavOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
        {mobileNavOpen && <div className="dashboard-mobile-nav"><DashboardNav onNavigate={() => setMobileNavOpen(false)} /></div>}
      </header>

      <main className="dashboard-page">
        <section className="dashboard-hero" style={heroImage ? { '--dashboard-hero-image': `url("${heroImage}")` } : undefined}>
          <div className="dashboard-hero-copy">
            <p className="dashboard-eyebrow">Your organizer workspace · Bengaluru</p>
            <h1>Let’s make plans<span>.</span></h1>
            <p className="dashboard-hero-description">Manage events, registrations, and guest check-ins from one place.</p>
            <form className="dashboard-hero-search" onSubmit={scrollToEvents}>
              <label className="dashboard-search-input">
                <Search size={18} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search your events, venues…"
                  aria-label="Search your events and venues"
                />
              </label>
              <label className="dashboard-search-category">
                <CalendarDays size={16} />
                <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} aria-label="Filter events by category">
                  {categories.map((category) => <option key={category}>{category}</option>)}
                </select>
                <ChevronDown size={14} />
              </label>
              <button type="submit"><Search size={15} /> Find events</button>
            </form>
          </div>
          <div className="dashboard-hero-caption"><span /> Event operations dashboard</div>
        </section>

        {errors?.events && (
          <div className="dashboard-error" role="alert">
            <CircleHelp size={18} />
            <span>Couldn’t load event data: {errors.events}</span>
            <Link to="/events">Open events</Link>
          </div>
        )}

        <section className="dashboard-metrics" aria-label="Event summary metrics">
          <article className="dashboard-metric">
            <span className="dashboard-metric-icon metric-blue"><CalendarDays size={19} /></span>
            <div><small>Total events</small><strong>{loading.events ? '—' : formatCount(events.length)}</strong><span>In your workspace</span></div>
          </article>
          <article className="dashboard-metric">
            <span className="dashboard-metric-icon metric-teal"><CheckCircle2 size={19} /></span>
            <div><small>Upcoming events</small><strong>{loading.events ? '—' : formatCount(upcomingEvents.length)}</strong><span>Scheduled from today</span></div>
          </article>
          <article className="dashboard-metric">
            <span className="dashboard-metric-icon metric-orange"><Ticket size={19} /></span>
            <div><small>Registrations</small><strong>{loading.events ? '—' : formatCount(registrationTotal)}</strong><span>Across listed events</span></div>
          </article>
          <article className="dashboard-metric">
            <span className="dashboard-metric-icon metric-violet"><Users size={19} /></span>
            <div><small>Captured leads</small><strong>{loading.leads ? '—' : errors?.leads ? '!' : formatCount(leads.length)}</strong><span>{errors?.leads ? 'Lead data unavailable' : 'Connected lead records'}</span></div>
          </article>
        </section>

        <section className="dashboard-events-section" id="events">
          <div className="dashboard-section-heading">
            <div>
              <p className="dashboard-section-eyebrow">Your event workspace</p>
              <h2>Manage your events</h2>
              <p>See what’s coming up and keep every event moving.</p>
            </div>
            <Link to="/create-event" className="dashboard-create-link"><Plus size={16} /> Create new event</Link>
          </div>
          <div className="dashboard-filter-row">
            <div className="dashboard-category-pills" aria-label="Filter events by category">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={selectedCategory === category ? 'selected' : ''}
                  aria-pressed={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'All' && <LayoutDashboard size={14} />}
                  {category}
                </button>
              ))}
            </div>
            <div className="dashboard-range-filters" aria-label="Filter event dates">
              {['All', 'Upcoming', 'Past'].map((range) => (
                <button
                  key={range}
                  type="button"
                  className={eventRange === range ? 'selected' : ''}
                  aria-pressed={eventRange === range}
                  onClick={() => setEventRange(range)}
                >
                  {range === 'Upcoming' && <Clock3 size={13} />}
                  {range}
                </button>
              ))}
            </div>
          </div>

          {errors?.events ? (
            <div className="dashboard-empty-state" role="status">Event listings are unavailable. Check the connection and reload this page.</div>
          ) : visibleEvents.length ? (
            <div className="dashboard-events-grid">
              {visibleEvents.slice(0, 4).map((event) => <EventCard key={event.id} event={event} today={today} />)}
            </div>
          ) : (
            <div className="dashboard-empty-state">{loading.events ? 'Loading events…' : 'No events match your filters.'}</div>
          )}
          <div className="dashboard-view-all">
            <span>{loading.events ? 'Loading event records…' : `Showing ${formatCount(Math.min(visibleEvents.length, 4))} of ${formatCount(visibleEvents.length)} matching events`}</span>
            <Link to="/events">View event directory <ArrowRight size={15} /></Link>
          </div>
        </section>

        <section className="dashboard-insights-grid" id="analytics">
          <article className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <div><p className="dashboard-section-eyebrow">Performance</p><h2>Registration overview</h2><p>Registrations by event in your workspace</p></div>
              <span className="dashboard-panel-tag">All events</span>
            </div>
            <div className="dashboard-chart-total"><strong>{loading.events ? '—' : formatCount(registrationTotal)}</strong><span>Total registrations</span></div>
            {chartEvents.length ? (
              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartEvents} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="#edf1f7" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#687993', fontSize: 11 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#687993', fontSize: 11 }} />
                    <Tooltip
                      cursor={{ fill: '#f1f6ff' }}
                      content={({ active, payload }) => active && payload?.length ? (
                        <div className="dashboard-chart-tooltip"><strong>{payload[0].payload.title}</strong><span>{formatCount(payload[0].value)} registrations</span></div>
                      ) : null}
                    />
                    <Bar dataKey="registrations" fill="#1769e8" radius={[6, 6, 0, 0]} maxBarSize={42} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="dashboard-empty-state">{loading.events ? 'Loading registration data…' : 'Registration data will appear when you add events.'}</div>}
            <div className="dashboard-chart-legend"><span /> Registrations per event</div>
          </article>

          <div className="dashboard-side-stack">
            <article className="dashboard-panel">
              <div className="dashboard-panel-heading">
                <div><p className="dashboard-section-eyebrow">Coming up</p><h2>Next events</h2><p>Your next scheduled experiences</p></div>
                <a href="#events" className="dashboard-inline-link">All events <ArrowRight size={14} /></a>
              </div>
              <div className="dashboard-upcoming-list">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <Link to={`/events/${event.id}`} className="dashboard-upcoming-item" key={event.id}>
                    <span className="dashboard-upcoming-date"><strong>{getEventDate(event.date).toLocaleDateString('en-IN', { day: '2-digit' })}</strong><small>{getEventDate(event.date).toLocaleDateString('en-IN', { month: 'short' })}</small></span>
                    <span className="dashboard-upcoming-copy"><strong>{event.title}</strong><small><MapPin size={12} /> {event.city}{event.time ? ` · ${event.time}` : ''}</small></span>
                    <ArrowRight className="dashboard-upcoming-arrow" size={15} />
                  </Link>
                ))}
                {!upcomingEvents.length && <p className="dashboard-empty-state">{loading.events ? 'Loading upcoming events…' : 'No upcoming events yet.'}</p>}
              </div>
            </article>

            <article className="dashboard-panel dashboard-attendance-panel" id="quick-actions">
              <div className="dashboard-panel-heading">
                <div><p className="dashboard-section-eyebrow">On the day</p><h2>Attendance snapshot</h2><p>Recorded check-ins across events</p></div>
              </div>
              <div className="dashboard-attendance-content">
                <span className="dashboard-attendance-icon"><CheckCircle2 size={20} /></span>
                <strong>{loading.events ? '—' : formatCount(attendeeTotal)}</strong>
                <span>attendees checked in</span>
              </div>
              <Link to={orderedEvents[0] ? `/checkin/${orderedEvents[0].id}` : '/events'} className="dashboard-attendance-link">Open check-in toolkit <ArrowRight size={14} /></Link>
            </article>
          </div>
        </section>

        <footer className="dashboard-footer">RSR EVENTS <span>·</span> Event operations workspace</footer>
      </main>
    </div>
  );
}
