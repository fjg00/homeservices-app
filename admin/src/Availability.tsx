import { useMemo, useState } from 'react';
import type { Provider, TimeOff } from './types';
import { services, serviceName, serviceIcon, TIME_SLOTS } from './mock';

export default function Availability({ providers, timeOff }: { providers: Provider[]; timeOff: TimeOff[] }) {
  const days = useMemo(() => {
    const arr: { key: string; label: string; dow: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      arr.push({
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }),
        dow: d.getDay(),
      });
    }
    return arr;
  }, []);

  const [serviceId, setServiceId] = useState<string>('all');
  const [dayKey, setDayKey] = useState<string>(days[0].key);
  const [slot, setSlot] = useState<string>(TIME_SLOTS[0]);

  const selectedDay = days.find((d) => d.key === dayKey)!;

  const offProviderIds = new Set(
    timeOff.filter((t) => t.date === dayKey).map((t) => t.provider_id as string)
  );

  const available = providers.filter(
    (p) =>
      p.active &&
      !offProviderIds.has(p.id) &&
      p.workdays.includes(selectedDay.dow) &&
      p.slots.includes(slot) &&
      (serviceId === 'all' || p.skills.includes(serviceId))
  );

  return (
    <div style={{ padding: '16px 20px' }}>
      <div className="filters">
        <label className="filt-label">Service</label>
        <select className="input" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
          <option value="all">All services</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
          ))}
        </select>
      </div>

      <label className="filt-label">Day</label>
      <div className="chip-row">
        {days.map((d) => (
          <button key={d.key} className={'chip' + (d.key === dayKey ? ' on' : '')} onClick={() => setDayKey(d.key)}>
            {d.label}
          </button>
        ))}
      </div>

      <label className="filt-label">Time slot</label>
      <div className="chip-row">
        {TIME_SLOTS.map((s) => (
          <button key={s} className={'chip' + (s === slot ? ' on' : '')} onClick={() => setSlot(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="avail-head">
        {available.length} available
        {serviceId !== 'all' ? ` for ${serviceName(serviceId)}` : ''} · {selectedDay.label} · {slot}
      </div>

      {available.map((p) => (
        <div key={p.id} className="prov match">
          <span>
            <span className="av">{p.name[0]}</span>
            {p.name}
            <span className="prov-meta"> · {p.zone} · {p.skills.map(serviceIcon).join(' ')}</span>
          </span>
          <span className="avail-actions">
            <a className="assign-btn" href={`tel:${p.phone.replace(/[^0-9+]/g, '')}`}>📞 {p.phone}</a>
            <a className="assign-btn" href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">💬</a>
          </span>
        </div>
      ))}

      {available.length === 0 && (
        <div className="empty">No one available for this service / day / time. Try another slot.</div>
      )}
    </div>
  );
}
