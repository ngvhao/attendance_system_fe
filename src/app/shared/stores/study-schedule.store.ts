// scheduler-store.ts
import { create } from 'zustand';

import type { Event } from '../components/calendar/types';

interface SchedulerStore {
  events: Event[];
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  removeEvent: (id: string) => void;
  updateEvent: (event: Event) => void;
}

export const useSchedulerStore = create<SchedulerStore>((set) => ({
  events: [],
  setEvents: (events) => set({ events }),
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
    })),
  removeEvent: (id) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    })),
  updateEvent: (updatedEvent) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)),
    })),
}));
