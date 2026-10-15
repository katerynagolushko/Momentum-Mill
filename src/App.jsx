import { useEffect, useRef, useState } from 'react';
import {
  AGENT_DESIGN,
  AGENTS,
  BRAND,
  MENTIONS,
  PLATFORMS,
  RUN_EVENTS,
  buildProofOfRun,
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
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: p?.color }}
        aria-hidden
      />
      {p?.label ?? id}
    </span>
  );
}

function AgentChip({ agent, active, done }) {
  return (
    <div
      className="flex min-w-0 flex-1 flex-col gap-1 rounded-lg px-3 py-2.5"
      style={{
        background: active ? 'oklch(0.20 0.04 160)' : 'var(--surface)',
        border: `1px solid ${active ? 'var(--primary)' : 'var(--line)'}`,
        boxShadow: active ? 'inset 0 0 0 1px oklch(0.62 0.12 160 / 0.25)' : 'none',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{agent.name}</span>
        <span
          className="mono text-[10px] uppercase tracking-wider"
          style={{ color: done ? 'var(--ok)' : active ? 'var(--primary)' : 'var(--muted)' }}
        >
          {done ? 'idle' : active ? 'live' : 'ready'}
        </span>
      </div>
      <span className="text-xs" style={{ color: 'var(--muted)' }}>
        {agent.role} · {agent.brief}
      </span>
    </div>
  );
}

function Urgency({ level }) {
  const map = {
    high: { label: 'High', color: 'var(--danger)' },
    medium: { label: 'Med', color: 'var(--accent)' },
    low: { label: 'Low', color: 'var(--primary)' },
  };
  const u = map[level] ?? map.medium;
  return (
    <span className="mono text-[10px] font-semibold uppercase" style={{ color: u.color }}>
      {u.label}
    </span>
  );
}

function logStyles(type) {
  if (type === 'error') {
    return {
      background: 'oklch(0.16 0.05 25)',
      border: '1px solid oklch(0.45 0.14 25)',
      typeColor: 'var(--danger)',
    };
  }
  if (type === 'recover') {
    return {
      background: 'oklch(0.16 0.04 155)',
      border: '1px solid oklch(0.42 0.1 155)',
      typeColor: 'var(--ok)',
    };
  }
  if (type === 'plan') {
    return {
      background: 'oklch(0.16 0.04 250)',
      border: '1px solid oklch(0.40 0.08 250)',
      typeColor: 'oklch(0.72 0.12 250)',
    };
  }
  if (type === 'handoff') {
    return {
      background: 'oklch(0.16 0.04 75)',
      border: '1px solid oklch(0.42 0.1 75)',
      typeColor: 'var(--accent)',
    };
  }
  return {
    background: 'var(--bg)',
    border: '1px solid var(--line)',
    typeColor: 'var(--muted)',
  };
}

export default function App() {
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [logs, setLogs] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);
  const [seenAgents, setSeenAgents] = useState(new Set());
  const [mentions, setMentions] = useState({});
  const [scanning, setScanning] = useState([]);
  const [stats, setStats] = useState({ found: 0, drafted: 0, shipped: 0, queued: 0, plays: 0 });
  const logEndRef = useRef(null);
  const timersRef = useRef([]);
  const logsRef = useRef([]);
  const statsRef = useRef(stats);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [logs]);

  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  function reset() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setRunning(false);
    setFinished(false);
    setLogs([]);
    setActiveAgent(null);
    setSeenAgents(new Set());
    setMentions({});
    setScanning([]);
    setStats({ found: 0, drafted: 0, shipped: 0, queued: 0, plays: 0 });
  }

  function downloadProof(currentLogs = logsRef.current, currentStats = statsRef.current) {
    const md = buildProofOfRun({
      logs: currentLogs,
      stats: currentStats,
      finishedAt: new Date().toISOString(),
    });
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vigil-proof-of-run-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function startRun() {
    reset();
    setRunning(true);
    const start = performance.now();

    RUN_EVENTS.forEach((ev) => {
      const id = setTimeout(() => {
        setActiveAgent(ev.agent);
        setSeenAgents((prev) => new Set(prev).add(ev.agent));
        setLogs((prev) => {
          const next = [
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
          ];
          logsRef.current = next;
          return next;
        });

        if (ev.type === 'scan' && ev.platform) {
          setScanning((s) => (s.includes(ev.platform) ? s : [...s, ev.platform]));
        }

        if (ev.type === 'find' && ev.mentionId) {
          setMentions((m) => ({
            ...m,
            [ev.mentionId]: { ...MENTIONS[ev.mentionId], status: 'found' },
          }));
          setStats((s) => {
            const next = { ...s, found: s.found + 1 };
            statsRef.current = next;
            return next;
          });
        }

        if (ev.type === 'score' && ev.mentionId) {
          setMentions((m) => ({
            ...m,
            [ev.mentionId]: {
              ...(m[ev.mentionId] ?? MENTIONS[ev.mentionId]),
              status: 'triaged',
            },
          }));
        }

        if (ev.type === 'draft' && ev.mentionId) {
          setMentions((m) => ({
            ...m,
            [ev.mentionId]: {
              ...(m[ev.mentionId] ?? MENTIONS[ev.mentionId]),
              status: 'drafted',
              showDraft: true,
            },
          }));
          setStats((s) => {
            const next = { ...s, drafted: s.drafted + 1 };
            statsRef.current = next;
            return next;
          });
        }

        if (ev.type === 'ship' && ev.mentionId) {
          setMentions((m) => ({
            ...m,
            [ev.mentionId]: {
              ...(m[ev.mentionId] ?? MENTIONS[ev.mentionId]),
              status: 'shipped',
              showDraft: true,
            },
          }));
          setStats((s) => {
            const next = { ...s, shipped: s.shipped + 1 };
            statsRef.current = next;
            return next;
          });
        }

        if (ev.type === 'queue' && ev.mentionId) {
          setMentions((m) => ({
            ...m,
            [ev.mentionId]: {
              ...(m[ev.mentionId] ?? MENTIONS[ev.mentionId]),
              status: 'queued',
              showDraft: true,
            },
          }));
          setStats((s) => {
            const next = { ...s, queued: s.queued + 1 };
            statsRef.current = next;
            return next;
          });
        }

        if (ev.type === 'play' && ev.mentionId) {
          setMentions((m) => ({
            ...m,
            [ev.mentionId]: {
              ...(m[ev.mentionId] ?? MENTIONS[ev.mentionId]),
              status: 'play',
              showDraft: true,
            },
          }));
          setStats((s) => {
            const next = { ...s, plays: s.plays + 1 };
            statsRef.current = next;
            return next;
          });
        }

        if (ev === RUN_EVENTS[RUN_EVENTS.length - 1]) {
          setRunning(false);
          setFinished(true);
          setActiveAgent(null);
        }
      }, ev.t);
      timersRef.current.push(id);
    });
  }

  function approve(id) {
    setMentions((m) => ({
      ...m,
      [id]: { ...m[id], status: 'shipped' },
    }));
    setStats((s) => {
      const next = {
        ...s,
        shipped: s.shipped + 1,
        queued: Math.max(0, s.queued - 1),
      };
      statsRef.current = next;
      return next;
    });
    setLogs((prev) => {
      const next = [
        ...prev,
        {
          id: `approve-${id}-${prev.length}`,
          agent: 'publisher',
          type: 'ship',
          text: `Human approved. Posted ${id} reply.`,
          at: new Date().toLocaleTimeString(),
        },
      ];
      logsRef.current = next;
      return next;
    });
  }

  const mentionList = Object.values(mentions);
  const queued = mentionList.filter((m) => m.status === 'queued');
  const canDownloadProof = logs.length > 0;

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between gap-4 px-4 py-3 md:px-6"
        style={{
          background: 'oklch(0.10 0 0 / 0.85)',
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
            <div className="text-sm font-semibold tracking-tight">Vigil</div>
            <div className="mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              Social GTM crew · Accel AI Innovate
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {(running || finished) && (
            <span
              className="mono hidden items-center gap-2 rounded-full px-3 py-1 text-[11px] sm:inline-flex"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                color: running ? 'var(--primary)' : 'var(--ok)',
              }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inset-0 rounded-full ${running ? 'pulse-dot' : ''}`}
                  style={{ background: running ? 'var(--primary)' : 'var(--ok)' }}
                />
                <span
                  className="relative h-2 w-2 rounded-full"
                  style={{ background: running ? 'var(--primary)' : 'var(--ok)' }}
                />
              </span>
              {running ? 'Crew running' : 'Run complete'}
            </span>
          )}
          <a
            href="/pitch.html"
            className="rounded-md px-3 py-2 text-xs font-medium transition"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              color: 'var(--ink)',
            }}
          >
            Pitch slides
          </a>
          <button
            type="button"
            onClick={() => downloadProof()}
            disabled={!canDownloadProof}
            className="rounded-md px-3 py-2 text-xs font-medium transition disabled:opacity-40"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              color: canDownloadProof ? 'var(--ink)' : 'var(--muted)',
            }}
            title={canDownloadProof ? 'Download markdown Proof of a Run' : 'Start a run first'}
          >
            Download Proof of a Run
          </button>
          <button
            type="button"
            onClick={running ? undefined : startRun}
            disabled={running}
            className="rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-50"
            style={{
              background: running ? 'var(--surface-2)' : 'var(--accent)',
              color: running ? 'var(--muted)' : 'oklch(0.15 0 0)',
            }}
          >
            {finished ? 'Replay demo' : running ? 'Running…' : 'Start crew run'}
          </button>
        </div>
      </header>

      {/* Hero pitch — compact for demo */}
      <section className="px-4 pb-6 pt-8 md:px-6 md:pt-10">
        <div className="mx-auto max-w-6xl">
          <p
            className="mono mb-3 text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: 'var(--primary)' }}
          >
            Long-running agents · Task → workflow
          </p>
          <h1
            className="max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl"
            style={{ textWrap: 'balance', letterSpacing: '-0.03em' }}
          >
            Vigil keeps your brand desk awake on X, LinkedIn, Reddit & Instagram.
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg" style={{ color: 'var(--muted)', textWrap: 'pretty' }}>
            Five Claude agents listen, triage, draft, ship, and invent the next post — a GTM crew that runs while
            founders build. Demo brand: <span style={{ color: 'var(--ink)' }}>{BRAND.name}</span>.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm" style={{ color: 'var(--muted)' }}>
            <span style={{ color: 'var(--ink)' }}>Customer:</span> seed / Series A teams without a social team
            <span aria-hidden>·</span>
            <span style={{ color: 'var(--ink)' }}>Problem:</span> mentions die unanswered; proactive GTM never ships
          </div>
          <p className="mt-4 text-xs" style={{ color: 'var(--muted)' }}>
            Submission artifacts:{' '}
            <a href="/pitch.html" style={{ color: 'var(--primary)' }}>
              /pitch.html
            </a>
            {' · '}
            <span style={{ color: 'var(--ink)' }}>PROOF_OF_RUN.md</span> in repo · download live proof after a run
          </p>
        </div>
      </section>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 md:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Agent design — judging answers */}
          <section
            className="rounded-xl p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
            aria-label="Agent design"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Agent design</h2>
              <span className="mono text-[10px] uppercase" style={{ color: 'var(--primary)' }}>
                {AGENT_DESIGN.count} agents · for judges
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <h3 className="mono mb-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  How many
                </h3>
                <p className="text-sm">
                  <strong style={{ color: 'var(--ink)' }}>{AGENT_DESIGN.count}</strong> — Scout, Analyst, Voice,
                  Publisher, Strategist
                </p>
              </div>
              <div>
                <h3 className="mono mb-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  Run duration
                </h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Demo cycle: <span style={{ color: 'var(--ink)' }}>{AGENT_DESIGN.runDuration.demoCycle}</span>.
                  Production: continuous 24/7 listen (90s poll) — a shift never ends until paused.
                </p>
              </div>
              <div className="sm:col-span-2">
                <h3 className="mono mb-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  Plan
                </h3>
                <ul className="list-disc space-y-1 pl-4 text-sm" style={{ color: 'var(--muted)' }}>
                  {AGENT_DESIGN.plan.map((p) => (
                    <li key={p}>
                      <span style={{ color: 'var(--ink)' }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mono mb-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  Handoffs
                </h3>
                <ul className="list-disc space-y-1 pl-4 text-sm" style={{ color: 'var(--muted)' }}>
                  {AGENT_DESIGN.handoffs.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mono mb-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  Error recovery
                </h3>
                <ul className="list-disc space-y-1 pl-4 text-sm" style={{ color: 'var(--muted)' }}>
                  {AGENT_DESIGN.recovery.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>
              Task → workflow: {AGENT_DESIGN.runDuration.taskToWorkflow}
            </p>
          </section>

          {/* Agents */}
          <section
            className="rounded-xl p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Agent crew</h2>
              <span className="mono text-[10px] uppercase" style={{ color: 'var(--muted)' }}>
                handoffs live
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {AGENTS.map((a) => (
                <AgentChip
                  key={a.id}
                  agent={a}
                  active={activeAgent === a.id}
                  done={seenAgents.has(a.id) && activeAgent !== a.id}
                />
              ))}
            </div>
          </section>

          {/* Platforms */}
          <section
            className="rounded-xl p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Always listening</h2>
              {running && (
                <div className="relative h-1 w-24 overflow-hidden rounded-full" style={{ background: 'var(--line)' }}>
                  <div className="scan-bar absolute inset-y-0 w-1/2" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PLATFORMS.map((p) => {
                const on = scanning.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className="rounded-lg px-3 py-3"
                    style={{
                      background: 'var(--surface-2)',
                      border: `1px solid ${on ? 'var(--primary)' : 'var(--line)'}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{p.label}</span>
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: on ? 'var(--primary)' : 'var(--line)' }}
                        aria-label={on ? 'scanning' : 'idle'}
                      />
                    </div>
                    <p className="mono mt-1 text-[10px]" style={{ color: 'var(--muted)' }}>
                      {on ? 'polling' : 'armed'}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Mentions */}
          <section
            className="rounded-xl p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Inbox & plays</h2>
              <span className="mono text-[10px]" style={{ color: 'var(--muted)' }}>
                {mentionList.length} items
              </span>
            </div>

            {mentionList.length === 0 ? (
              <p className="py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
                Hit <strong style={{ color: 'var(--ink)' }}>Start crew run</strong> to watch Scout pull mentions
                and hand them across the desk.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {mentionList.map((m) => (
                  <li
                    key={m.id}
                    className="mention-enter rounded-lg p-3"
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <PlatformBadge id={m.platform} />
                      <Urgency level={m.urgency} />
                      <span className="mono text-[10px] uppercase" style={{ color: 'var(--muted)' }}>
                        {m.status}
                      </span>
                      <span className="ml-auto text-xs" style={{ color: 'var(--muted)' }}>
                        {m.when}
                      </span>
                    </div>
                    <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                      {m.author}
                    </p>
                    <p className="mt-1 text-sm" style={{ textWrap: 'pretty' }}>
                      {m.text}
                    </p>
                    {m.showDraft && (
                      <div
                        className="mt-3 rounded-md p-3"
                        style={{
                          background: 'var(--bg)',
                          borderLeft: '3px solid var(--primary)',
                        }}
                      >
                        <p className="mono mb-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                          Voice draft
                        </p>
                        <p className="whitespace-pre-wrap text-sm">{m.draft}</p>
                        {m.status === 'queued' && (
                          <button
                            type="button"
                            onClick={() => approve(m.id)}
                            className="mt-3 rounded-md px-3 py-1.5 text-xs font-semibold"
                            style={{ background: 'var(--primary)', color: 'var(--bg)' }}
                          >
                            Approve & post
                          </button>
                        )}
                        {m.status === 'shipped' && (
                          <p className="mono mt-2 text-[11px]" style={{ color: 'var(--ok)' }}>
                            ✓ Shipped
                          </p>
                        )}
                        {m.status === 'play' && (
                          <p className="mono mt-2 text-[11px]" style={{ color: 'var(--accent)' }}>
                            ★ Proactive play ready
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right: live log + stats */}
        <div className="flex flex-col gap-4">
          <section
            className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-2 xl:grid-cols-5"
            aria-label="Run stats"
          >
            {[
              ['Found', stats.found],
              ['Drafted', stats.drafted],
              ['Shipped', stats.shipped],
              ['Queued', stats.queued],
              ['Plays', stats.plays],
            ].map(([label, n]) => (
              <div
                key={label}
                className="rounded-xl px-3 py-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
              >
                <div className="mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  {label}
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">{n}</div>
              </div>
            ))}
          </section>

          <section
            className="flex min-h-[420px] flex-1 flex-col rounded-xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--line)' }}
            >
              <h2 className="text-sm font-semibold">Live agent log</h2>
              <span className="mono text-[10px]" style={{ color: 'var(--muted)' }}>
                plan · handoff · error · recover
              </span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-3" style={{ maxHeight: 520 }}>
              {logs.length === 0 && (
                <p className="py-10 text-center text-sm" style={{ color: 'var(--muted)' }}>
                  Agent handoffs and decisions will stream here.
                </p>
              )}
              {logs.map((l) => {
                const style = logStyles(l.type);
                return (
                  <div
                    key={l.id}
                    className="log-enter mono rounded-md px-3 py-2 text-[11px] leading-relaxed"
                    style={{
                      background: style.background,
                      border: style.border,
                    }}
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span style={{ color: 'var(--primary)' }}>[{l.agent}]</span>
                      <span
                        className="uppercase tracking-wider"
                        style={{ color: style.typeColor }}
                      >
                        {l.type}
                      </span>
                      <span style={{ color: 'var(--muted)' }}>{l.at}</span>
                      {l.to && (
                        <span style={{ color: 'var(--accent)' }}>→ {l.to}</span>
                      )}
                      {l.platform && <PlatformBadge id={l.platform} />}
                    </div>
                    <div style={{ color: 'var(--ink)' }}>{l.text}</div>
                  </div>
                );
              })}
              <div ref={logEndRef} />
            </div>
          </section>

          {queued.length > 0 && (
            <section
              className="rounded-xl p-4"
              style={{
                background: 'oklch(0.18 0.04 75)',
                border: '1px solid oklch(0.45 0.1 75)',
              }}
            >
              <h2 className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                Needs you
              </h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                {queued.length} medium-confidence {queued.length === 1 ? 'reply' : 'replies'} waiting for approve —
                high-confidence ones already shipped.
              </p>
            </section>
          )}

          <section
            className="rounded-xl p-4 text-sm"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
          >
            <h2 className="mb-2 text-sm font-semibold">Submission links</h2>
            <ul className="space-y-1.5" style={{ color: 'var(--muted)' }}>
              <li>
                <a href="/pitch.html" style={{ color: 'var(--primary)' }}>
                  Pitch slides → /pitch.html
                </a>
              </li>
              <li>
                Static proof file:{' '}
                <span style={{ color: 'var(--ink)' }}>PROOF_OF_RUN.md</span> (repo root)
              </li>
              <li>
                Live proof:{' '}
                <button
                  type="button"
                  onClick={() => downloadProof()}
                  disabled={!canDownloadProof}
                  className="underline disabled:no-underline disabled:opacity-40"
                  style={{ color: canDownloadProof ? 'var(--primary)' : 'var(--muted)' }}
                >
                  Download Proof of a Run
                </button>{' '}
                (after / during a run)
              </li>
            </ul>
            <p className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>
              This demo is a scripted live run (no API keys). Production wires Claude + platform APIs; same handoff
              graph.
            </p>
          </section>
        </div>
      </main>

      <footer
        className="px-4 py-6 text-center text-xs md:px-6"
        style={{ color: 'var(--muted)', borderTop: '1px solid var(--line)' }}
      >
        Vigil · Accel AI Innovate London · Built for the Long Running Agents challenge
      </footer>
    </div>
  );
}
