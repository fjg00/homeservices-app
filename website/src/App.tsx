import { useEffect, useState } from 'react';
import './App.css';
import { supabase } from './supabase';
import { t, services, type Lang } from './i18n';

// App store links — fill these in once the app is published.
const APP_LINKS = {
  ios: '#',
  android: '#',
};

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const [tab, setTab] = useState<'book' | 'track'>('book');
  const tr = t[lang];

  useEffect(() => {
    document.documentElement.dir = tr.dir;
    document.documentElement.lang = lang;
  }, [lang, tr.dir]);

  return (
    <div className="wrap">
      <nav className="nav">
        <span className="logo"><span className="dotmark">ب</span> Baytna</span>
        <span className="nav-right">
          <span className="langtog">
            <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
            <button className={lang === 'ar' ? 'on' : ''} onClick={() => setLang('ar')}>عربي</button>
          </span>
          <a href="#pros">{tr.nav_pro}</a>
          <button className="btn">{tr.nav_app}</button>
        </span>
      </nav>

      <section className="tool-wrap">
        <h1>{tr.q_title}</h1>
        <p className="sub">{tr.q_sub}</p>
        <div className="tabs">
          <button className={tab === 'book' ? 'on' : ''} onClick={() => setTab('book')}>{tr.tab_book}</button>
          <button className={tab === 'track' ? 'on' : ''} onClick={() => setTab('track')}>{tr.tab_track}</button>
        </div>
        {tab === 'book' ? <BookingTool lang={lang} /> : <TrackTool lang={lang} />}
        <div className="trust">
          <span>🛡️ {tr.trust_1}</span>
          <span>💵 {tr.trust_2}</span>
          <span>📍 {tr.trust_3}</span>
        </div>
      </section>

      <section className="how">
        <div className="how-step"><div className="n">1</div><p>{tr.how_1}</p></div>
        <div className="how-step"><div className="n">2</div><p>{tr.how_2}</p></div>
        <div className="how-step"><div className="n">3</div><p>{tr.how_3}</p></div>
      </section>

      <section className="pros" id="pros">
        <div>
          <h2>{tr.pro_title}</h2>
          <p className="psub">{tr.pro_sub}</p>
        </div>
        <ProForm lang={lang} />
      </section>

      <footer className="footer">
        <span className="logo" style={{ fontSize: 18 }}><span className="dotmark" style={{ width: 24, height: 24, fontSize: 13 }}>ب</span> Baytna</span>
        <span>{tr.foot_tag}</span>
        <a className="wa" href="https://wa.me/96170123456">💬 +961 70 123 456</a>
      </footer>
    </div>
  );
}

