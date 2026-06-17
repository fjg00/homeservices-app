import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';
import { services, Booking, Service, TimePref } from './data';

type Row = Record<string, any>;

// Upload a picked photo (base64) to storage and return its public URL.
export async function uploadPhoto(base64: string): Promise<string | null> {
  try {
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error } = await supabase.storage
      .from('booking-photos')
      .upload(path, decode(base64), { contentType: 'image/jpeg' });
    if (error) {
      console.warn('uploadPhoto', error.message);
      return null;
    }
    return supabase.storage.from('booking-photos').getPublicUrl(path).data.publicUrl;
  } catch (e) {
    console.warn('uploadPhoto failed', e);
    return null;
  }
}

function composeTimePref(timePref: TimePref, dayLabel?: string, timeWindow?: string): string {
  if (timePref === 'asap') return 'ASAP';
  if (timePref === 'today') return 'Today' + (timeWindow ? ` · ${timeWindow}` : '');
  return (dayLabel || 'Scheduled') + (timeWindow ? ` · ${timeWindow}` : '');
}

export function mapBooking(r: Row): Booking {
  const service =
    services.find((s) => s.id === r.service_id) ||
    ({ id: r.service_id, name: r.service_name || r.service_id, icon: '•' } as Service);
  return {
    id: r.id,
    ref: r.ref,
    service,
    description: r.description ?? '',
    landmark: r.landmark ?? '',
    pin: r.pin ?? undefined,
    status: r.status,
    amount: r.amount ?? undefined,
    currency: r.currency ?? undefined,
    providerId: r.provider_id ?? undefined,
    rating: r.rating ?? undefined,
    createdAt: r.created_at ?? undefined,
  };
}

export async function upsertCustomer(phone: string, fields: Row = {}) {
  if (!phone) return;
  const { error } = await supabase.from('customers').upsert({ phone, ...fields }, { onConflict: 'phone' });
  if (error) console.warn('upsertCustomer', error.message);
}

export async function insertBooking(input: {
  phone: string;
  name?: string;
  service: Service;
  description: string;
  landmark: string;
  pin?: string;
  photoBase64?: string | null;
  timePref: TimePref;
  dayLabel?: string;
  timeWindow?: string;
}): Promise<Booking> {
  const area = input.landmark ? input.landmark.split(',')[0].trim() : null;
  const photoUrl = input.photoBase64 ? await uploadPhoto(input.photoBase64) : null;
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      customer_phone: input.phone,
      customer_name: input.name || null,
      service_id: input.service.id,
      service_name: input.service.name,
      description: input.description,
      photo_url: photoUrl,
      landmark: input.landmark,
      pin: input.pin || null,
      area,
      time_pref: composeTimePref(input.timePref, input.dayLabel, input.timeWindow),
      status: 'requested',
    })
    .select()
    .single();
  if (error) throw error;
  return mapBooking(data);
}

// The most recent booking for this phone — used to restore the home card on open.
export async function fetchLatestBooking(phone: string): Promise<Booking | null> {
  if (!phone) return null;
  const { data } = await supabase
    .from('bookings')
    .select('*')
    .eq('customer_phone', phone)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? mapBooking(data) : null;
}

export async function updateBooking(id: string, patch: Row) {
  const { error } = await supabase.from('bookings').update(patch).eq('id', id);
  if (error) throw error;
}

export async function fetchProviders(): Promise<Row[]> {
  const { data } = await supabase.from('providers').select('id,name,phone');
  return data ?? [];
}

// Live updates for a single booking (quote arrives, provider assigned, etc.)
export function subscribeBooking(id: string, onUpdate: (b: Booking) => void) {
  const channel = supabase
    .channel(`booking-${id}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${id}` },
      (payload) => onUpdate(mapBooking(payload.new))
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
