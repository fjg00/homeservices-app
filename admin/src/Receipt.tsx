import type { Booking, Provider } from './types';

export default function Receipt({
  booking,
  providers,
  onClose,
}: {
  booking: Booking;
  providers: Provider[];
  onClose: () => void;
}) {
  const provider = providers.find((p) => p.id === booking.providerId);
  const amount = booking.amount;
  const cur = booking.currency || 'USD';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="receipt-print" onClick={(e) => e.stopPropagation()}>
        <div className="rc-head">
          <span className="rc-brand">🛠️ Baytna</span>
          <span className="rc-ref">{booking.ref}</span>
        </div>
        <div className="rc-sub">Receipt · {new Date().toLocaleDateString()}</div>
        <div className="rc-divider" />
        <RcRow label="Service" value={booking.serviceName} />
        <RcRow label="Customer" value={`${booking.customerName || ''} ${booking.customerPhone}`.trim()} />
        {provider && <RcRow label="Provider" value={provider.name} />}
        {booking.area && <RcRow label="Area" value={booking.area} />}
        <RcRow label="Payment" value="Cash" />
        <div className="rc-divider" />
        <div className="rc-total">
          <span>Total</span>
          <span className="rc-amount">{amount != null ? `${cur === 'USD' ? '$' : ''}${amount} ${cur}` : '—'}</span>
        </div>
        <div className="rc-thanks">Thank you for choosing Baytna 🤍</div>
        <div className="rc-actions">
          <button className="btn ghost" onClick={onClose}>Close</button>
          <button className="btn" onClick={() => window.print()}>Print / Save PDF</button>
        </div>
      </div>
    </div>
  );
}

function RcRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rc-row">
      <span className="rc-label">{label}</span>
      <span className="rc-value">{value}</span>
    </div>
  );
}
