import { create } from 'zustand';
import api from '../services/api';

// Initialize auth from localStorage if it exists
const storedToken = localStorage.getItem('rsr_token');
const storedUser = localStorage.getItem('rsr_user');
let initialUser = null;

if (storedUser) {
  try {
    initialUser = JSON.parse(storedUser);
    if (!initialUser || typeof initialUser !== 'object' || typeof initialUser.email !== 'string') {
      throw new Error('Stored user data is invalid.');
    }
  } catch (error) {
    console.error('Failed to restore saved user session:', error);
    localStorage.removeItem('rsr_user');
    localStorage.removeItem('rsr_token');
  }
}

export const useStore = create((set, get) => ({
  events: [],
  myTickets: [],
  leads: [],
  user: initialUser,
  isLoggedIn: Boolean(storedToken && initialUser),
  loading: {
    events: false,
    tickets: false,
    leads: false,
    auth: false,
  },
  errors: {
    events: null,
    tickets: null,
    leads: null,
  },

  // ─── Auth ────────────────────────────────────────────────────────────────────
  login: async (credentials) => {
    set((state) => ({ loading: { ...state.loading, auth: true } }));
    try {
      const data = await api.auth.login(credentials);
      localStorage.setItem('rsr_token', data.token);
      localStorage.setItem('rsr_user', JSON.stringify(data.user));
      set({ user: data.user, isLoggedIn: true });
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      set((state) => ({ loading: { ...state.loading, auth: false } }));
    }
  },

  register: async (userData) => {
    set((state) => ({ loading: { ...state.loading, auth: true } }));
    try {
      const data = await api.auth.register(userData);
      localStorage.setItem('rsr_token', data.token);
      localStorage.setItem('rsr_user', JSON.stringify(data.user));
      set({ user: data.user, isLoggedIn: true });
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      set((state) => ({ loading: { ...state.loading, auth: false } }));
    }
  },

  logout: () => {
    localStorage.removeItem('rsr_token');
    localStorage.removeItem('rsr_user');
    set({ user: null, isLoggedIn: false, myTickets: [], leads: [] });
  },

  // ─── Events ──────────────────────────────────────────────────────────────────
  fetchEvents: async (filters = {}) => {
    set((state) => ({
      loading: { ...state.loading, events: true },
      errors: { ...state.errors, events: null },
    }));
    try {
      const data = await api.events.getAll(filters);
      if (!Array.isArray(data.events)) throw new Error('The event service returned an invalid response.');
      set({ events: data.events });
    } catch (err) {
      console.error('Failed to fetch events:', err);
      set((state) => ({ errors: { ...state.errors, events: err.message } }));
    } finally {
      set((state) => ({ loading: { ...state.loading, events: false } }));
    }
  },

  addEvent: async (eventData) => {
    try {
      const data = await api.events.create(eventData);
      set((state) => ({ events: [data.event, ...state.events] }));
      return { success: true, event: data.event };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // ─── Tickets ─────────────────────────────────────────────────────────────────
  registerForEvent: async (eventId, ticketType, attendeeInfo) => {
    const data = await api.tickets.register({ eventId, ticketType, attendeeInfo });
    set((state) => ({ myTickets: [data.ticket, ...state.myTickets] }));
    set((state) => ({
      events: state.events.map(e =>
        e.id === eventId ? { ...e, registrations: (e.registrations || 0) + 1 } : e
      )
    }));
    return data.ticket;
  },

  fetchMyTickets: async (email) => {
    set((state) => ({
      loading: { ...state.loading, tickets: true },
      errors: { ...state.errors, tickets: null },
    }));
    try {
      const userEmail = email || get().user?.email;
      const data = await api.tickets.getMy(userEmail);
      if (!Array.isArray(data.tickets)) throw new Error('The ticket service returned an invalid response.');
      set({ myTickets: data.tickets });
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      set((state) => ({ errors: { ...state.errors, tickets: err.message || 'Failed to fetch tickets.' } }));
    } finally {
      set((state) => ({ loading: { ...state.loading, tickets: false } }));
    }
  },

  checkIn: async (payload) => {
    const data = await api.tickets.checkIn(payload);
    if (data.scan?.ticketId) {
      set((state) => ({
        myTickets: state.myTickets.map(t =>
          t.id === data.scan.ticketId ? { ...t, checkedIn: true } : t
        )
      }));
    }
    return data;
  },

  // ─── Leads ───────────────────────────────────────────────────────────────────
  addLead: async (leadData) => {
    const data = await api.leads.capture(leadData);
    set((state) => ({ leads: [data.lead, ...state.leads] }));
    if (leadData.eventId) {
      set((state) => ({
        events: state.events.map(e =>
          e.id === leadData.eventId ? { ...e, leads: (e.leads || 0) + 1 } : e
        )
      }));
    }
    return data.lead;
  },

  fetchLeads: async (eventId) => {
    set((state) => ({
      loading: { ...state.loading, leads: true },
      errors: { ...state.errors, leads: null },
    }));
    try {
      const data = await api.leads.getAll(eventId);
      set({ leads: data.leads || [] });
    } catch (err) {
      console.error('Failed to fetch leads:', err);
      set((state) => ({ errors: { ...state.errors, leads: err.message } }));
    } finally {
      set((state) => ({ loading: { ...state.loading, leads: false } }));
    }
  },
}));
