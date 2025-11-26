import React, { useEffect, useRef } from "react";



const BASE_THEMED_ICONS = [
  <svg key="i1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"><rect x="2" y="7" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="11" x2="6.01" y2="11"/></svg>,
  <svg key="i2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>,
  <svg key="i3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  <svg key="i4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.82.68a.93.93 0 0 1-.94 1.4L18.4 19a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.04-.63c-.4-.1-.7-.3-1-.5s-.6-.4-1.1-.5h-2.1c-.5.1-.8.2-1.1.5s-.6.4-1.1.5c-.4.1-1.3.1-1.8.3a1.65 1.65 0 0 0-1.82.33l-1.04.68a.93.93 0 0 1-.94-1.4l.82-.68a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-.63-1.04c-.1-.4-.3-.7-.5-1s-.4-.6-.5-1.1v-2.1c.1-.5.2-.8.5-1.1s.4-.6.5-1.1c.1-.4.1-1.3.3-1.8a1.65 1.65 0 0 0-.33-1.82l-.82-.68a.93.93 0 0 1 .94-1.4l1.04.68c.5.3.8.4 1.1.5s.6.4 1.1.5h2.1c.5-.1.8-.2 1.1-.5s.6-.4 1.1-.5c.4-.1 1.3-.1 1.8-.3a1.65 1.65 0 0 0 1.82.33l1.04.68a.93.93 0 0 1 .94 1.4l-.82.68a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 .63 1.04c.1.4.3.7.5 1s.4.6.5 1.1v2.1c-.1.5-.2.8-.5 1.1s-.4.6-.5 1.1z"/></svg>,
  <svg key="i5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  <svg key="i6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"><polyline points="21 15 21 21 3 21 3 3 9 3"/><line x1="7" y1="17" x2="17" y2="7"/></svg>,
  <svg key="i7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
];

