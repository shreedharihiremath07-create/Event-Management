import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import EventChatbot from './components/chat/EventChatbot';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import Dashboard from './pages/Dashboard';
import MyTickets from './pages/MyTickets';
import CheckIn from './pages/CheckIn';
import LeadCapture from './pages/LeadCapture';
import Login from './pages/Login';
import Register from './pages/Register';

function AppContent() {
  const { fetchEvents } = useStore();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className={`min-h-screen flex flex-col ${isDashboard ? 'dashboard-app' : 'bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white'}`}>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      {!isDashboard && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events key={location.search} />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/checkin/:eventId" element={<CheckIn />} />
          <Route path="/lead-capture/:eventId" element={<LeadCapture />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      {!isDashboard && <Footer />}
      <EventChatbot />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}