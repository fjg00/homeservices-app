import { useState } from 'react';
import type { Booking, Provider, Status } from './types';

const statusLabels: Record<Status, string> = {
  requested: 'New',
  quoted: 'Quoted',
  accepted: 'Accepted',
  assigned: 'Assigned',
  on_way: 'En route',
  in_progress: 'In progress',
  completed: 'Completed',
  paid: 'Paid',
  declined: 'Declined',
  cancelled: 'Cancelled',
};

export default function Dispatch({
  bookings,
  providers,
  selectedId,
  onSelect,
  onSendQuote,
  onAssign,
  onAdvance,
}: {
  bookings: Booking[];
  providers: Provider[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSendQuote: (id: string, amount: number, currency: 'USD' | 'LBP', note: string) => void;
  onAssign: (id: string, providerId: string) => void;
  onAdvance: (id: string, status: Status) => void;
}) {
  const selected = bookings.find((b) => b.id === selectedId) || null;

  return (
    <div className="cols">
      <div className="queue">
        <div className="queue-h">Incoming requests · {bookings.length}</div>
        {bookings.map((b) => (
          <button
            key={b.id}
            className={'qrow' + (b.id === selectedId ? ' sel' : '')}
            onClick={() => onSelect(b.id)}
          >
            <div className="qtop">
              <span>{b.ref} · {b.serviceName}</span>
              <span className={'badge b-' + b.status}>{statusLabels[b.status]}</span>
            </div>
            <span className="qsub">📍 {b.area} · {b.timePref || '—'} · {b.createdAt}</span>
          </button>
        ))}
        {bookings.length === 0 && <div className="empty">Queue is empty 🎉</div>}
      </div>

      {selected ? (
        <Detail
          key={selected.id}
          booking={selected}
          providers={providers}
          onSendQuote={onSendQuote}
          onAssign={onAssign}
          onAdvance={onAdvance}
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
  onSendQuote,
  onAssign,
  onAdvance,
}: {
  booking: Booking;
  providers: Provider[];
  onSendQuote: (id: string, amount: number, currency: 'USD' | 'LBP', note: string) => void;
  onAssign: (id: string, providerId: string) => void;
  onAdvance: (id: string, status: Status) => void;
}) {
  const [amount, setAmount] = useState(booking.quoteAmount ? String(booking.quoteAmount) : '');
  const [currency, setCurrency] = useState<'USD' | 'LBP'>(booking.quoteCurrency || 'USD');
  const [note, setNote] = useState(booking.quoteNote || '');

  const provider = providers.find((p) => p.id === booking.providerId);
  const matches = providers.filter(
    (p) => p.active && p.skills.includes(booking.serviceId)
  );

  return (
    <div className="detail">
      <div className="detail-head">
        <span className="detail-title">{booking.ref} · {booking.serviceName}</span>
        <span className={'badge b-' + booking.status}>{statusLabels[booking.status]}</span>
      </div>

      <div className="info-row">
        <div className="photo">{booking.icon}</div>
        <div>
          <div className="lbl">Problem</div>
          {booking.description}
        </div>
      </div>
      <div className="info-row">
        <div>
          <div className="lbl">Customer</div>
          {booking.customerName} · {booking.customerPhone}
        </div>
      </div>
      <div className="info-row">
        <div>
          <div className="lbl">Location</div>
          {booking.area} — {booking.landmark}{' '}
          {booking.pin && (
            <a href={`https://maps.google.com/?q=${booking.pin}`} target="_blank" rel="noreferrer">
              · view map
            </a>
          )}
        </div>
      </div>
      <div className="info-row">
        <div>
          <div className="lbl">When</div>
          {booking.timePref || '—'}
        </div>
      </div>

      {/* Quote */}
      <div className="section">
        <div className="section-h">1 · Quote</div>
        {booking.status === 'requested' ? (
          <>
            <div className="quote-form">
              <input
                className="input amount"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              />
              <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value as 'USD' | 'LBP')}>
                <option>USD</option>
                <option>LBP</option>
              </select>
              <button
                className="btn"
                disabled={!amount}
                onClick={() => onSendQuote(booking.id, Number(amount), currency, note)}
              >
                Send quote
              </button>
            </div>
            <input
              className="input note"
              placeholder="Note (optional), e.g. service + parts"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </>
        ) : (
          <div className="quote-show">
            <div className="quote-amt">
              {booking.quoteCurrency === 'USD' ? '$' : ''}{booking.quoteAmount}{' '}
              <span style={{ fontSize: 13, fontWeight: 400 }}>{booking.quoteCurrency}</span>
            </div>
            {booking.quoteNote && <div className="quote-note">{booking.quoteNote}</div>}
            {booking.status === 'quoted' && (
              <div className="actions">
                <button className="btn" onClick={() => onAdvance(booking.id, 'accepted')}>
                  Mark accepted
                </button>
                <button className="btn ghost" onClick={() => onAdvance(booking.id, 'declined')}>
                  Declined
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assign */}
      <div className="section">
        <div className="section-h">2 · Assign provider</div>
        {booking.status === 'requested' || booking.status === 'quoted' ? (
          <div className="muted">Available once the customer accepts the quote.</div>
        ) : provider ? (
          <div className="prov match">
            <span><span className="av">{provider.name[0]}</span>{provider.name}</span>
            <span className="prov-meta">{provider.zone}</span>
          </div>
        ) : (
          matches.map((p) => (
            <div key={p.id} className={'prov' + (p.zone === booking.area ? ' match' : '')}>
              <span>
                <span className="av">{p.name[0]}</span>
                {p.name}
                <span className="prov-meta"> · {p.zone} · {p.load === 0 ? 'free' : `${p.load} today`}</span>
              </span>
              <button className="assign-btn" onClick={() => onAssign(booking.id, p.id)}>
                Assign
              </button>
            </div>
          ))
        )}
        {booking.status === 'accepted' && matches.length === 0 && (
          <div className="muted">No matching provider for this service yet.</div>
        )}
      </div>

      {/* Status progression */}
      {provider && booking.status !== 'paid' && (
        <div className="section">
          <div className="section-h">3 · Job status</div>
          <div className="actions">
            {booking.status === 'assigned' && (
              <button className="btn" onClick={() => onAdvance(booking.id, 'on_way')}>Mark en route</button>
            )}
            {booking.status === 'on_way' && (
              <button className="btn" onClick={() => onAdvance(booking.id, 'in_progress')}>Mark in progress</button>
            )}
            {booking.status === 'in_progress' && (
              <button className="btn" onClick={() => onAdvance(booking.id, 'completed')}>Mark completed</button>
            )}
            {booking.status === 'completed' && (
              <button className="btn" onClick={() => onAdvance(booking.id, 'paid')}>Mark paid (cash)</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
