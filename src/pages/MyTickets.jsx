import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, Clock, MapPin, Download, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../store/useStore';
import { formatDate, getDaysLeft } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function MyTickets() {
  const { myTickets, fetchMyTickets, user, loading, errors } = useStore();

  useEffect(() => {
    if (user?.email) fetchMyTickets(user.email);
  }, [fetchMyTickets, user?.email]);

  const handleDownloadTicket = (ticketId) => {
    toast.success(`🎟️ Downloading Ticket #${ticketId} PDF with pass badge...`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                <Ticket className="w-5 h-5 text-blue-700" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900" style={{fontFamily:'Poppins,sans-serif'}}>
                My Registered Event Passes
              </h1>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Present these digital QR tickets at the venue check-in desk for direct badge printing.
            </p>
          </div>
          <Link
            to="/events"
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition shadow-sm w-fit"
          >
            Explore More Events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Loading */}
        {!user?.email ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Ticket className="mx-auto mb-4 h-10 w-10 text-blue-700" />
            <h2 className="text-xl font-bold text-slate-900">Sign in to view your tickets</h2>
            <p className="mt-2 text-sm text-slate-500">Your registered tickets are linked to your account.</p>
            <Link to="/login" className="mt-5 inline-flex rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
              Sign in
            </Link>
          </div>
        ) : null}

        {user?.email && loading.tickets && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-64 animate-pulse" />
            ))}
          </div>
        )}

        {/* Tickets Grid or Empty State */}
        {user?.email && !loading.tickets && errors.tickets ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <p className="font-semibold text-red-700">Tickets couldn&apos;t be loaded.</p>
            <p className="mt-1 text-sm text-slate-600">{errors.tickets}</p>
            <button
              onClick={() => fetchMyTickets(user?.email)}
              className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Try again
            </button>
          </div>
        ) : user?.email && !loading.tickets && myTickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2" style={{fontFamily:'Poppins,sans-serif'}}>
              No tickets registered yet!
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              Browse our live roster of business summits, startup conclaves, and masterclasses across India to secure your passes.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 bg-blue-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-800 transition"
            >
              Discover & Register Now
            </Link>
          </div>
        ) : user?.email && !loading.tickets && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myTickets.map(ticket => {
              const daysLeft = getDaysLeft(ticket.eventDate);
              const isUpcoming = daysLeft >= 0;
              return (
                <div key={ticket.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Event image strip */}
                  {ticket.eventImage && (
                    <div className="h-28 overflow-hidden relative">
                      <img src={ticket.eventImage} alt={ticket.eventTitle} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${ticket.checkedIn ? 'bg-green-500 text-white' : isUpcoming ? 'bg-blue-600 text-white' : 'bg-slate-500 text-white'}`}>
                          {ticket.checkedIn ? '✅ Checked In' : isUpcoming ? `${daysLeft}d left` : 'Past Event'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight" style={{fontFamily:'Poppins,sans-serif'}}>
                          {ticket.eventTitle}
                        </h3>
                        <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full mt-1 inline-block">
                          {ticket.ticketType}
                        </span>
                      </div>
                      <div className="bg-white border border-slate-100 rounded-xl p-1.5 shrink-0">
                        <QRCodeSVG value={ticket.qrCode || ticket.id} size={64} />
                      </div>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>{formatDate(ticket.eventDate)}</span>
                      </div>
                      {ticket.eventTime && (
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>{ticket.eventTime}</span>
                        </div>
                      )}
                      {ticket.eventVenue && (
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          <span>{ticket.eventVenue}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl mb-3">
                      {ticket.checkedIn ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-700">{ticket.attendeeInfo?.name}</p>
                        <p className="text-xs text-slate-500">{ticket.attendeeInfo?.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadTicket(ticket.id)}
                      className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-xl hover:bg-slate-50 transition"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Pass PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}