import type { ServiceDef } from './types';

export const TIME_SLOTS = ['8–11 AM', '11 AM–2 PM', '2–5 PM', '5–8 PM'];

// Service catalog (mirrors the customer app). Bookings & providers now come
// from Supabase — see db.ts.
export const services: ServiceDef[] = [
  { id: 'plumber', name: 'Plumber', icon: '🔧' },
  { id: 'electrician', name: 'Electrician', icon: '⚡' },
  { id: 'ac', name: 'AC', icon: '❄️' },
  { id: 'generator', name: 'Generator / Solar', icon: '🔋' },
  { id: 'appliance', name: 'Appliance Repair', icon: '🧺' },
  { id: 'painter', name: 'Painter', icon: '🎨' },
  { id: 'carpenter', name: 'Carpenter', icon: '🪚' },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
  { id: 'pest', name: 'Pest Control', icon: '🐜' },
  { id: 'locksmith', name: 'Locksmith', icon: '🔑' },
  { id: 'satellite', name: 'Satellite / TV', icon: '📡' },
  { id: 'internet', name: 'Internet & Network', icon: '📶' },
  { id: 'mechanic', name: 'Car Mechanic', icon: '🚗' },
  { id: 'carwash', name: 'Car Wash', icon: '🚿' },
  { id: 'handyman', name: 'Handyman', icon: '🛠️' },
];

export const serviceName = (id: string) => services.find((s) => s.id === id)?.name || id;
export const serviceIcon = (id: string) => services.find((s) => s.id === id)?.icon || '•';
