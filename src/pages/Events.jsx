import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../store/useStore';
import EventCard from '../components/events/EventCard';
import EventFilters from '../components/events/EventFilters';

export default function Events() {
  const { events, fetchEvents, loading } = useStore();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [filters, setFilters] = useState(() => ({
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    price: '',
  }));
  const [showFilters, setShowFilters] = useState(false);
  const when = searchParams.get('when') || '';

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  const filtered = useMemo(() => events.filter(e => {
    const tags = Array.isArray(e.tags) ? e.tags : [];
    const searchTerm = search.toLowerCase();
    const searchFields = [e.title, e.category, e.city, e.venue, e.description, ...tags];
    if (search && !searchFields.some(value => String(value || '').toLowerCase().includes(searchTerm))) return false;
    if (filters.category && e.category !== filters.category) return false;
    if (filters.city && e.city !== filters.city) return false;
    if (filters.price === 'free' && !e.isFree) return false;
    if (filters.price === 'paid' && e.isFree) return false;
    const eventDate = new Date(`${e.date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (when === 'today' && eventDate.getTime() !== today.getTime()) return false;
    if (when === 'weekend') {
      const friday = new Date(today);
      friday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7));
      const sunday = new Date(friday);
      sunday.setDate(friday.getDate() + 2);
      sunday.setHours(23, 59, 59, 999);
      if (eventDate < friday || eventDate > sunday) return false;
    }
    if (when === 'month' &&
        (eventDate.getMonth() !== today.getMonth() || eventDate.getFullYear() !== today.getFullYear())) return false;
    return true;
  }), [events, search, filters, when]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-800 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4" style={{fontFamily:'Poppins,sans-serif'}}>Discover Amazing Events</h1>
          <p className="text-blue-200 mb-6">Find events that drive real business growth</p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events, topics, speakers..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-800 text-base focus:outline-none shadow-xl" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 font-medium">{filtered.length} events found</p>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:border-blue-400 transition lg:hidden">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 shrink-0">
            <EventFilters filters={filters} onChange={handleFilter} />
          </aside>

          {showFilters && (
            <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setShowFilters(false)}>
              <div className="absolute right-0 top-0 h-full w-72 bg-white p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
                <EventFilters filters={filters} onChange={handleFilter} />
              </div>
            </div>
          )}

          <div className="flex-1">
            {loading.events ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 h-72 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-xl font-semibold text-gray-700" style={{fontFamily:'Poppins,sans-serif'}}>No events found</p>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(event => <EventCard key={event.id} event={event} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}