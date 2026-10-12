import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, MapPin, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/helpers';

const heroImage = 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=2000&q=85';

const handleEventImageError = (event) => {
  if (event.currentTarget.src !== heroImage) {
    event.currentTarget.src = heroImage;
  }
};

const getEventDate = (date) => new Date(`${date}T00:00:00`);

const getPrice = (event) => {
  if (event.isFree) return 0;
  const paidPrices = (Array.isArray(event.tickets) ? event.tickets : [])
    .map((ticket) => Number(ticket.price))
    .filter((price) => price > 0);
  return paidPrices.length ? Math.min(...paidPrices) : 0;
};

function EventTile({ event }) {
  const date = getEventDate(event.date);
  const price = getPrice(event);

  return (
    <Link
      to={`/events/${event.id}`}
      className="group min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-28 overflow-hidden bg-slate-200 sm:h-32">
        <img
          src={event.image || heroImage}
          alt=""
          loading="lazy"
          onError={handleEventImageError}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-2.5 top-2.5 rounded-md bg-white px-2 py-1 text-center text-[10px] font-bold uppercase leading-tight text-slate-800 shadow">
          <span className="block">{date.toLocaleDateString('en-IN', { month: 'short' })}</span>
          <span className="block text-sm">{date.getDate()}</span>
        </span>
        {event.isFeatured && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-amber-400 px-2 py-1 text-[10px] font-bold text-slate-900">
            Featured
          </span>
        )}
        <span className="absolute bottom-2 left-2.5 rounded bg-blue-700 px-2 py-1 text-[10px] font-semibold text-white">
          {event.category}
        </span>
      </div>
      <div className="p-2.5">
        <h3 className="line-clamp-1 text-sm font-bold text-slate-900 group-hover:text-blue-700">{event.title}</h3>
        <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-slate-500">
          <MapPin className="h-3 w-3 shrink-0" /> {event.city}
        </p>
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-[10px] text-slate-500">Tickets from</span>
          <span className="text-xs font-bold text-blue-700">{formatCurrency(price)}</span>
        </div>
      </div>
    </Link>
  );
}

function UpcomingEvent({ event }) {
  const date = getEventDate(event.date);

  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
    >
      <img
        src={event.image || heroImage}
        alt=""
        loading="lazy"
        onError={handleEventImageError}
        className="h-16 w-20 shrink-0 rounded-lg object-cover"
      />
      <span className="w-9 shrink-0 text-center text-[10px] font-semibold leading-tight text-slate-500">
        {date.toLocaleDateString('en-IN', { month: 'short' })}
        <strong className="block text-base text-slate-900">{date.getDate()}</strong>
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-xs text-slate-900 group-hover:text-blue-700">{event.title}</strong>
        <span className="mt-1 block truncate text-[10px] text-slate-500">{event.category} · {event.city}</span>
        <span className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
          <MapPin className="h-3 w-3" /> {event.venue}
        </span>
      </span>
      <span className="hidden shrink-0 items-center gap-1 text-xs font-bold text-blue-700 sm:flex">
        {formatCurrency(getPrice(event))} <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

export default function Home() {
  const { events, loading } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [when, setWhen] = useState('');

  const categories = useMemo(
    () => [...new Set(events.map((event) => event.category).filter(Boolean))],
    [events]
  );
  const cities = useMemo(
    () => [...new Set(events.map((event) => event.city).filter(Boolean))].sort(),
    [events]
  );
  const upcomingEvents = useMemo(
    () => [...events]
      .filter((event) => getEventDate(event.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
      .sort((a, b) => getEventDate(a.date) - getEventDate(b.date)),
    [events]
  );
  const weekendEvents = useMemo(() => {
    const today = new Date();
    const friday = new Date(today);
    friday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7));
    friday.setHours(0, 0, 0, 0);
    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);
    sunday.setHours(23, 59, 59, 999);
    return upcomingEvents.filter((event) => {
      const eventDate = getEventDate(event.date);
      return eventDate >= friday && eventDate <= sunday;
    });
  }, [upcomingEvents]);
  const weekendPicks = weekendEvents.length ? weekendEvents : upcomingEvents;

  const submitSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (city) params.set('city', city);
    if (when) params.set('when', when);
    navigate(`/events${params.size ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <section
        className="relative isolate flex min-h-[210px] items-center bg-slate-900 bg-cover bg-center sm:min-h-[220px]"
        style={{ backgroundImage: `url("${heroImage}")` }}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-slate-950/15" />
        <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.25em] text-blue-200">
            Explore · Experience · Be part of it
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Bengaluru, <span className="text-amber-300">let&apos;s make plans.</span>
          </h1>
          <p className="mt-1 text-xs text-white/90 sm:text-sm">
            Discover concerts, festivals, food experiences and more.
          </p>

          <form
            onSubmit={submitSearch}
            className="mt-3 grid gap-1.5 rounded-xl bg-white p-1.5 shadow-xl sm:grid-cols-[minmax(0,1fr)_150px_155px_auto]"
          >
            <label className="flex min-w-0 items-center gap-2 px-2">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="sr-only">Search events, artists, or venues</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search events, artists, venues..."
                className="w-full border-0 bg-transparent py-1.5 text-xs text-slate-800 outline-none placeholder:text-slate-400"
              />
            </label>
            <label className="flex items-center gap-2 border-t border-slate-100 px-2 sm:border-l sm:border-t-0">
              <MapPin className="h-4 w-4 shrink-0 text-blue-600" />
              <span className="sr-only">Choose a city</span>
              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="w-full bg-transparent py-1.5 text-xs text-slate-700 outline-none"
              >
                <option value="">All cities</option>
                {cities.map((eventCity) => (
                  <option key={eventCity} value={eventCity}>{eventCity === 'Bangalore' ? 'Bengaluru' : eventCity}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 border-t border-slate-100 px-2 sm:border-l sm:border-t-0">
              <CalendarDays className="h-4 w-4 shrink-0 text-blue-600" />
              <span className="sr-only">Choose a date range</span>
              <select
                value={when}
                onChange={(event) => setWhen(event.target.value)}
                className="w-full bg-transparent py-1.5 text-xs text-slate-700 outline-none"
              >
                <option value="">Any date</option>
                <option value="today">Today</option>
                <option value="weekend">This weekend</option>
                <option value="month">This month</option>
              </select>
            </label>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
            >
              Search Events <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="py-3 sm:py-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">Big events happening near you</h2>
            <Link to="/events" className="hidden items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 sm:flex">
              View all events <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
            <Link to="/events" className="shrink-0 rounded-full bg-blue-700 px-3 py-1 text-[10px] font-semibold text-white">All</Link>
            {categories.map((category) => (
              <Link
                key={category}
                to={`/events?category=${encodeURIComponent(category)}`}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
              >
                {category}
              </Link>
            ))}
          </div>

          {loading.events && !events.length ? (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-56 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : events.length ? (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
              {upcomingEvents.slice(0, 5).map((event) => <EventTile key={event.id} event={event} />)}
            </div>
          ) : (
            <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-600">
              Events aren&apos;t available right now. Please try again shortly.
            </p>
          )}
        </section>

        {weekendPicks.length > 0 && (
          <section className="border-t border-slate-100 py-4 sm:py-5">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                  {weekendEvents.length ? 'This weekend in Bengaluru' : 'Coming up in Bengaluru'}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">Find your next great experience</p>
              </div>
              <Link to="/events" className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-2.5 md:grid-cols-2">
              {weekendPicks.slice(0, 4).map((event) => <UpcomingEvent key={event.id} event={event} />)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
