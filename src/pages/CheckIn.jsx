import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QrCode, CheckCircle2, UserCheck, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function CheckIn() {
  const { eventId } = useParams();
  const { events, checkIn } = useStore();
  const event = events.find(e => e.id === eventId);

  const [scanInput, setScanInput] = useState('');
  const [lastScanned, setLastScanned] = useState(null);
  const [checkedList, setCheckedList] = useState([]);
  const [loadingCheckin, setLoadingCheckin] = useState(false);
  const [checkinsError, setCheckinsError] = useState(null);

  useEffect(() => {
    let active = true;
    api.tickets.getCheckins(eventId)
      .then(data => {
        if (!Array.isArray(data?.checkins)) throw new Error('The check-in service returned an invalid response.');
        if (active) {
          setCheckedList(data.checkins);
          setCheckinsError(null);
        }
      })
      .catch(error => {
        if (active) {
          setCheckinsError(error.message || 'Failed to load check-ins.');
          console.error('Failed to fetch check-ins:', error);
        }
      });
    return () => { active = false; };
  }, [eventId]);

  const handleManualScan = async (codeToProcess) => {
    const code = (codeToProcess || scanInput).trim();
    if (!code) {
      toast.error('Enter a ticket QR string or attendee code');
      return;
    }
    setLoadingCheckin(true);
    try {
      const data = await checkIn({ code, eventId });
      const scan = data.scan;
      setCheckedList(prev => [scan, ...prev]);
      setLastScanned(scan);
      setScanInput('');
      toast.success(`✅ Verified Entry for ${scan.name}!`);
    } catch (err) {
      toast.error(err.message || 'Check-in failed. Please try again.');
    } finally {
      setLoadingCheckin(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" /> Gate Scanner Active
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold" style={{fontFamily:'Poppins,sans-serif'}}>
            🎟️ Gate Check-In Scanner
          </h1>
          {event && (
            <p className="text-slate-400 text-sm mt-1">{event.title} — {event.venue}</p>
          )}
        </div>

        {/* Scanner Input */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-sm font-bold text-slate-300 uppercase mb-4">Scan or Enter QR Code</h2>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <QrCode className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={scanInput}
                onChange={e => setScanInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManualScan()}
                placeholder="Scan QR or type ticket code, press Enter..."
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => handleManualScan()}
              disabled={loadingCheckin}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-3 rounded-xl transition disabled:opacity-60"
            >
              {loadingCheckin ? 'Verifying...' : <><UserCheck className="w-4 h-4" /> Verify</>}
            </button>
          </div>
        </div>

        {/* Last Scanned */}
        {lastScanned && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <h3 className="font-bold text-emerald-300 text-sm uppercase">Last Verified Entry</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Name', value: lastScanned.name },
                { label: 'Email', value: lastScanned.email },
                { label: 'Pass Type', value: lastScanned.pass },
                { label: 'Time', value: lastScanned.time },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-sm font-semibold text-white truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Check-in Log */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <h2 className="font-bold text-slate-200" style={{fontFamily:'Poppins,sans-serif'}}>
              Verified Delegates ({checkedList.length})
            </h2>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" /> Live Log
            </div>
          </div>

          {checkinsError ? (
            <div role="alert" className="px-6 py-5 text-sm text-amber-300">
              Check-in history couldn&apos;t be loaded: {checkinsError}
            </div>
          ) : checkedList.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <QrCode className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No check-ins yet. Start scanning!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {checkedList.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-700/40 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white">{entry.name}</p>
                      <p className="text-xs text-slate-400">{entry.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-slate-700 text-slate-300 font-bold px-2.5 py-1 rounded-full">{entry.pass}</span>
                    <p className="text-xs text-slate-500 mt-1">{entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}