import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { formatDate, formatCurrency, getDaysLeft } from '../../utils/helpers';

const fallbackImage = 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80';

const handleImageError = (event) => {
  if (event.currentTarget.src !== fallbackImage) event.currentTarget.src = fallbackImage;
};

export default function EventCard({ event }) {
  const tickets = Array.isArray(event.tickets) ? event.tickets : [];
  const tags = Array.isArray(event.tags) ? event.tags : [];
  const prices = tickets.map(ticket => Number(ticket.price)).filter(Number.isFinite);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const daysLeft = getDaysLeft(event.date);

  return (
    <Link to={`/events/${event.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
      <div className="relative overflow-hidden h-48">
        <img src={event.image || fallbackImage} onError={handleImageError} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="text-xs font-semibold bg-blue-700 text-white px-2.5 py-1 rounded-full">{event.category}</span>
          {event.isFree && <span className="text-xs font-semibold bg-green-500 text-white px-2.5 py-1 rounded-full">FREE</span>}
          {event.isFeatured && <span className="text-xs font-semibold bg-amber-500 text-white px-2.5 py-1 rounded-full">Featured</span>}
        </div>
        {daysLeft <= 7 && daysLeft > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {daysLeft}d left
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <p className="text-white font-bold text-lg leading-tight line-clamp-2" style={{fontFamily:'Poppins,sans-serif'}}>{event.title}</p>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-500" /><span>{formatDate(event.date)}</span></div>
          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500" /><span>{event.time}</span></div>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate">{event.venue}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {tags.slice(0,3).map(tag => (
            <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">#{tag}</span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Users className="w-3.5 h-3.5" />
            <span>{Number(event.registrations || 0).toLocaleString()} registered</span>
          </div>
          <span className="font-bold text-blue-700" style={{fontFamily:'Poppins,sans-serif'}}>
            {formatCurrency(minPrice)}
          </span>
        </div>
      </div>
    </Link>
  );
}