import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Sparkles, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import { categories, cities } from '../data/events';
import toast from 'react-hot-toast';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { addEvent } = useStore();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Technology',
    date: '',
    time: '09:00',
    endTime: '17:00',
    city: 'Bangalore',
    venue: '',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    organizer: 'My Organization',
    organizerLogo: 'https://ui-avatars.com/api/?name=My+Org&background=1B4FD8&color=fff',
    description: '',
    tags: 'Growth, Networking, B2B',
    isFree: false,
    tickets: [
      { type: 'Free Pass', price: 0, available: 100, description: 'Standard admission' },
      { type: 'VIP Pass', price: 1999, available: 50, description: 'Access to VIP lounge + networking' }
    ],
    speakers: [
      { name: '', role: '', avatar: 'https://ui-avatars.com/api/?name=Speaker&background=random' }
    ],
    agenda: [
      { time: '09:00', title: 'Registration & Welcome Coffee' },
      { time: '10:00', title: 'Keynote Session' }
    ],
    sponsors: 'Google, AWS, Razorpay'
  });

  const handleTicketChange = (idx, field, val) => {
    const next = [...formData.tickets];
    next[idx][field] = field === 'price' || field === 'available' ? Number(val) : val;
    setFormData({ ...formData, tickets: next });
  };

  const addTicket = () => {
    setFormData({
      ...formData,
      tickets: [...formData.tickets, { type: 'General', price: 499, available: 50, description: 'Standard pass' }]
    });
  };

  const removeTicket = (idx) => {
    if (formData.tickets.length === 1) return;
    setFormData({ ...formData, tickets: formData.tickets.filter((_, i) => i !== idx) });
  };

  const handleSpeakerChange = (idx, field, val) => {
    const next = [...formData.speakers];
    next[idx][field] = val;
    if (field === 'name') next[idx].avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(val || 'Speaker')}&background=1B4FD8&color=fff`;
    setFormData({ ...formData, speakers: next });
  };

  const addSpeaker = () => {
    setFormData({
      ...formData,
      speakers: [...formData.speakers, { name: '', role: '', avatar: 'https://ui-avatars.com/api/?name=Speaker&background=random' }]
    });
  };

  const removeSpeaker = (idx) => {
    setFormData({ ...formData, speakers: formData.speakers.filter((_, i) => i !== idx) });
  };

  const handleAgendaChange = (idx, field, val) => {
    const next = [...formData.agenda];
    next[idx][field] = val;
    setFormData({ ...formData, agenda: next });
  };

  const addAgenda = () => {
    setFormData({
      ...formData,
      agenda: [...formData.agenda, { time: '11:00', title: 'Networking & Breakout' }]
    });
  };

  const removeAgenda = (idx) => {
    setFormData({ ...formData, agenda: formData.agenda.filter((_, i) => i !== idx) });
  };

  const [publishing, setPublishing] = React.useState(false);

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.venue) {
      toast.error('Please fill in the essential event details!');
      return;
    }

    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      sponsors: formData.sponsors.split(',').map(s => s.trim()).filter(Boolean),
      speakers: formData.speakers.filter(s => s.name.trim()),
      isFree: formData.tickets.every(t => t.price === 0)
    };

    setPublishing(true);
    try {
      const result = await addEvent(payload);
      if (result?.success === false) {
        toast.error(result.error || 'Failed to publish event.');
      } else {
        toast.success('🎉 Event successfully published!');
        navigate('/events');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to publish event. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" /> List Your Event in Minutes
          </div>
          <h1 className="text-3xl font-bold text-slate-900" style={{fontFamily:'Poppins,sans-serif'}}>Host & Grow Your Event</h1>
          <p className="text-slate-600 text-sm mt-1">Collect registrations, capture hot leads, and turn attendees into customers.</p>
        </div>

        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          {[
            { num: 1, label: 'Basic Info' },
            { num: 2, label: 'Date & Venue' },
            { num: 3, label: 'Tickets & Pricing' },
            { num: 4, label: 'Speakers & Agenda' },
            { num: 5, label: 'Review & Publish' }
          ].map(s => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                step === s.num
                  ? 'bg-blue-700 text-white shadow-sm'
                  : step > s.num
                  ? 'text-green-700 bg-green-50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === s.num ? 'bg-white text-blue-700 font-bold' : step > s.num ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {step > s.num ? '✓' : s.num}
              </span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-800" style={{fontFamily:'Poppins,sans-serif'}}>1. Basic Event Information</h2>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Event Title *</label>
                <input
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. National B2B Growth Conclave 2026"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tags (comma separated)</label>
                  <input
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="AI, Sales, Venture, Founders"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Banner Image URL</label>
                <input
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description & Objective</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your event agenda, who should attend, and what value attendees & sponsors will get..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-800" style={{fontFamily:'Poppins,sans-serif'}}>2. Date, Time & Venue</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Event Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City *</label>
                  <select
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Venue / Address *</label>
                  <input
                    value={formData.venue}
                    onChange={e => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. Grand Ballroom, JW Marriott or Zoom Link"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Organizer / Host Organization</label>
                <input
                  value={formData.organizer}
                  onChange={e => setFormData({ ...formData, organizer: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800" style={{fontFamily:'Poppins,sans-serif'}}>3. Ticket Tiers & Pricing</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Set up free tickets, early bird, premium or VIP tiers</p>
                </div>
                <button
                  type="button"
                  onClick={addTicket}
                  className="flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold px-3 py-2 rounded-xl transition"
                >
                  <Plus className="w-4 h-4" /> Add Ticket Tier
                </button>
              </div>

              <div className="space-y-4">
                {formData.tickets.map((t, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 relative">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Ticket Name</label>
                        <input
                          value={t.type}
                          onChange={e => handleTicketChange(idx, 'type', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                          placeholder="e.g. VIP Pass"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Price (₹ INR, 0 = Free)</label>
                        <input
                          type="number"
                          value={t.price}
                          onChange={e => handleTicketChange(idx, 'price', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Seats Available</label>
                        <input
                          type="number"
                          value={t.available}
                          onChange={e => handleTicketChange(idx, 'available', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        value={t.description}
                        onChange={e => handleTicketChange(idx, 'description', e.target.value)}
                        placeholder="Perks description (e.g. includes lunch, priority networking)"
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs bg-white"
                      />
                      {formData.tickets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTicket(idx)}
                          className="text-red-500 hover:text-red-700 p-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800" style={{fontFamily:'Poppins,sans-serif'}}>Featured Speakers</h2>
                  <button
                    type="button"
                    onClick={addSpeaker}
                    className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-2 rounded-xl"
                  >
                    <Plus className="w-4 h-4" /> Add Speaker
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.speakers.map((sp, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <input
                        value={sp.name}
                        onChange={e => handleSpeakerChange(idx, 'name', e.target.value)}
                        placeholder="Speaker Name"
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                      />
                      <input
                        value={sp.role}
                        onChange={e => handleSpeakerChange(idx, 'role', e.target.value)}
                        placeholder="Role / Organization"
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                      />
                      <button type="button" onClick={() => removeSpeaker(idx)} className="text-red-500 hover:text-red-700 self-center">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800" style={{fontFamily:'Poppins,sans-serif'}}>Event Schedule / Agenda</h2>
                  <button
                    type="button"
                    onClick={addAgenda}
                    className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-2 rounded-xl"
                  >
                    <Plus className="w-4 h-4" /> Add Session
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.agenda.map((ag, idx) => (
                    <div key={idx} className="flex gap-3 items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <input
                        value={ag.time}
                        onChange={e => handleAgendaChange(idx, 'time', e.target.value)}
                        placeholder="Time (e.g. 10:30)"
                        className="w-28 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                      />
                      <input
                        value={ag.title}
                        onChange={e => handleAgendaChange(idx, 'title', e.target.value)}
                        placeholder="Session title & details"
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                      />
                      <button type="button" onClick={() => removeAgenda(idx)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sponsors & Partners (comma separated)</label>
                <input
                  value={formData.sponsors}
                  onChange={e => setFormData({ ...formData, sponsors: e.target.value })}
                  placeholder="e.g. Google Cloud, AWS, Razorpay"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800" style={{fontFamily:'Poppins,sans-serif'}}>5. Review & Launch</h2>
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-start gap-4">
                <img src={formData.image} alt="preview" className="w-32 h-24 object-cover rounded-xl shrink-0" />
                <div>
                  <span className="text-xs font-bold bg-blue-700 text-white px-2 py-0.5 rounded-full">{formData.category}</span>
                  <h3 className="font-bold text-base text-slate-900 mt-1">{formData.title || 'Untitled Event'}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">📅 {formData.date || 'TBD'} | 📍 {formData.venue || 'TBD'}, {formData.city}</p>
                  <p className="text-xs text-slate-500 mt-1">Host: {formData.organizer}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500">Ticket Tiers</p>
                  <p className="text-lg font-bold text-slate-800">{formData.tickets.length}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500">Speakers</p>
                  <p className="text-lg font-bold text-slate-800">{formData.speakers.filter(s=>s.name).length}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500">Agenda Items</p>
                  <p className="text-lg font-bold text-slate-800">{formData.agenda.length}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500">Total Capacity</p>
                  <p className="text-lg font-bold text-slate-800">{formData.tickets.reduce((a,b)=>a+(Number(b.available)||0),0)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm px-4 py-2"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition shadow-sm"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={publishing}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-8 py-3 rounded-xl transition shadow-lg shadow-green-600/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-5 h-5" /> {publishing ? 'Publishing...' : 'Publish Event'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}