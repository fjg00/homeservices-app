import { useState } from 'react';
import type { Provider, TimeOff } from './types';
import { services, serviceName, serviceIcon } from './mock';
import { TIME_SLOTS } from './mock';
import { updateProvider, createProvider, deleteProvider, addTimeOff, removeTimeOff } from './db';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const blankProvider = (): Partial<Provider> => ({
  name: '', phone: '', skills: [], zone: '', active: true,
  workdays: [1, 2, 3, 4, 5, 6], slots: [...TIME_SLOTS], load: 0,
});

export default function Providers({
  providers,
  timeOff,
  onReload,
}: {
  providers: Provider[];
  timeOff: TimeOff[];
  onReload: () => void;
}) {
  const [editing, setEditing] = useState<Partial<Provider> | null>(null);

  const holidays = timeOff.filter((t) => t.provider_id === null);

  return (
    <div style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span className="muted">{providers.filter((p) => p.active).length} active · {providers.length} total</span>
        <button className="btn" onClick={() => setEditing(blankProvider())}>+ Add provider</button>
      </div>

      <Holidays holidays={holidays} onReload={onReload} />

      {providers.map((p) => {
        const off = timeOff.filter((t) => t.provider_id === p.id);
        return (
          <div key={p.id} className="pcard">
            <div className="pcard-top">
              <div>
                <span className="av">{p.name[0]}</span>
                <span className="pname">{p.name}</span>
                {!p.active && <span className="badge b-cancelled" style={{ marginLeft: 8 }}>Inactive</span>}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <a className="phone" href={`tel:${p.phone.replace(/[^0-9+]/g, '')}`}>{p.phone}</a>
                <button className="assign-btn" onClick={() => setEditing(p)}>Edit</button>
              </div>
            </div>
            <div className="tags">
              {p.skills.map((s) => <span key={s} className="tag">{serviceIcon(s)} {serviceName(s)}</span>)}
            </div>
            <div className="pmeta">
              📍 {p.zone || '—'} &nbsp;·&nbsp; 🗓 {p.workdays.map((d) => dayNames[d]).join(', ') || '—'} &nbsp;·&nbsp; 🕐 {p.slots.join(', ') || '—'}
              {off.length > 0 && <> &nbsp;·&nbsp; 🚫 off: {off.map((t) => t.date).join(', ')}</>}
            </div>
          </div>
        );
      })}

      {editing && (
        <ProviderEditor
          provider={editing}
          timeOff={editing.id ? timeOff.filter((t) => t.provider_id === editing.id) : []}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); onReload(); }}
          onReload={onReload}
        />
      )}
    </div>
  );
}

