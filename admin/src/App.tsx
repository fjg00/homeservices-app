import { useMemo, useState } from 'react';
import './App.css';
import type { Booking, Status } from './types';
import { initialBookings, historyBookings, providers } from './mock';
import Dispatch from './Dispatch';
import History from './History';

function App() {
  const [tab, setTab] = useState<'dispatch' | 'history'>('dispatch');
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [selectedId, setSelectedId] = useState<string | null>(initialBookings[0]?.id ?? null);

  // Active queue = everything not yet paid / declined / cancelled.
  const activeQueue = useMemo(
    () => bookings.filter((b) => !['paid', 'declined', 'cancelled'].includes(b.status)),
    [bookings]
  );

  // History = seeded completed jobs + anything paid this session.
  const completed = useMemo(
    () => [...bookings.filter((b) => b.status === 'paid'), ...historyBookings],
    [bookings]
  );

  const update = (id: string, patch: Partial<Booking>) =>
    setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const sendQuote = (id: string, amount: number, currency: 'USD' | 'LBP', note: string) =>
    update(id, { status: 'quoted', quoteAmount: amount, quoteCurrency: currency, quoteNote: note });

  const assign = (id: string, providerId: string) =>
    update(id, { status: 'assigned', providerId });

  const advance = (id: string, status: Status) => update(id, { status });

  const newCount = activeQueue.filter((b) => b.status === 'requested').length;

  return (
    <div className="app">
      <div className="topbar">
        <span className="brand">🛠️ Dispatch</span>
        <button className={'tab' + (tab === 'dispatch' ? ' active' : '')} onClick={() => setTab('dispatch')}>
          Dispatch
        </button>
        <button className={'tab' + (tab === 'history' ? ' active' : '')} onClick={() => setTab('history')}>
          History
        </button>
        <span className="spacer" />
        {tab === 'dispatch' && <span className="muted">🔔 {newCount} new</span>}
      </div>

      {tab === 'dispatch' ? (
        <Dispatch
          bookings={activeQueue}
          providers={providers}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onSendQuote={sendQuote}
          onAssign={assign}
          onAdvance={advance}
        />
      ) : (
        <History bookings={completed} providers={providers} />
      )}
    </div>
  );
}

export default App;
