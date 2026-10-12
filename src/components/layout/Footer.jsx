import React from 'react';
import { Zap, Mail, Phone, MapPin, Globe, Share2, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 rounded-lg p-1.5"><Zap className="w-5 h-5 text-white" /></div>
              <div>
                <span className="font-bold text-xl text-white" style={{fontFamily:'Poppins,sans-serif'}}>RSR</span>
                <span className="text-xs text-gray-400 block -mt-1">EVENT GROWTH PLATFORM</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">Turn every event into a growth engine. One unified ecosystem for Organizers, Attendees, Sponsors, and Businesses.</p>
            <div className="flex gap-3">
              {[Globe, Share2, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4" style={{fontFamily:'Poppins,sans-serif'}}>Platform Modules</h4>
            <ul className="space-y-2 text-sm">
              {['Discover Events','List Your Event','Ticketing & Pricing','QR Check-in & Badging','Lead Capture & AI Score','Analytics Dashboard'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4" style={{fontFamily:'Poppins,sans-serif'}}>Top Categories</h4>
            <ul className="space-y-2 text-sm">
              {['Technology','Business & Startups','Marketing','Finance & FinTech','Healthcare','Education'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4" style={{fontFamily:'Poppins,sans-serif'}}>Contact & Growth</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-400 shrink-0" /><span>hello@rsrevents.in</span></li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-400 shrink-0" /><span>+91 98765 43210</span></li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /><span>Bangalore, Karnataka, India</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-gray-500">© 2026 RSR Event Growth Platform. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy Policy','Terms of Service','Refund Policy'].map(l => (
              <a key={l} href="#" className="text-gray-500 hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}