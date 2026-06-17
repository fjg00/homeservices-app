import { useState } from 'react';
import type { Booking, Provider, Status } from './types';

const statusLabels: Record<Status, string> = {
  requested: 'New',
  accepted: 'Accepted',
  on_way: 'On the way',
  done: 'Done',
  cancelled: 'Cancelled',
};

export default function Dispatch({
  bookings,
  providers,
  selectedId,
  onSelect,
  onAssign,
  onAdvance,
  onSetPrice,
  onReceipt,
}: {
  bookings: Booking[];
  providers: Provider[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAssign: (id: string, providerId: string) => void;
  onAdvance: (id: string, status: Status) => void;
  onSetPrice: (id: string, amount: number, currency: 'USD' | 'LBP') => void;
  onReceipt: (b: Booking) => void;
}) {
  const selected = bookings.find((b) => b.id === selectedId) || null;

  return (
    <div className="cols">
      <div className="queue">
        <div className="queue-h">Incoming requests · {bookings.length}</div>
        {bookings.map((b) => (
          <button key={b.id} className={'qrow' + (b.id === selectedId ? ' sel' : '')} onClick={() => onSelect(b.id)}>
            <div className="qtop">
              <span>{b.ref} · {b.serviceName}</span>
              <span className={'badge b-' + b.status}>{statusLabels[b.status]}</span>
            </div>
            <span className="qsub">📍 {b.area || '—'} · {b.timePref || '—'} · {b.createdAt}</span>
          </button>
        ))}
        {bookings.length === 0 && <div className="empty">Queue is empty 🎉</div>}
      </div>

      {selected ? (
        <Detail
          key={selected.id}
          booking={selected}
          providers={providers}
          onAssign={onAssign}
          onAdvance={onAdvance}
          onSetPrice={onSetPrice}
          onReceipt={onReceipt}
        />
      ) : (
        <div className="empty">Select a request to work on it.</div>
      )}
    </div>
  );
}

function Detail({
  booking,
  providers,
  onAssign,
  onAdvance,
  onSetPrice,
  onReceipt,
}: {
  booking: Booking;
  providers: Provider[];
  onAssign: (id: string, providerId: string) => void;
  onAdvance: (id: string, status: Status) => void;
  onSetPrice: (id: string, amount: number, currency: 'USD' | 'LBP') => void;
  onReceipt: (b: Booking) => void;
}) {
  const [amount, setAmount] = useState(booking.amount ? String(booking.amount) : '');
  const [currency, setCurrency] = useState<'USD' | 'LBP'>(booking.currency || 'USD');

  const provider = providers.find((p) => p.id === booking.providerId);
  const matches = providers.filter((p) => p.active && p.skills.includes(booking.serviceId));

  return (
    <div className="detail">
      <div className="detail-head">
        <span className="detail-title">{booking.ref} · {booking.serviceName}</span>
        <span className={'badge b-' + booking.status}>{statusLabels[booking.status]}</span>
      </div>

      <div className="info-row">
        {booking.photoUrl ? (
          <a href={booking.photoUrl} target="_blank" rel="noreferrer">
            <img className="photo-img" src={booking.photoUrl} alt="booking" />
          </a>
        ) : (
          <div className="photo">{booking.icon}</div>
        )}
        <div><div className="lbl">Problem</div>{booking.description || '—'}</div>
      </div>
      <div className="info-row">
        <div><div className="lbl">Customer</div>{booking.customerName || '—'} · {booking.customerPhone}</div>
      </div>
      <div className="info-row">
        <div>
          <div className="lbl">Location</div>
          {booking.area || '—'}{booking.landmark ? ` — ${booking.landmark}` : ''}{' '}
          {booking.pin && <a href={`https://maps.google.com/?q=${booking.pin}`} target="_blank" rel="noreferrer">· view map</a>}
        </div>
      </div>
      <div className="info-row">
        <div><div className="lbl">When</div>{booking.timePref || '—'}</div>
      </div>

      {/* Status flow */}
      <div className="section">
        <div className="section-h">Status</div>
        <div className="actions">
          {booking.status === 'requested' && (
            <button className="btn" onClick={() => onAdvance(booking.id, 'accepted')}>Accept</button>
          )}
          {booking.status === 'accepted' && (
            <button className="btn" onClick={() => onAdvance(booking.id, 'on_way')}>Mark on the way</button>
          )}
          {booking.status === 'on_way' && (
            <button className="btn" onClick={() => onAdvance(booking.id, 'done')}>Mark done</button>
          )}
          {booking.status === 'done' && (
            <button className="btn" onClick={() => onReceipt(booking)}>View receipt</button>
          )}
          {booking.status !== 'done' && booking.status !== 'cancelled' && (
            <button className="btn ghost" onClick={() => onAdvance(booking.id, 'cancelled')}>Cancel</button>
          )}
        </div>
      </div>

      {/* Assign provider */}
      <div className="section">
        <div className="section-h">Provider</div>
        {provider ? (
          <div className="prov match">
            <span><span className="av">{provider.name[0]}</span>{provider.name}</span>
            <span className="prov-meta">{provider.zone} · {provider.phone}</span>
          </div>
        ) : (
          matches.map((p) => (
            <div key={p.id} className={'prov' + (p.zone === booking.area ? ' match' : '')}>
              <span><span className="av">{p.name[0]}</span>{p.name}<span className="prov-meta"> · {p.zone} · {p.load === 0 ? 'free' : `${p.load} today`}</span></span>
              <button className="assign-btn" onClick={() => onAssign(booking.id, p.id)}>Assign</button>
            </div>
          ))
        )}
        {!provider && matches.length === 0 && <div className="muted">No matching provider for this service yet.</div>}
      </div>

      {/* Price for the receipt */}
      <div className="section">
        <div className="section-h">Price (for receipt)</div>
        <div className="quote-form">
          <input className="input amount" inputMode="numeric" placeholder="0" value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} />
          <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value as 'USD' | 'LBP')}>
            <option>USD</option><option>LBP</option>
          </select>
          <button className="btn ghost" disabled={!amount} onClick={() => onSetPrice(booking.id, Number(amount), currency)}>Save price</button>
        </div>
        <div className="muted" style={{ marginTop: 8 }}>You confirm the price with the customer by phone — this just sets what shows on the receipt.</div>
      </div>
    </div>
  );
}