function Holidays({ holidays, onReload }: { holidays: TimeOff[]; onReload: () => void }) {
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  const add = async () => {
    if (!date) return;
    await addTimeOff(null, date, reason);
    setDate(''); setReason(''); onReload();
  };

  return (
    <div className="pcard" style={{ background: 'var(--surface)' }}>
      <div className="pcard-top"><span className="pname">🎉 Company holidays</span></div>
      <div className="pmeta" style={{ marginBottom: 10 }}>No one is shown as available on these days.</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className="input" placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} style={{ flex: 1, minWidth: 140 }} />
        <button className="assign-btn" disabled={!date} onClick={add}>Add holiday</button>
      </div>
      {holidays.length > 0 && (
        <div className="tags" style={{ marginTop: 10 }}>
          {holidays.map((h) => (
            <span key={h.id} className="tag">
              {h.date}{h.reason ? ` · ${h.reason}` : ''}
              <button className="tag-x" onClick={async () => { await removeTimeOff(h.id); onReload(); }}>✕</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ProviderEditor({
  provider,
  timeOff,
  onClose,
  onSaved,
  onReload,
}: {
  provider: Partial<Provider>;
  timeOff: TimeOff[];
  onClose: () => void;
  onSaved: () => void;
  onReload: () => void;
}) {
  const [f, setF] = useState<Partial<Provider>>({ ...provider });
  const [offDate, setOffDate] = useState('');
  const set = (k: keyof Provider, v: any) => setF((p) => ({ ...p, [k]: v }));

  const toggleArr = (k: 'skills' | 'slots', v: string) => {
    const arr = (f[k] as string[]) || [];
    set(k, arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };
  const toggleDay = (d: number) => {
    const arr = f.workdays || [];
    set('workdays', arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d].sort());
  };

  const canSave = (f.name || '').trim() && (f.phone || '').trim();

  const save = async () => {
    const payload = {
      name: f.name, phone: f.phone, zone: f.zone || null, skills: f.skills || [],
      active: f.active ?? true, workdays: f.workdays || [], slots: f.slots || [],
    };
    if (f.id) await updateProvider(f.id, payload);
    else await createProvider({ ...payload, load: 0 });
    onSaved();
  };

  const remove = async () => {
    if (f.id && confirm('Delete this provider?')) { await deleteProvider(f.id); onSaved(); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="editor" onClick={(e) => e.stopPropagation()}>
        <h3 className="ed-title">{f.id ? 'Edit provider' : 'Add provider'}</h3>

        <div className="ed-grid">
          <Field label="Name"><input className="input" value={f.name || ''} onChange={(e) => set('name', e.target.value)} /></Field>
          <Field label="Phone"><input className="input" value={f.phone || ''} onChange={(e) => set('phone', e.target.value)} /></Field>
          <Field label="Zone"><input className="input" value={f.zone || ''} onChange={(e) => set('zone', e.target.value)} /></Field>
          <Field label="Active">
            <button className={'toggle' + (f.active ? ' on' : '')} onClick={() => set('active', !f.active)}>
              {f.active ? 'Active' : 'Inactive'}
            </button>
          </Field>
        </div>

        <div className="ed-label">Skills</div>
        <div className="chip-wrap">
          {services.map((s) => (
            <button key={s.id} className={'mini-chip' + ((f.skills || []).includes(s.id) ? ' on' : '')} onClick={() => toggleArr('skills', s.id)}>
              {s.icon} {s.name}
            </button>
          ))}
        </div>

        <div className="ed-label">Workdays</div>
        <div className="chip-wrap">
          {dayNames.map((d, i) => (
            <button key={i} className={'mini-chip' + ((f.workdays || []).includes(i) ? ' on' : '')} onClick={() => toggleDay(i)}>{d}</button>
          ))}
        </div>

        <div className="ed-label">Time slots</div>
        <div className="chip-wrap">
          {TIME_SLOTS.map((s) => (
            <button key={s} className={'mini-chip' + ((f.slots || []).includes(s) ? ' on' : '')} onClick={() => toggleArr('slots', s)}>{s}</button>
          ))}
        </div>

        {f.id && (
          <>
            <div className="ed-label">Days off</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input className="input" type="date" value={offDate} onChange={(e) => setOffDate(e.target.value)} />
              <button className="assign-btn" disabled={!offDate} onClick={async () => { await addTimeOff(f.id!, offDate, ''); setOffDate(''); onReload(); }}>Add day off</button>
            </div>
            {timeOff.length > 0 && (
              <div className="tags" style={{ marginTop: 8 }}>
                {timeOff.map((t) => (
                  <span key={t.id} className="tag">{t.date}<button className="tag-x" onClick={async () => { await removeTimeOff(t.id); onReload(); }}>✕</button></span>
                ))}
              </div>
            )}
          </>
        )}

        <div className="ed-actions">
          {f.id ? <button className="btn ghost" onClick={remove} style={{ color: 'var(--text-danger, #a32d2d)' }}>Delete</button> : <span />}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn" disabled={!canSave} onClick={save}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="ed-label" style={{ marginTop: 0 }}>{label}</div>{children}</div>;
}
