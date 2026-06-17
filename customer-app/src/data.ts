export const SUPPORT_PHONE = '+96170123456';

// Mock dropping a GPS pin near Beirut. Replaced by a real map later.
export function dropPin(): string {
  const lat = 33.888 + (Math.random() - 0.5) * 0.04;
  const lng = 35.495 + (Math.random() - 0.5) * 0.04;
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export type Service = { id: string; name: string; icon: string };

export const services: Service[] = [
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
  { id: 'more', name: 'More', icon: '➕' },
];

export type TimePref = 'asap' | 'today' | 'pickday';

export const timeWindows = ['8–11 AM', '11 AM–2 PM', '2–5 PM', '5–8 PM'];

export type BookingStatus =
  | 'requested'
  | 'quoted'
  | 'assigned'
  | 'on_way'
  | 'completed'
  | 'rated';

export type Booking = {
  ref: string;
  service: Service;
  description: string;
  hasPhoto: boolean;
  landmark: string;
  pin?: string;
  timePref: TimePref;
  dayLabel?: string;
  timeWindow?: string;
  status: BookingStatus;
  quoteAmount?: number;
  quoteCurrency?: 'USD' | 'LBP';
  quoteNote?: string;
  providerName?: string;
  rating?: number;
};

let counter = 1042;
export const nextRef = () => `HS-${counter++}`;
