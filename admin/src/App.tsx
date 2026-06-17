import { useEffect, useMemo, useState } from 'react';
import './App.css';
import type { Booking, Provider, Status } from './types';
import Dispatch from './Dispatch';
import History from './History';
import Providers from './Providers';
import Availability from './Availability';
import Receipt from './Receipt';
import Applicants from './Applicants';
import type { TimeOff, Applicant } from './types';
import {
  fetchBookings,
  fetchProviders,
  fetchTimeOff,
  fetchApplicants,
  updateBooking,
  subscribeBookings,
  subscribeApplicants,
} from './db';

type Tab = 'dispatch' | 'availability' | 'providers' | 'applicants' | 'history';

function App() {
  const [tab, setTab] = useState<Tab>('dispatch');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [timeOff, setTimeOff] = useState<TimeOff[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = () =>
    fetchBookings()
      .then(setBookings)
      .catch((e) => setError(e.message));

  const reloadApplicants = () =>
    fetchApplicants().then((a) => setApplicants(a as Applicant[])).catch((e) => setError(e.message));

  const reloadRoster = () =>
    Promise.all([fetchProviders(), fetchTimeOff(), fetchApplicants()])
      .then(([p, to, a]) => {
        setProviders(p);
        setTimeOff(to as TimeOff[]);
        setApplicants(a as Applicant[]);
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    Promise.all([fetchProviders(), fetchBookings(), fetchTimeOff(), fetchApplicants()])
      .then(([p, b, to, a]) => {
        setProviders(p);
        setBookings(b);
        setTimeOff(to as TimeOff[]);
        setApplicants(a as Applicant[]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    // Live updates.
    const unsubB = subscribeBookings(reload);
    const unsubA = subscribeApplicants(reloadApplicants);
    return () => {
      unsubB();
      unsubA();
    };
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
  const newApplicants = applicants.filter((a) => a.status === 'new').length;

  return (
    <div className="app">
      <div className="topbar">
        <span className="brand">🛠️ Dispatch</span>
        <button className={'tab' + (tab === 'dispatch' ? ' active' : '')} onClick={() => setTab('dispatch')}>Dispatch</button>
        <button className={'tab' + (tab === 'availability' ? ' active' : '')} onClick={() => setTab('availability')}>Availability</button>
        <button className={'tab' + (tab === 'providers' ? ' active' : '')} onClick={() => setTab('providers')}>Providers</button>
        <button className={'tab' + (tab === 'applicants' ? ' active' : '')} onClick={() => setTab('applicants')}>
          Applicants{newApplicants > 0 ? ` (${newApplicants})` : ''}
        </button>
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
          {tab === 'applicants' && <Applicants applicants={applicants} onReload={reloadRoster} />}
          {tab === 'history' && <History bookings={completed} providers={providers} onReceipt={setReceipt} />}
        </>
      )}
      {receipt && <Receipt booking={receipt} providers={providers} onClose={() => setReceipt(null)} />}
    </div>
  );
}

export default App;
