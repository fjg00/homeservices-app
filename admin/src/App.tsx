import { useEffect, useMemo, useState } from 'react';
import './App.css';
import type { Booking, Provider, Status } from './types';
import Dispatch from './Dispatch';
import History from './History';
import Providers from './Providers';
import Availability from './Availability';
import Receipt from './Receipt';
import type { TimeOff } from './types';
import { fetchBookings, fetchProviders, fetchTimeOff, updateBooking, subscribeBookings } from './db';

type Tab = 'dispatch' | 'availability' | 'providers' | 'history';

function App() {
  const [tab, setTab] = useState<Tab>('dispatch');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [timeOff, setTimeOff] = useState<TimeOff[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = () =>
    fetchBookings()
      .then(setBookings)
      .catch((e) => setError(e.message));

  const reloadRoster = () =>
    Promise.all([fetchProviders(), fetchTimeOff()])
      .then(([p, to]) => {
        setProviders(p);
        setTimeOff(to as TimeOff[]);
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    Promise.all([fetchProviders(), fetchBookings(), fetchTimeOff()])
      .then(([p, b, to]) => {
        setProviders(p);
        setBookings(b);
        setTimeOff(to as TimeOff[]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    // Live updates: any change to bookings refreshes the board.
    const unsub = subscribeBookings(reload);
    return unsub;
  }, []);

  const activeQueue = useMemo(
    () => bookings.filter((b) => !['paid', 'declined', 'cancelled'].includes(b.status)),
    [bookings]
  );
  const completed = useMemo(() => bookings.filter((b) => b.status === 'done'), [bookings]);

  // Optimistic local update + persist to the database.
  const patch = (id: string, local: Partial<Booking>, db: Record<string, unknown>) => {
    setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, ...local } : b)));
    updateBooking(id, db).catch((e) => setError(e.message));
  };

  const setPrice = (id: string, amount: number, currency: 'USD' | 'LBP') =>
    patch(id, { amount, currency }, { amount, currency });

  const assign = (id: string, providerId: string) =>
    patch(id, { providerId }, { provider_id: providerId });

  const advance = (id: string, status: Status) => patch(id, { status }, { status });

  const [receipt, setReceipt] = useState<Booking | null>(null);

  const newCount = activeQueue.filter((b) => b.status === 'requested').length;

  return (
    <div className="app">
      <div className="topbar">
        <span className="brand">🛠️ Dispatch</span>
        <button className={'tab' + (tab === 'dispatch' ? ' active' : '')} onClick={() => setTab('dispatch')}>Dispatch</button>
        <button className={'tab' + (tab === 'availability' ? ' active' : '')} onClick={() => setTab('availability')}>Availability</button>
        <button className={'tab' + (tab === 'providers' ? ' active' : '')} onClick={() => setTab('providers')}>Providers</button>
        <button className={'tab' + (tab === 'history' ? ' active' : '')} onClick={() => setTab('history')}>History</button>
        <span className="spacer" />
        {tab === 'dispatch' && <span className="muted">🔔 {newCount} new</span>}
      </div>

      {error && <div className="empty" style={{ color: 'var(--warn)' }}>⚠️ {error}</div>}
      {loading ? (
        <div className="empty">Loading…</div>
      ) : (
        <>
          {tab === 'dispatch' && (
            <Dispatch
              bookings={activeQueue}
              providers={providers}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onAssign={assign}
              onAdvance={advance}
              onSetPrice={setPrice}
              onReceipt={setReceipt}
            />
          )}
          {tab === 'availability' && <Availability providers={providers} timeOff={timeOff} />}
          {tab === 'providers' && <Providers providers={providers} timeOff={timeOff} onReload={reloadRoster} />}
          {tab === 'history' && <History bookings={completed} providers={providers} onReceipt={setReceipt} />}
        </>
      )}
      {receipt && <Receipt booking={receipt} providers={providers} onClose={() => setReceipt(null)} />}
    </div>
  );
}

export default App;
