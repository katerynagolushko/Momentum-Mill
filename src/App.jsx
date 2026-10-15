import { useEffect, useRef, useState } from 'react';
import {
  AGENTS,
  PLATFORMS,
  buildBrandPack,
  buildProofOfRun,
  buildRunEvents,
} from './data/demoRun';

function PlatformBadge({ id }) {
  const p = PLATFORMS.find((x) => x.id === id);
  return (
    <span
      className="mono inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--line)',
        color: p?.color ?? 'var(--ink)',
      }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: p?.color }} />
      {p?.label ?? id}
    </span>
  );
}

const EXAMPLES = ['Coca-Cola', 'Nike', 'Spotify', 'Notion'];

export default function App() {
  const [step, setStep] = useState('setup'); // setup | desk
  const [brandInput, setBrandInput] = useState('Coca-Cola');
  const [brand, setBrand] = useState(null);

  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [logs, setLogs] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);
  const [mentions, setMentions] = useState({});
  const [scanning, setScanning] = useState([]);
  const [stats, setStats] = useState({ found: 0, drafted: 0, shipped: 0, queued: 0, plays: 0 });
  const logEndRef = useRef(null);
  const timersRef = useRef([]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [logs]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function startListening(pack) {
    clearTimers();
    setBrand(pack);
    setStep('desk');
    setRunning(true);
    setFinished(false);
    setLogs([]);
    setActiveAgent(null);
    setMentions({});
    setScanning([]);
    setStats({ found: 0, drafted: 0, shipped: 0, queued: 0, plays: 0 });

    const events = buildRunEvents(pack);
    const catalog = pack.mentions;
    const start = performance.now();

    events.forEach((ev) => {
      const id = setTimeout(() => {
        setActiveAgent(ev.agent);
        setLogs((prev) => [
          ...prev,
          {
            id: `${ev.t}-${ev.agent}-${prev.length}`,
            agent: ev.agent,
            type: ev.type,
            text: ev.text,
            platform: ev.platform,
            to: ev.to,
            at: new Date(start + ev.t).toLocaleTimeString(),
          },
        ]);

        if (ev.type === 'scan' && ev.platform) {
          setScanning((s) => (s.includes(ev.platform) ? s : [...s, ev.platform]));
        }
        if (ev.type === 'find' && ev.mentionId && catalog[ev.mentionId]) {
          setMentions((m) => ({
            ...m,
            [ev.mentionId]: { ...catalog[ev.mentionId], status: 'noticed', showDraft: false },
          }));
          setStats((s) => ({ ...s, found: s.found + 1 }));
        }
        if (ev.type === 'draft' && ev.mentionId) {
          setMentions((m) => ({
            ...m,
            [ev.mentionId]: {
              ...(m[ev.mentionId] ?? catalog[ev.mentionId]),
              status: 'drafted',
              showDraft: true,
            },
          }));
          setStats((s) => ({ ...s, drafted: s.drafted + 1 }));
        }
        if (ev.type === 'ship' && ev.mentionId) {
          setMentions((m) => ({
            ...m,
            [ev.mentionId]: {
              ...(m[ev.mentionId] ?? catalog[ev.mentionId]),
              status: 'replied',
              showDraft: true,
            },
          }));
          setStats((s) => ({ ...s, shipped: s.shipped + 1 }));
        }
        if (ev.type === 'queue' && ev.mentionId) {
          setMentions((m) => ({
            ...m,
            [ev.mentionId]: {
              ...(m[ev.mentionId] ?? catalog[ev.mentionId]),
              status: 'needs you',
              showDraft: true,
            },
          }));
          setStats((s) => ({ ...s, queued: s.queued + 1 }));
        }
        if (ev.type === 'play' && ev.mentionId) {
          setMentions((m) => ({
            ...m,
            [ev.mentionId]: {
              ...(m[ev.mentionId] ?? catalog[ev.mentionId]),
              status: 'play',
              showDraft: true,
            },
          }));
          setStats((s) => ({ ...s, plays: s.plays + 1 }));
        }
        if (ev === events[events.length - 1]) {
          setRunning(false);
          setFinished(true);
          setActiveAgent(null);
        }
      }, ev.t);
      timersRef.current.push(id);
    });
  }

  function onSubmitBrand(e) {
    e?.preventDefault?.();
    const pack = buildBrandPack(brandInput);
    startListening(pack);
  }

  function approve(id) {
    setMentions((m) => ({ ...m, [id]: { ...m[id], status: 'replied' } }));
    setStats((s) => ({
      ...s,
      shipped: s.shipped + 1,
      queued: Math.max(0, s.queued - 1),
    }));
    setLogs((prev) => [
      ...prev,
      {
        id: `approve-${id}-${prev.length}`,
        agent: 'publisher',
        type: 'ship',
        text: 'You approved — witty reply posted.',
        at: new Date().toLocaleTimeString(),
      },
    ]);
  }

  function downloadProof() {
    const md = buildProofOfRun({
      logs,
      stats,
      brand,
      finishedAt: new Date().toISOString(),
    });
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PROOF_OF_RUN.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  const mentionList = Object.values(mentions);

  if (step === 'setup') {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md font-bold"
            style={{ background: 'var(--primary)', color: 'var(--bg)' }}
          >
            V
          </div>
          <div>
            <div className="text-sm font-semibold">Vigil</div>
            <div className="mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              Social GTM agents
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-12">
          <p className="mono mb-3 text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--primary)' }}>
            Step 1 · Submit your brand
          </p>
          <h1
            className="text-3xl font-semibold tracking-tight md:text-4xl"
            style={{ letterSpacing: '-0.03em', textWrap: 'balance' }}
          >
            Type a brand. Agents notice the comments. Reply witty.
          </h1>
          <p className="mt-4 text-base" style={{ color: 'var(--muted)', textWrap: 'pretty' }}>
            Try <strong style={{ color: 'var(--ink)' }}>Coca-Cola</strong>. Vigil pulls mentions from X, Reddit,
            Instagram & LinkedIn, then drafts witty replies as a team of agents.
          </p>

          <form onSubmit={onSubmitBrand} className="mt-8 flex flex-col gap-3">
            <label className="text-sm font-medium" htmlFor="brand">
              Brand name
            </label>
            <input
              id="brand"
              value={brandInput}
              onChange={(e) => setBrandInput(e.target.value)}
              placeholder="e.g. Coca-Cola"
              className="rounded-lg px-4 py-3 text-lg outline-none"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
              }}
              autoFocus
            />
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setBrandInput(ex)}
                  className="rounded-md px-3 py-1.5 text-xs font-medium"
                  style={{
                    background: brandInput === ex ? 'oklch(0.22 0.05 160)' : 'var(--surface-2)',
                    border: `1px solid ${brandInput === ex ? 'var(--primary)' : 'var(--line)'}`,
                    color: 'var(--ink)',
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="mt-2 rounded-lg px-4 py-3 text-base font-semibold"
              style={{ background: 'var(--accent)', color: 'oklch(0.15 0 0)' }}
            >
              Watch agents listen →
            </button>
          </form>

          <ol className="mt-10 space-y-2 text-sm" style={{ color: 'var(--muted)' }}>
            <li>
              <strong style={{ color: 'var(--ink)' }}>1.</strong> You submit the brand
            </li>
            <li>
              <strong style={{ color: 'var(--ink)' }}>2.</strong> Scout pulls real-looking mentions
            </li>
            <li>
              <strong style={{ color: 'var(--ink)' }}>3.</strong> Voice writes witty replies · Publisher posts
            </li>
          </ol>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header
        className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6"
        style={{
          background: 'oklch(0.10 0 0 / 0.9)',
          borderBottom: '1px solid var(--line)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md font-bold"
            style={{ background: 'var(--primary)', color: 'var(--bg)' }}
          >
            V
          </div>
          <div>
            <div className="text-sm font-semibold">Watching {brand?.name}</div>
            <div className="mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              {brand?.handle} · witty replies on
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              clearTimers();
              setStep('setup');
              setRunning(false);
            }}
            className="rounded-md px-3 py-2 text-xs font-semibold"
            style={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
          >
            Change brand
          </button>
          {finished && (
            <button
              type="button"
              onClick={downloadProof}
              className="rounded-md px-3 py-2 text-xs font-semibold"
              style={{ border: '1px solid var(--primary)', background: 'var(--surface)', color: 'var(--primary)' }}
            >
              Proof of a run*
            </button>
          )}
          <button
            type="button"
            disabled={running}
            onClick={() => brand && startListening(brand)}
            className="rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50"
            style={{
              background: running ? 'var(--surface-2)' : 'var(--accent)',
              color: running ? 'var(--muted)' : 'oklch(0.15 0 0)',
            }}
          >
            {running ? 'Pulling mentions…' : finished ? 'Run again' : 'Start'}
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-5 md:px-6">
        <p className="mono text-[11px] uppercase tracking-[0.14em]" style={{ color: 'var(--primary)' }}>
          Step 2 · Agents notice comments about {brand?.name}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl" style={{ letterSpacing: '-0.02em' }}>
          {running
            ? `Scanning social for “${brand?.name}”…`
            : finished
              ? `Done — witty replies ready for ${brand?.name}`
              : `Ready to listen for ${brand?.name}`}
        </h1>
      </section>

      {/* Agent strip */}
      <section className="mx-auto max-w-6xl px-4 pb-4 md:px-6">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {AGENTS.map((a) => {
            const live = activeAgent === a.id;
            return (
              <div
                key={a.id}
                className="rounded-lg px-3 py-2.5"
                style={{
                  background: live ? 'oklch(0.20 0.04 160)' : 'var(--surface)',
                  border: `1px solid ${live ? 'var(--primary)' : 'var(--line)'}`,
                }}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-semibold">{a.name}</span>
                  <span className="mono text-[10px] uppercase" style={{ color: live ? 'var(--primary)' : 'var(--muted)' }}>
                    {live ? 'live' : '—'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
                  {a.brief}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Platforms */}
      <section className="mx-auto max-w-6xl px-4 pb-4 md:px-6">
        <div className="grid grid-cols-4 gap-2">
          {PLATFORMS.map((p) => {
            const on = scanning.includes(p.id);
            return (
              <div
                key={p.id}
                className="rounded-lg px-3 py-2 text-center"
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${on ? 'var(--primary)' : 'var(--line)'}`,
                }}
              >
                <div className="text-sm font-medium">{p.label}</div>
                <div className="mono text-[10px]" style={{ color: on ? 'var(--primary)' : 'var(--muted)' }}>
                  {on ? 'found signal' : 'waiting'}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 md:px-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Mentions */}
        <section
          className="rounded-xl p-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Comments noticed about {brand?.name}</h2>
            <span className="mono text-[10px]" style={{ color: 'var(--muted)' }}>
              {stats.found} pulled
            </span>
          </div>

          {mentionList.length === 0 ? (
            <p className="py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>
              {running ? 'Scout is searching… mentions will pop in here.' : 'Submit a brand to start.'}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {mentionList.map((m) => (
                <li
                  key={m.id}
                  className="mention-enter rounded-lg p-3"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <PlatformBadge id={m.platform} />
                    <span className="mono text-[10px] uppercase" style={{ color: 'var(--accent)' }}>
                      {m.status}
                    </span>
                    <span className="ml-auto text-xs" style={{ color: 'var(--muted)' }}>
                      {m.when}
                    </span>
                  </div>
                  <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                    {m.author}
                  </p>
                  <p className="mt-1 text-sm">{m.text}</p>

                  {m.showDraft && (
                    <div
                      className="mt-3 rounded-md p-3"
                      style={{ background: 'var(--bg)', borderLeft: '3px solid var(--primary)' }}
                    >
                      <p className="mono mb-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                        Witty reply from Voice
                      </p>
                      <p className="text-sm">{m.draft}</p>
                      {m.status === 'needs you' && (
                        <button
                          type="button"
                          onClick={() => approve(m.id)}
                          className="mt-3 rounded-md px-3 py-1.5 text-xs font-semibold"
                          style={{ background: 'var(--primary)', color: 'var(--bg)' }}
                        >
                          Approve & post
                        </button>
                      )}
                      {m.status === 'replied' && (
                        <p className="mono mt-2 text-[11px]" style={{ color: 'var(--ok)' }}>
                          ✓ Posted
                        </p>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Log + stats */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ['Noticed', stats.found],
              ['Drafted', stats.drafted],
              ['Posted', stats.shipped],
              ['Needs you', stats.queued],
            ].map(([label, n]) => (
              <div
                key={label}
                className="rounded-xl px-3 py-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
              >
                <div className="mono text-[10px] uppercase" style={{ color: 'var(--muted)' }}>
                  {label}
                </div>
                <div className="text-2xl font-semibold tabular-nums">{n}</div>
              </div>
            ))}
          </div>

          <section
            className="flex min-h-[380px] flex-1 flex-col rounded-xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
          >
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--line)' }}>
              <h2 className="text-sm font-semibold">What the agents are doing</h2>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-3" style={{ maxHeight: 480 }}>
              {logs.length === 0 && (
                <p className="py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
                  Live agent log…
                </p>
              )}
              {logs.map((l) => (
                <div
                  key={l.id}
                  className="log-enter mono rounded-md px-3 py-2 text-[11px] leading-relaxed"
                  style={{ background: 'var(--bg)', border: '1px solid var(--line)' }}
                >
                  <div className="mb-1 flex flex-wrap gap-2">
                    <span style={{ color: 'var(--primary)' }}>[{l.agent}]</span>
                    <span style={{ color: 'var(--muted)' }}>{l.at}</span>
                    {l.to && <span style={{ color: 'var(--accent)' }}>→ {l.to}</span>}
                  </div>
                  <div>{l.text}</div>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </section>

          {finished && (
            <div
              className="rounded-xl p-4 text-sm"
              style={{ background: 'oklch(0.18 0.04 160)', border: '1px solid var(--primary)' }}
            >
              <strong>Story for judges:</strong> you submitted <em>{brand?.name}</em> → agents noticed comments →
              witty replies drafted → some posted, one waiting for your approve.
              <button
                type="button"
                onClick={downloadProof}
                className="mt-3 block rounded-md px-3 py-2 text-xs font-semibold"
                style={{ background: 'var(--primary)', color: 'var(--bg)' }}
              >
                Download Proof of a run*
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