function BookingTool({ lang }: { lang: Lang }) {
  const tr = t[lang];
  const [svc, setSvc] = useState<(typeof services)[number] | null>(null);
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [ref, setRef] = useState('');

  const canSubmit = svc && phone.trim().length >= 6;

  const submit = async () => {
    if (!canSubmit || state === 'sending') return;
    setState('sending');
    const area = details.trim() ? details.trim().split('—')[0].split('-')[0].trim() : null;
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        customer_phone: phone.trim(),
        service_id: svc!.id,
        service_name: svc!.en,
        description: details.trim() || null,
        area,
        time_pref: 'ASAP',
        status: 'requested',
      })
      .select('ref')
      .single();
    if (error) {
      setState('error');
    } else {
      setRef(data?.ref ?? '');
      setState('done');
    }
  };

  const reset = () => {
    setSvc(null);
    setPhone('');
    setDetails('');
    setRef('');
    setState('idle');
  };

  if (state === 'done') {
    return (
      <div className="card">
        <div className="done">
          <div className="check">✓</div>
          <h3>{tr.q_done_t}</h3>
          {ref && <span className="ref">{tr.q_ref}: {ref}</span>}
          <p style={{ marginTop: 16 }}>{tr.q_done_d}</p>
          <div className="stores">
            <a className="store-btn" href={APP_LINKS.ios}>
              <span className="store-ic"></span>
              <span><small>{tr.q_get_app}</small>{tr.q_store_ios}</span>
            </a>
            <a className="store-btn" href={APP_LINKS.android}>
              <span className="store-ic">▶</span>
              <span><small>{tr.q_get_app}</small>{tr.q_store_android}</span>
            </a>
          </div>
          <button className="again" onClick={reset}>{tr.q_again}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {!svc ? (
        <>
          <div className="card-label">{tr.q_pick}</div>
          <div className="svc-grid">
            {services.map((s) => (
              <button key={s.id} className="svc" onClick={() => setSvc(s)}>
                <span className="emoji">{s.icon}</span>
                {s[lang]}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="chosen">
            <span className="lhs"><span className="em">{svc.icon}</span>{svc[lang]}</span>
            <button className="change" onClick={() => setSvc(null)}>{tr.q_change}</button>
          </div>
          <div className="field">
            <label>{tr.q_phone}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+961 …" inputMode="tel" />
          </div>
          <div className="field">
            <label>{tr.q_area}</label>
            <textarea rows={2} value={details} onChange={(e) => setDetails(e.target.value)} placeholder={tr.q_area_ph} />
          </div>
          {state === 'error' && <div className="err">{tr.q_err}</div>}
          <button className="btn" disabled={!canSubmit || state === 'sending'} onClick={submit}>
            {state === 'sending' ? tr.q_sending : tr.q_submit}
          </button>
        </>
      )}
    </div>
  );
}

function TrackTool({ lang }: { lang: Lang }) {
  const tr = t[lang];
  const [ref, setRef] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState<'idle' | 'searching' | 'found' | 'notfound'>('idle');
  const [result, setResult] = useState<any>(null);

  const canSearch = ref.trim().length >= 4 && phone.trim().length >= 6;

  const search = async () => {
    if (!canSearch || state === 'searching') return;
    setState('searching');
    const refNorm = ref.trim().toUpperCase().replace(/^(HS-?)?/i, 'HS-');
    const { data } = await supabase
      .from('bookings')
      .select('ref,status,service_name,amount,currency,providers(name)')
      .eq('ref', refNorm)
      .eq('customer_phone', phone.trim())
      .maybeSingle();
    if (data) {
      setResult(data);
      setState('found');
    } else {
      setState('notfound');
    }
  };

  const statusText = (s: string) => (tr as Record<string, string>)['st_' + s] || s;

  return (
    <div className="card">
      <div className="field">
        <label>{tr.tr_ref}</label>
        <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder={tr.tr_ref_ph} />
      </div>
      <div className="field">
        <label>{tr.tr_phone}</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+961 …" inputMode="tel" />
      </div>
      <button className="btn" disabled={!canSearch || state === 'searching'} onClick={search}>
        {state === 'searching' ? tr.tr_searching : tr.tr_btn}
      </button>

      {state === 'notfound' && <div className="err" style={{ marginTop: 14 }}>{tr.tr_notfound}</div>}

      {state === 'found' && result && (
        <div className="track-result">
          <div className="tr-row"><span>{result.ref}</span><span className="tr-svc">{result.service_name}</span></div>
          <div className="tr-status">{statusText(result.status)}</div>
          {result.amount && (
            <div className="tr-line">{tr.tr_quote}: <b>{result.currency === 'USD' ? '$' : ''}{result.amount} {result.currency}</b></div>
          )}
          {result.providers?.name && (
            <div className="tr-line">{tr.tr_provider}: <b>{result.providers.name}</b></div>
          )}
        </div>
      )}
    </div>
  );
}

function ProForm({ lang }: { lang: Lang }) {
  const tr = t[lang];
  const [form, setForm] = useState({ name: '', phone: '', trade: '', areas: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const canSubmit = form.name.trim() && form.phone.trim().length >= 6;

  const submit = async () => {
    if (!canSubmit || state === 'sending') return;
    setState('sending');
    const { error } = await supabase.from('applicants').insert({
      name: form.name.trim(),
      phone: form.phone.trim(),
      trade: form.trade || null,
      areas: form.areas.trim() || null,
    });
    setState(error ? 'error' : 'done');
  };

  if (state === 'done') {
    return (
      <div className="pform">
        <div className="done">
          <h3>{tr.f_done_t}</h3>
          <p style={{ color: 'var(--muted)' }}>{tr.f_done_d}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pform">
      <div className="field">
        <label>{tr.f_name}</label>
        <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={tr.f_name} />
      </div>
      <div className="field">
        <label>{tr.f_phone}</label>
        <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+961 …" />
      </div>
      <div className="field">
        <label>{tr.f_trade}</label>
        <select value={form.trade} onChange={(e) => set('trade', e.target.value)}>
          <option value="">{tr.f_trade_ph}</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.icon} {s[lang]}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>{tr.f_areas}</label>
        <input value={form.areas} onChange={(e) => set('areas', e.target.value)} placeholder={tr.f_areas_ph} />
      </div>
      {state === 'error' && <div className="err">{tr.f_err}</div>}
      <button className="btn" disabled={!canSubmit || state === 'sending'} onClick={submit}>
        {state === 'sending' ? tr.f_sending : tr.f_submit}
      </button>
    </div>
  );
}
