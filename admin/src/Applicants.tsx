import type { Applicant } from './types';
import { serviceName, serviceIcon, TIME_SLOTS } from './mock';
import { createProvider, setApplicantStatus } from './db';
import { relativeTime } from './db';

export default function Applicants({
  applicants,
  onReload,
}: {
  applicants: Applicant[];
  onReload: () => void;
}) {
  const approve = async (a: Applicant) => {
    // Turn the applicant into an active provider, prefilled from their form.
    await createProvider({
      name: a.name,
      phone: a.phone,
      skills: a.trade ? [a.trade] : [],
      zone: a.areas || null,
      active: true,
      workdays: [1, 2, 3, 4, 5, 6],
      slots: [...TIME_SLOTS],
      load: 0,
      notes: a.note || null,
    });
    await setApplicantStatus(a.id, 'approved');
    onReload();
  };

  const reject = async (a: Applicant) => {
    await setApplicantStatus(a.id, 'rejected');
    onReload();
  };

  const newOnes = applicants.filter((a) => a.status === 'new');
  const handled = applicants.filter((a) => a.status !== 'new');

  return (
    <div style={{ padding: '16px 20px' }}>
      <div className="muted" style={{ marginBottom: 14 }}>
        {newOnes.length} new · {applicants.length} total
      </div>

      {applicants.length === 0 && <div className="empty">No applications yet.</div>}

      {newOnes.map((a) => (
        <div key={a.id} className="pcard">
          <div className="pcard-top">
            <div>
              <span className="av">{a.name[0]}</span>
              <span className="pname">{a.name}</span>
              <span className="badge b-requested" style={{ marginLeft: 8 }}>New</span>
            </div>
            <a className="phone" href={`tel:${a.phone.replace(/[^0-9+]/g, '')}`}>{a.phone}</a>
          </div>
          <div className="pmeta">
            {a.trade && <>{serviceIcon(a.trade)} {serviceName(a.trade)} &nbsp;·&nbsp; </>}
            {a.areas && <>📍 {a.areas} &nbsp;·&nbsp; </>}
            🕐 {a.created_at ? relativeTime(a.created_at) : ''}
          </div>
          {a.note && <div className="pnotes">📝 {a.note}</div>}
          <div className="actions" style={{ marginTop: 12 }}>
            <button className="btn" onClick={() => approve(a)}>Approve → add to roster</button>
            <button className="btn ghost" onClick={() => reject(a)}>Reject</button>
          </div>
        </div>
      ))}

      {handled.length > 0 && (
        <>
          <div className="queue-h" style={{ padding: '18px 0 8px' }}>Handled</div>
          {handled.map((a) => (
            <div key={a.id} className="pcard" style={{ opacity: 0.7 }}>
              <div className="pcard-top">
                <div>
                  <span className="av">{a.name[0]}</span>
                  <span className="pname">{a.name}</span>
                  <span className={'badge ' + (a.status === 'approved' ? 'b-done' : 'b-cancelled')} style={{ marginLeft: 8 }}>
                    {a.status}
                  </span>
                </div>
                <a className="phone" href={`tel:${a.phone.replace(/[^0-9+]/g, '')}`}>{a.phone}</a>
              </div>
              <div className="pmeta">
                {a.trade && <>{serviceIcon(a.trade)} {serviceName(a.trade)}</>}{a.areas ? ` · 📍 ${a.areas}` : ''}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
