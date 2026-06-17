import { supabase } from './supabase';
import type { Booking, Provider, Status } from './types';
import { serviceName, serviceIcon } from './mock';

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
}

type Row = Record<string, any>;

export function mapBooking(r: Row): Booking {
  return {
    id: r.id,
    ref: r.ref,
    serviceId: r.service_id,
    serviceName: r.service_name ?? serviceName(r.service_id),
    icon: serviceIcon(r.service_id),
    customerName: r.customer_name ?? '',
    customerPhone: r.customer_phone,
    description: r.description ?? '',
    area: r.area ?? '',
    landmark: r.landmark ?? '',
    pin: r.pin ?? '',
    timePref: r.time_pref ?? '',
    createdAt: relativeTime(r.created_at),
    status: r.status as Status,
    amount: r.amount ?? undefined,
    currency: r.currency ?? undefined,
    providerId: r.provider_id ?? undefined,
    rating: r.rating ?? undefined,
  };
}

export async function fetchBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBooking);
}

export async function fetchProviders(): Promise<Provider[]> {
  const { data, error } = await supabase.from('providers').select('*').order('name');
  if (error) throw error;
  return (data ?? []) as Provider[];
}

export async function updateBooking(id: string, patch: Row) {
  const { error } = await supabase.from('bookings').update(patch).eq('id', id);
  if (error) throw error;
}

// ── Providers ──────────────────────────────────────────────
export async function updateProvider(id: string, patch: Row) {
  const { error } = await supabase.from('providers').update(patch).eq('id', id);
  if (error) throw error;
}

export async function createProvider(fields: Row) {
  const { error } = await supabase.from('providers').insert(fields);
  if (error) throw error;
}

export async function deleteProvider(id: string) {
  const { error } = await supabase.from('providers').delete().eq('id', id);
  if (error) throw error;
}

// ── Time off / holidays ────────────────────────────────────
export async function fetchTimeOff(): Promise<Row[]> {
  const { data, error } = await supabase.from('time_off').select('*').order('date');
  if (error) throw error;
  return data ?? [];
}

export async function addTimeOff(providerId: string, date: string, reason: string) {
  const { error } = await supabase.from('time_off').insert({ provider_id: providerId, date, reason: reason || null });
  if (error) throw error;
}

export async function removeTimeOff(id: string) {
  const { error } = await supabase.from('time_off').delete().eq('id', id);
  if (error) throw error;
}

export function subscribeBookings(onChange: () => void) {
  const channel = supabase
    .channel('bookings-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, onChange)
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
