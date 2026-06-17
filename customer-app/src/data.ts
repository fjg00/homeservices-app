export const SUPPORT_PHONE = '+96170123456';

// Mock dropping a GPS pin near Beirut. Replaced by a real map later.
export function dropPin(): string {
  const lat = 33.888 + (Math.random() - 0.5) * 0.04;
  const lng = 35.495 + (Math.random() - 0.5) * 0.04;
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export type Lang = 'en' | 'ar';

export type Service = { id: string; name: string; ar: string; icon: string };

export const services: Service[] = [
  { id: 'plumber', name: 'Plumber', ar: 'سبّاك', icon: '🔧' },
  { id: 'electrician', name: 'Electrician', ar: 'كهربائي', icon: '⚡' },
  { id: 'ac', name: 'AC', ar: 'تكييف', icon: '❄️' },
  { id: 'generator', name: 'Generator / Solar', ar: 'مولّد / طاقة شمسية', icon: '🔋' },
  { id: 'appliance', name: 'Appliance Repair', ar: 'تصليح أجهزة', icon: '🧺' },
  { id: 'painter', name: 'Painter', ar: 'دهّان', icon: '🎨' },
  { id: 'carpenter', name: 'Carpenter', ar: 'نجّار', icon: '🪚' },
  { id: 'cleaning', name: 'Cleaning', ar: 'تنظيف', icon: '🧹' },
  { id: 'pest', name: 'Pest Control', ar: 'مكافحة حشرات', icon: '🐜' },
  { id: 'locksmith', name: 'Locksmith', ar: 'حدّاد أقفال', icon: '🔑' },
  { id: 'satellite', name: 'Satellite / TV', ar: 'ستالايت / تلفزيون', icon: '📡' },
  { id: 'internet', name: 'Internet & Network', ar: 'إنترنت وشبكات', icon: '📶' },
  { id: 'mechanic', name: 'Car Mechanic', ar: 'ميكانيكي سيارات', icon: '🚗' },
  { id: 'carwash', name: 'Car Wash', ar: 'غسيل سيارات', icon: '🚿' },
  { id: 'handyman', name: 'Handyman', ar: 'صنايعي', icon: '🛠️' },
  { id: 'more', name: 'More', ar: 'غير ذلك', icon: '➕' },
];

export const svcName = (s: Service, lang: Lang) => (lang === 'ar' ? s.ar : s.name);

export type TimePref = 'asap' | 'today' | 'pickday';

export const timeWindows = ['8–11 AM', '11 AM–2 PM', '2–5 PM', '5–8 PM'];

export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'on_way'
  | 'done'
  | 'cancelled';

// Order used to drive the progress tracker on the booking screen.
export const STATUS_ORDER: BookingStatus[] = ['requested', 'accepted', 'on_way', 'done'];

export type Booking = {
  id: string;
  ref: string;
  service: Service;
  description: string;
  landmark: string;
  pin?: string;
  status: BookingStatus;
  amount?: number;
  currency?: 'USD' | 'LBP';
  providerId?: string;
  providerName?: string;
  rating?: number;
  createdAt?: string;
};
