import { useMemo, useState } from 'react';
import type { Booking, Provider } from './types';

export default function History({
  bookings,
  providers,
  onReceipt,
}: {
  bookings: Booking[];
  providers: Provider[];
  onReceipt: (b: Booking) => void;
}) {
  const [q, setQ] = useState('');

  const providerName = (id?: string) => providers.find((p) => p.id === id)?.name || '—';

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return bookings;
    return bookings.filter(
      (b) =>
        b.ref.toLowerCase().includes(term) ||
        b.serviceName.toLowerCase().includes(term) ||
        b.area.toLowerCase().includes(term) ||
        providerName(b.providerId).toLowerCase().includes(term)
    );
  }, [q, bookings]);

  const total = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const rated = bookings.filter((b) => b.rating);
  const avg = rated.length
    ? (rated.reduce((s, b) => s + (b.rating || 0), 0) / rated.length).toFixed(1)
    : '—';

  return (
    <div>
      <div className="cards">
        <div className="card"><div className="l">Jobs completed</div><div className="v">{bookings.length}</div></div>
        <div className="card"><div className="l">Total billed</div><div className="v">${total.toLocaleString()}</div></div>
        <div className="card"><div className="l">Avg rating</div><div className="v">{avg} ★</div></div>
      </div>

      <div className="tools">
        <input
          className="input search"
          placeholder="Search ref, service, area, provider…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Ref</th><th>Service</th><th>Area</th><th>Provider</th><th>Price</th><th>Rating</th><th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((b) => (
            <tr key={b.id}>
              <td className="ref">{b.ref}</td>
              <td>{b.serviceName}</td>
              <td>{b.area}</td>
              <td><span className="av">{providerName(b.providerId)[0]}</span>{providerName(b.providerId)}</td>
              <td style={{ fontWeight: 600 }}>{b.amount != null ? `$${b.amount}` : '—'}</td>
              <td>{b.rating ? <Stars n={b.rating} /> : <span className="na">— not rated</span>}</td>
              <td><button className="assign-btn" onClick={() => onReceipt(b)}>Receipt</button></td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={7} className="empty">No matching jobs.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="stars">
      {'★'.repeat(n)}
      <span className="off">{'★'.repeat(5 - n)}</span>
    </span>
  );
}
