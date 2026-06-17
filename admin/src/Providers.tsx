import type { Provider } from './types';
import { serviceName, serviceIcon } from './mock';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Providers({ providers }: { providers: Provider[] }) {
  return (
    <div style={{ padding: '16px 20px' }}>
      <div className="muted" style={{ marginBottom: 12 }}>
        {providers.filter((p) => p.active).length} active · {providers.length} total
      </div>
      {providers.map((p) => (
        <div key={p.id} className="pcard">
          <div className="pcard-top">
            <div>
              <span className="av">{p.name[0]}</span>
              <span className="pname">{p.name}</span>
              {!p.active && <span className="badge b-paid" style={{ marginLeft: 8 }}>Inactive</span>}
            </div>
            <a className="phone" href={`tel:${p.phone.replace(/[^0-9+]/g, '')}`}>{p.phone}</a>
          </div>

          <div className="tags">
            {p.skills.map((s) => (
              <span key={s} className="tag">{serviceIcon(s)} {serviceName(s)}</span>
            ))}
          </div>

          <div className="pmeta">
            📍 {p.zone} &nbsp;·&nbsp; 🗓 {p.workdays.map((d) => dayNames[d]).join(', ')} &nbsp;·&nbsp; 🕐 {p.slots.join(', ')}
          </div>
        </div>
      ))}
    </div>
  );
}