function makePlaceholderIcon(n) {
  return (
    <svg key={`ph-${n}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <text x="12" y="15" textAnchor="middle" fontSize="9" fill="currentColor">{String(n)}</text>
    </svg>
  );
}

export default function Task_1({
  count = 10,
  icons: userIcons,
  arcStartOffset = 0.14,
  initialDurationMs = 800,
}) {
  const n = Math.max(1, Math.min(10, Math.floor(count || 10)));
  const icons = [];
  if (userIcons && userIcons.length) {
    for (let i = 0; i < n; i++) icons.push(userIcons[i % userIcons.length]);
  } else {
    for (let i = 0; i < n; i++) {
      icons.push(i < BASE_THEMED_ICONS.length ? BASE_THEMED_ICONS[i] : makePlaceholderIcon(i + 1));
    }
  }

  const sectionRef = useRef(null);
  const svgWrapRef = useRef(null);
  const wrapRef = useRef(null);
  const pathRef = useRef(null);
  const pillRefs = useRef([]);
  const belowRef = useRef(null);

  const BASE_WIDTH = 1400;
  const VIEW_W = BASE_WIDTH;
  const R = Math.round(VIEW_W * 0.58);
  const heightScale = 0.48;
  const VIEW_H = Math.max(110, Math.round(R * heightScale));

  const state = useRef({
    current: 0,
    target: 0,
    smoothing: 0.14,
    rafId: null,
    visible: false,
  });

  const DRAW_START_PCT = 0.12;
  const lerp = (a, b, t) => a + (b - a) * t;

  const MANUAL_T_POSITIONS = {
    10: [0.01, 0.09, 0.18, 0.30, 0.42, 0.54, 0.66, 0.78, 0.90, 0.99],
    7: [0.02, 0.18, 0.33, 0.50, 0.67, 0.82, 0.98],
    5: [0.03, 0.28, 0.50, 0.72, 0.97],
    default: Array.from({ length: n }, (_, i) => (n === 1 ? 0.5 : i / (n - 1))),
  };

  const PREMIUM_ACCENTS = ['#D4AF37','#06B6D4','#8B5CF6','#F97316','#60A5FA','#10B981','#F472B6','#FBCFE8','#A78BFA','#34D399'];
  const TARGET_VISIBLE = Math.min(n, 8);

  function arcPath(inset = 0) {
    const cx = VIEW_W / 2;
    const cy = R;
    const r = Math.min(VIEW_W * 0.58, R * 1.05) - inset;
    const start = 220;
    const end = -40;
    const sx = cx + r * Math.cos((start * Math.PI) / 180);
    const sy = cy + r * Math.sin((start * Math.PI) / 180);
    const ex = cx + r * Math.cos((end * Math.PI) / 180);
    const ey = cy + r * Math.sin((end * Math.PI) / 180);
    return { cx, cy, r, sx, sy, ex, ey, pathData: `M ${sx} ${sy} A ${r} ${r} 0 0 1 ${ex} ${ey}` };
  }
  const arcPaths = [arcPath(0), arcPath(36), arcPath(72)];

  useEffect(() => {
    function layout() {
      const wrap = wrapRef.current;
      const svgWrap = svgWrapRef.current;
      const path = pathRef.current;
      if (!wrap || !svgWrap || !path) return;

      const wrapRect = wrap.getBoundingClientRect();
      const svgEl = svgWrap.querySelector('svg');
      if (!svgEl) return;
      const svgRect = svgEl.getBoundingClientRect();
      const totalLen = path.getTotalLength();
      const tPositions = MANUAL_T_POSITIONS[n] || MANUAL_T_POSITIONS.default;
      const scaleX = svgRect.width / VIEW_W;
      const scaleY = svgRect.height / R;

      for (let i = 0; i < n; i++) {
        const el = pillRefs.current[i];
        if (!el) continue;
        const t = tPositions[i];
        const pt = path.getPointAtLength(totalLen * t);
        const px = (pt.x * scaleX) + (svgRect.left - wrapRect.left);
        const py = (pt.y * scaleY) + (svgRect.top - wrapRect.top);
        el.style.left = `${px}px`;
        el.style.top = `${py}px`;

        const ahead = Math.min(totalLen, totalLen * t + 1);
        const ptAhead = path.getPointAtLength(ahead);
        const dx = (ptAhead.x - pt.x) * scaleX;
        const dy = (ptAhead.y - pt.y) * scaleY;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        el.style.setProperty('--rotate', `${angle}deg`);
        el.dataset.t = String(t);
      }

      if (belowRef.current) {
        const centerX = wrapRect.width / 2;
        const centerY = wrapRect.height / 2;
        const el = belowRef.current;
        el.style.position = "absolute";
        el.style.left = `${centerX}px`;
        el.style.top = `${centerY}px`;
        el.style.transform = "translate(-50%, -50%)";
        el.style.zIndex = 22;
      }
    }

    layout();
    window.addEventListener('resize', layout, { passive: true });
    const ro = new ResizeObserver(layout);
    if (svgWrapRef.current) ro.observe(svgWrapRef.current);

    return () => {
      window.removeEventListener('resize', layout);
      ro.disconnect();
    };
  }, [n]);

  function revealIconsByT(tCenter, drawnLen = Infinity) {
    const path = pathRef.current;
    if (!path) return;
    const totalLen = path.getTotalLength();
    const tPositions = MANUAL_T_POSITIONS[n] || MANUAL_T_POSITIONS.default;

    const distances = tPositions.map((t,i) => ({ i, d: Math.abs(t - tCenter), t }));
    distances.sort((a,b) => a.d - b.d);
    const toShow = new Set(distances.slice(0, TARGET_VISIBLE).map(x => x.i));

    for (let i = 0; i < n; i++) {
      const t = tPositions[i];
      const thresholdLen = totalLen * t;
      const withinArc = thresholdLen <= (drawnLen + 1.5);
      const pill = pillRefs.current[i];
      if (!pill) continue;
      const pop = pill.querySelector('.pop');
      if (!pop) continue;
      if (withinArc && toShow.has(i)) pop.classList.add('pop-in');
      else pop.classList.remove('pop-in');
    }
  }

  function animateErase(duration = 600, stagger = 70) {
    const path = pathRef.current;
    if (!path) return;
    const totalLen = path.getTotalLength();
    const current = parseFloat(getComputedStyle(path).strokeDashoffset || path.style.strokeDashoffset || totalLen) || totalLen;
    const startTime = performance.now();
    function step(ts) {
      const p = Math.min(1, (ts - startTime) / Math.max(1, duration));
      const ease = 1 - (1 - p) * (1 - p);
      path.style.strokeDashoffset = `${current + (totalLen - current) * ease}`;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    const visible = [];
    for (let i=0;i<n;i++) {
      const pill = pillRefs.current[i];
      if (!pill) continue;
      const pop = pill.querySelector('.pop');
      if (pop && pop.classList.contains('pop-in')) visible.push(i);
    }
    visible.sort((a,b) => Math.abs((parseFloat(pillRefs.current[a].dataset.t)||0.5)-0.5) - Math.abs((parseFloat(pillRefs.current[b].dataset.t)||0.5)-0.5));
    visible.forEach((idx, ii) => {
      setTimeout(()=> {
        const pill = pillRefs.current[idx];
        if (!pill) return;
        const pop = pill.querySelector('.pop'); if (pop) pop.classList.remove('pop-in');
      }, ii * stagger);
    });
  }

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const totalLen = path.getTotalLength();
    path.style.strokeDasharray = `${totalLen}`;
    path.style.strokeDashoffset = `${totalLen}`;
  }, [n]);

  useEffect(() => {
    const section = sectionRef.current;
    const path = pathRef.current;
    if (!section || !path) return;
    const s = state.current;
    const totalLen = path.getTotalLength();

    function computeRawFromRect(rect) {
      if (rect.bottom <= window.innerHeight) {
        return 1;
      }
      const denom = window.innerHeight + rect.height;
      if (denom <= 0) return 0;
      const raw = (window.innerHeight - rect.top) / denom;
      return Math.max(0, Math.min(1, raw));
    }

    function computeCenterTFromRaw(raw) {
      const tPositions = MANUAL_T_POSITIONS[n] || MANUAL_T_POSITIONS.default;
      const tMin = Math.min(...tPositions);
      const tMax = Math.max(...tPositions);
      return tMin + raw * (tMax - tMin);
    }

    function onScroll() {
      const rect = section.getBoundingClientRect();

      if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
        s.target = 0;
        animateErase(550, 60);
        return;
      }

      if (rect.bottom <= window.innerHeight) {
        s.target = 1;
        return;
      }

      const raw = computeRawFromRect(rect);
      s.target = Math.max(0, Math.min(1, raw));
    }

    function intersectionCb(entries) {
      const e = entries[0];
      if (!e) return;
      const svgWrap = svgWrapRef.current;
      const wrap = wrapRef.current;
      if (e.isIntersecting) {
        if (svgWrap) {
          svgWrap.style.opacity = '1';
        }
        if (wrap) {
          wrap.style.opacity = '1';
        }
      } else {
        if (svgWrap) {
          svgWrap.style.opacity = '0';
        }
        if (wrap) {
          wrap.style.opacity = '0';
        }
      }
    }

    const io = new IntersectionObserver(intersectionCb, { threshold: [0.01] });
    io.observe(section);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchmove', onScroll, { passive: true });

    onScroll();

    function loop() {
      s.current = lerp(s.current, s.target, state.current.smoothing);
      const arcProgress = DRAW_START_PCT + s.current * (1 - DRAW_START_PCT);
      const drawnLen = totalLen * arcProgress;
      path.style.strokeDashoffset = `${Math.max(0, totalLen - drawnLen)}`;

      const rect = section.getBoundingClientRect();
      const raw = computeRawFromRect(rect);
      const tCenter = computeCenterTFromRaw(raw);
      revealIconsByT(tCenter, drawnLen);

      const translate = (1 - s.current) * 12;
      const opacity = 0.2 + s.current * 0.8;
      const svgWrap = svgWrapRef.current;
      const wrap = wrapRef.current;
      if (svgWrap) {
        svgWrap.style.transform = `translateX(-50%) translateY(${translate}px)`;
        svgWrap.style.opacity = `${opacity}`;
      }
      if (wrap) {
        wrap.style.transform = `translateY(${translate}px)`;
        wrap.style.opacity = `${opacity}`;
      }

      state.current.rafId = requestAnimationFrame(loop);
    }

    state.current.rafId = requestAnimationFrame(loop);

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchmove', onScroll);
      if (state.current.rafId) cancelAnimationFrame(state.current.rafId);
    };
  }, [n]);

  const css = `
  :root { --wrap-w: ${VIEW_W}px; --wrap-h: ${VIEW_H}px; --pill: 76px; --pill-sm: 56px; --arc-start-offset: ${arcStartOffset}; }
  .arc-cursor { padding: 16px 18px 16px; background: linear-gradient(180deg, #041226 0%, #061428 40%, #071730 100%); border-radius: 14px; overflow: visible; box-shadow: 0 20px 80px rgba(2,6,23,0.45); color: #EAF6FF; }
  .inner { max-width: ${VIEW_W}px; margin:0 auto; text-align:center; position:relative; }
  .visual { height:var(--wrap-h); position:relative; display:flex; align-items:flex-start; justify-content:center; pointer-events:none; }
  .svg-wrap { position:absolute; left:50%; width:var(--wrap-w); height:${R}px; transform: translateX(-50%) translateY(0); transition: opacity 240ms ease, transform 300ms ease; z-index:2; opacity:0; pointer-events:none; }
  .wrap { width:var(--wrap-w); height:var(--wrap-h); margin:0 auto; position:relative; transform: translateY(0); transition: opacity 240ms ease, transform 300ms ease; z-index:6; opacity:0; pointer-events:none; overflow:visible; }
  .below { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); text-align:center; pointer-events:auto; z-index: 20; opacity: 1; max-width: 78%; margin: 0 auto; }
  svg.arcs { width:100%; height:${R}px; overflow:visible; display:block; }
  svg.arcs .arc { fill:none; stroke: rgba(255,255,255,0.12); stroke-width:4.5; stroke-linecap:round; stroke-linejoin:round; filter: drop-shadow(0 12px 44px rgba(6,12,28,0.7)); }
  svg.arcs .a2 { stroke: rgba(255,255,255,0.06); stroke-width:3.2; opacity:0.95; }
  svg.arcs .a3 { stroke: rgba(255,255,255,0.03); stroke-width:2.0; opacity:0.9; }

  .pill { position:absolute; width:var(--pill); height:var(--pill); border-radius:50%; display:flex; align-items:center; justify-content:center; background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 40px rgba(2,6,23,0.55), inset 0 1px 0 rgba(255,255,255,0.02); transform: translate(-50%,-50%) rotate(var(--rotate,0deg)); z-index:8; transition: transform 260ms cubic-bezier(.2,.9,.3,1), box-shadow 180ms; backdrop-filter: blur(6px); pointer-events:auto; font-size:0; }
  .pill.small { width:var(--pill-sm); height:var(--pill-sm); }
  .pill .pop { width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center; transform: translateY(30px) scale(.9); opacity:0; transition: transform 420ms cubic-bezier(.2,1,.3,1), opacity 360ms cubic-bezier(.2,1,.3,1); will-change: transform, opacity; }
  .pill .pop.pop-in { transform: translateY(0) scale(1); opacity:1; }
  .glyph { width:28px; height:28px; display:block; color:var(--glyph-color, #D4AF37); filter: drop-shadow(0 8px 20px rgba(0,0,0,0.6)); }
  .sub { color: #BFD7FF; font-size:11px; margin-bottom:6px; font-weight:700; text-transform:uppercase; letter-spacing:1px; }
  .title { font-size:20px; font-weight:900; margin:6px 0 8px; color: #EAF6FF; letter-spacing:-0.6px; text-shadow: 0 8px 20px rgba(6,12,28,0.6); }
  .cta { display:inline-block; padding:8px 18px; border-radius:14px; background: linear-gradient(90deg,#D4AF37,#FBBF24 60%); color:#081427; box-shadow: 0 12px 36px rgba(212,175,55,0.16), 0 6px 16px rgba(7,20,40,0.44) inset; text-decoration:none; font-weight:800; }
  @media (max-width:1100px){ :root{ --wrap-w: 900px; } .title{ font-size:18px; } }
  @media (max-width:760px){ :root{ --wrap-w: 640px; } .title{ font-size:16px; } }
  @media (max-width:420px){ :root{ --wrap-w: 360px; } .title{ font-size:14px; } }
  @media (prefers-reduced-motion: reduce) { .pill, .pill .pop, .svg-wrap, .wrap, .below { transition: none !important; animation: none !important; } }
  `;

  return (
    <section className="arc-cursor" ref={sectionRef} aria-label="Integrations arc visualization">
      <style>{css}</style>
      <div className="inner">
        <div className="visual">
          <div className="svg-wrap" ref={svgWrapRef} aria-hidden>
            <svg className="arcs" viewBox={`0 0 ${VIEW_W} ${R}`} preserveAspectRatio="xMidYMid slice">
              <path ref={pathRef} className="arc" d={arcPaths[0].pathData} />
              <path className="arc a2" d={arcPaths[1].pathData} />
              <path className="arc a3" d={arcPaths[2].pathData} />
            </svg>
          </div>

          <div className="wrap" ref={wrapRef}>
            {icons.map((ic, i) => {
              const accent = PREMIUM_ACCENTS[i % PREMIUM_ACCENTS.length];
              const glow = accent + '22';
              return (
                <div
                  key={i}
                  ref={(el) => (pillRefs.current[i] = el)}
                  className={`pill ${i % 3 === 0 ? 'small' : ''}`}
                  data-accent
                  style={{ ['--accent-glow']: glow, ['--glyph-color']: accent }}
                  aria-hidden
                >
                  <div className="pop">
                    <div className="glyph" aria-hidden>
                      {React.isValidElement(ic)
                        ? React.cloneElement(ic, { width: 28, height: 28, style: { display: 'block', color: 'currentColor' } })
                        : <span>{ic}</span>}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="below" ref={belowRef} aria-hidden={false}>
              <div className="sub">Integration Ecosystem</div>
              <h2 className="title">Seamless Integrations</h2>
              <a className="cta" href="#contact">Talk to sales</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
