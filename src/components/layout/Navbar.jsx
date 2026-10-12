import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Zap, Bell, User, ChevronDown, Bot } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isLoggedIn, user, logout } = useStore();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-700 rounded-lg p-1.5">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-blue-700" style={{fontFamily:'Poppins,sans-serif'}}>RSR</span>
              <span className="text-xs text-gray-500 block -mt-1" style={{fontFamily:'Poppins,sans-serif'}}>EVENT GROWTH PLATFORM</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-5">
            <Link to="/events" className="text-gray-700 hover:text-blue-700 font-semibold text-xs transition-colors">Discover Events</Link>
            <Link to="/create-event" className="text-gray-600 hover:text-blue-700 font-medium text-xs transition-colors">List Your Event</Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-700 font-medium text-xs transition-colors">Dashboard</Link>
            <Link to="/my-tickets" className="text-gray-600 hover:text-blue-700 font-medium text-xs transition-colors">My Tickets</Link>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-rsr-chatbot'))}
              className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full font-medium text-xs transition border border-blue-200 cursor-pointer shadow-xs"
            >
              <Bot className="w-3.5 h-3.5 text-blue-700" />
              <span>AI Assistant</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <button className="relative p-2 text-gray-500 hover:text-blue-700">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="flex items-center gap-2 cursor-pointer" onClick={logout}>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-700" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-xs font-medium text-gray-600 hover:text-blue-700 px-3 py-1.5 rounded-lg transition">Login</Link>
                <Link to="/register" className="text-xs font-semibold bg-blue-700 text-white px-3.5 py-2 rounded-lg hover:bg-blue-800 transition">Sign Up Free</Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 text-gray-500" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link to="/events" className="block text-gray-700 font-medium py-2" onClick={() => setOpen(false)}>Discover Events</Link>
          <Link to="/create-event" className="block text-gray-700 font-medium py-2" onClick={() => setOpen(false)}>List Your Event</Link>
          <Link to="/dashboard" className="block text-gray-700 font-medium py-2" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link to="/my-tickets" className="block text-gray-700 font-medium py-2" onClick={() => setOpen(false)}>My Tickets</Link>
          <button
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new CustomEvent('open-rsr-chatbot'));
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 text-blue-700 rounded-lg font-medium text-sm border border-blue-200"
          >
            <Bot className="w-4 h-4" />
            <span>Ask AI Event Assistant</span>
          </button>
          <div className="flex gap-3 pt-2">
            <Link to="/login" className="flex-1 text-center border border-blue-700 text-blue-700 py-2 rounded-lg font-medium text-sm" onClick={() => setOpen(false)}>Login</Link>
            <Link to="/register" className="flex-1 text-center bg-blue-700 text-white py-2 rounded-lg font-medium text-sm" onClick={() => setOpen(false)}>Sign Up Free</Link>
          </div>
        </div>
      )}
    </nav>
  );
}