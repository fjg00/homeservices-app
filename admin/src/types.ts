export type Status =
  | 'requested'
  | 'accepted'
  | 'on_way'
  | 'done'
  | 'cancelled';

export type Provider = {
  id: string;
  name: string;
  phone: string;
  skills: string[]; // service ids
  zone: string;
  load: number; // jobs today
  active: boolean;
  workdays: number[]; // 0=Sun .. 6=Sat
  slots: string[]; // time windows they usually work
};

export type ServiceDef = { id: string; name: string; icon: string };

export type TimeOff = { id: string; provider_id: string | null; date: string; reason?: string };

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
  amount?: number;
  currency?: 'USD' | 'LBP';
  providerId?: string;
  rating?: number;
};

export const ACTIVE_STATUSES: Status[] = ['requested', 'accepted', 'on_way'];

export const DONE_STATUSES: Status[] = ['done'];
