export type Status =
  | 'requested'
  | 'quoted'
  | 'accepted'
  | 'assigned'
  | 'on_way'
  | 'in_progress'
  | 'completed'
  | 'paid'
  | 'declined'
  | 'cancelled';

export type Provider = {
  id: string;
  name: string;
  skills: string[]; // service ids
  zone: string;
  load: number; // jobs today
  active: boolean;
};

export type Booking = {
  id: string;
  ref: string;
  serviceId: string;
  serviceName: string;
  icon: string;
  customerName: string;
  customerPhone: string;
  description: string;
  area: string;
  landmark: string;
  pin: string;
  timePref: string;
  createdAt: string;
  status: Status;
  quoteAmount?: number;
  quoteCurrency?: 'USD' | 'LBP';
  quoteNote?: string;
  providerId?: string;
  rating?: number;
};

export const ACTIVE_STATUSES: Status[] = [
  'requested',
  'quoted',
  'accepted',
  'assigned',
  'on_way',
  'in_progress',
  'completed',
];

export const DONE_STATUSES: Status[] = ['paid'];
