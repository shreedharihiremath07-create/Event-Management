import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { categories, cities } from '../../data/events';

export default function EventFilters({ filters, onChange }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
      <div>
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2" style={{fontFamily:'Poppins,sans-serif'}}>
          <SlidersHorizontal className="w-4 h-4 text-blue-600" /> Filters
        </h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="category" value="" checked={filters.category === ''} onChange={e => onChange('category', e.target.value)} className="accent-blue-700" />
            <span className="text-sm text-gray-700">All Categories</span>
          </label>
          {categories.map(cat => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="category" value={cat} checked={filters.category === cat} onChange={e => onChange('category', e.target.value)} className="accent-blue-700" />
              <span className="text-sm text-gray-700">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
        <select value={filters.city} onChange={e => onChange('city', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Cities</option>
          {cities.map(city => <option key={city} value={city}>{city}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
        <div className="space-y-2">
          {['', 'free', 'paid'].map(val => (
            <label key={val} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="price" value={val} checked={filters.price === val} onChange={e => onChange('price', e.target.value)} className="accent-blue-700" />
              <span className="text-sm text-gray-700 capitalize">{val === '' ? 'All' : val === 'free' ? 'Free' : 'Paid'}</span>
            </label>
          ))}
        </div>
      </div>

      <button onClick={() => { onChange('category',''); onChange('city',''); onChange('price',''); }}
        className="w-full text-sm text-blue-700 font-medium hover:underline text-left">
        Clear all filters
      </button>
    </div>
  );
}