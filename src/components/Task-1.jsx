import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function Task_1({
  icons = null,
  radius = 380,
  pxPerIcon = 140,
  padding = 48,
  stickyOffset = 120,
  centerLabel = "Integration",
  premium = true,
  compact = true,
  heightMultiplier = 1.0,
  safeTopInset = 18,
  onTimelineActiveChange,
  centerOffset = -18,
}) {
  const rootRef = useRef(null);
  const pinRef = useRef(null);
  const spacerRef = useRef(null);
  const svgRef = useRef(null);
  const rafRef = useRef(null);
  const resizeObserverRef = useRef(null);

  const activeStateRef = useRef(null);
  const virtualConsumedRef = useRef(0);
  const lastTouchYRef = useRef(0);
  const animatedPathsRef = useRef(new Set());
  const prevShowCountRef = useRef(0);
  const lastSvgSizeRef = useRef({ w: 0, std: 0 });

  const [isMobile, setIsMobile] = useState(false);
  const [lineSegments, setLineSegments] = useState([]); // pairwise segments i -> i+1
  const [flowReadyTick, setFlowReadyTick] = useState(0); // used to retrigger tick after layout

  const demo = [
    { id: "a", src: "https://cdn-icons-png.flaticon.com/512/5968/5968254.png", alt: "Google" },
    { id: "b", src: "https://cdn-icons-png.flaticon.com/512/732/732200.png", alt: "Slack" },
    { id: "c", src: "https://cdn-icons-png.flaticon.com/512/5968/5968863.png", alt: "Figma" },
    { id: "d", src: "https://cdn-icons-png.flaticon.com/512/5968/5968520.png", alt: "Notion" },
    { id: "e", src: "https://cdn-icons-png.flaticon.com/512/5968/5968517.png", alt: "GitHub" },
    { id: "f", src: "https://cdn-icons-png.flaticon.com/512/5968/5968381.png", alt: "Meta" },
    { id: "g", src: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png", alt: "YouTube" },
    { id: "h", src: "https://cdn-icons-png.flaticon.com/512/5968/5968292.png", alt: "Instagram" },
    { id: "i", src: "https://cdn-icons-png.flaticon.com/512/733/733579.png", alt: "Twitter" },
    { id: "j", src: "https://cdn-icons-png.flaticon.com/512/3536/3536505.png", alt: "LinkedIn" },
    { id: "k", src: "https://cdn-icons-png.flaticon.com/512/888/888879.png", alt: "Stripe" },
    { id: "l", src: "https://cdn-icons-png.flaticon.com/512/5968/5968557.png", alt: "Dropbox" }
  ];

  const list = (icons && icons.length) ? icons : demo;
  const COUNT = list.length;
  const revealDistance = COUNT * pxPerIcon;

  const visualHeightRaw = Math.round((radius + padding * 2) * heightMultiplier * (compact ? 0.85 : 1));
  const visualHeight = Math.max(220, visualHeightRaw);

  function sizeScaleForWidth(width) {
    if (width >= 1200) return 1.0;
    if (width >= 900) return 0.95;
    if (width >= 640) return 0.88;
    return 0.78;
  }

  const styles = {
    root: {
      position: 'relative',
      height: `${visualHeight}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
      margin: '40px 0',
      color: 'white',
      paddingTop: '18px'
    },
    backdrop: premium ? {
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      pointerEvents: 'none',
      background: 'linear-gradient(180deg, rgba(14,10,24,0.72), rgba(28,20,45,0.74))',
      boxShadow: 'inset 0 40px 80px rgba(0,0,0,0.55), 0 16px 48px rgba(5,6,15,0.6)',
      borderRadius: '14px',
      border: '1px solid rgba(255,240,200,0.03)'
    } : {},
    sheen: premium ? {
      position: 'absolute',
      left: '-40%',
      top: '-40%',
      width: '200%',
      height: '200%',
      zIndex: 3,
      pointerEvents: 'none',
      background: 'linear-gradient(120deg, rgba(255,255,255,0.02), rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.02) 40%)',
      transform: 'rotate(-14deg)',
      mixBlendMode: 'overlay',
      animation: 'sheenMove 8s linear infinite'
    } : {},
    card: {
      position: 'relative',
      zIndex: 4,
      width: '100%',
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
    },
    pin: {
      position: 'relative',
      width: '100%',
      height: `${Math.round(visualHeight)}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 380ms cubic-bezier(.2,9,2,1), opacity 260ms ease',
      willChange: 'transform, opacity',
    },
    arc: {
      position: 'relative',
      width: '100%',
      height: `${Math.round(visualHeight)}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
    },
    centerBase: {
      position: 'absolute',
      borderRadius: '12px',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
      boxShadow: '0 10px 30px rgba(6,6,18,0.6)',
      border: '1px solid rgba(255,235,170,0.05)',
      color: 'white',
      zIndex: 8,
      backdropFilter: 'blur(6px)',
      textTransform: 'uppercase',
      fontWeight: 800,
      letterSpacing: 0.6,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    arcItemBase: {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
      boxShadow: '0 8px 28px rgba(6,6,20,0.6)',
      border: '1px solid rgba(255,255,255,0.06)',
      transition: 'transform 360ms cubic-bezier(.2,9,2,1), opacity 280ms ease, box-shadow 360ms ease',
      overflow: 'hidden',
      zIndex: 7,
    },
    imgBase: {
      objectFit: 'contain',
      pointerEvents: 'none',
      filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.45))'
    },
    spacer: {
      position: 'relative',
      display: 'block',
      height: `${revealDistance}px`,
      marginTop: `-${revealDistance}px`,
      visibility: 'hidden',
      pointerEvents: 'none',
    }
  };

  // ---------- measurement & SVG sync (useLayoutEffect for reliable DOM sizes) ----------
  useLayoutEffect(() => {
    // recompute function (keeps local scope)
    function recompute() {
      const pin = pinRef.current;
      const rootEl = rootRef.current;
      if (!pin || !rootEl) {
        setLineSegments([]);
        return;
      }

      const rootRect = rootEl.getBoundingClientRect();
      const pinRect = pin.getBoundingClientRect();
      const width = Math.max(200, rootRect.width);
      const scale = sizeScaleForWidth(width);

      const centerDefaultW = compact ? 220 * scale : 260 * scale;
      const centerDefaultH = compact ? 100 * scale : 120 * scale;

      const availableAboveCenter = (pinRect.height / 2) - (centerDefaultH / 2) - safeTopInset;
      const maxAllowedRadiusVertically = Math.max(40, availableAboveCenter);
      const widthCap = Math.max(80, (width / 1200) * radius);

      const effectiveRadius = Math.max(40, Math.min(radius * Math.min(1, width / 1200), maxAllowedRadiusVertically * 0.98, widthCap));

      // position arc items
      const items = Array.from(pin.querySelectorAll('.arc-item'));
      items.forEach((el, i) => {
        const t = COUNT === 1 ? 0.5 : i / (COUNT - 1);
        const angle = Math.PI * (1 - t) * 0.9;

        let x = Math.cos(angle) * effectiveRadius;
        let y = -Math.sin(angle) * effectiveRadius * 0.95;

        const maxTopOffset = maxAllowedRadiusVertically;
        if (-y > maxTopOffset) {
          y = -maxTopOffset;
        }

        const itemSize = compact ? Math.round(64 * scale) : Math.round(72 * scale);

        el.style.width = `${itemSize}px`;
        el.style.height = `${itemSize}px`;
        el.style.left = '50%';
        el.style.top = '50%';
        el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0.92)`;
        el.style.transitionDelay = `${i * 36}ms`;
        el.style.opacity = '0';

        const img = el.querySelector('img');
        if (img) {
          img.style.width = `${Math.round((itemSize * 0.68))}px`;
          img.style.height = `${Math.round((itemSize * 0.68))}px`;
        }
      });

      // center card sizing
      const center = pin.querySelector('.center-card');
      if (center) {
        const cw = Math.round(centerDefaultW);
        const ch = Math.round(centerDefaultH);
        center.style.width = `${cw}px`;
        center.style.height = `${ch}px`;
        center.style.fontSize = `${compact ? Math.round(16 * scale) : 20}px`;
        center.style.borderRadius = `${Math.max(10, Math.round(12 * scale))}px`;
        center.style.transform = `translateY(${centerOffset}px)`;
      }

      // compute icon centers relative to pin
      const pinTop = pinRect.top;
      const pinLeft = pinRect.left;
      const computedItems = Array.from(pin.querySelectorAll('.arc-item'));
      const positions = computedItems.map((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2 - pinLeft;
        const cy = rect.top + rect.height / 2 - pinTop;
        return { x: Math.round(cx), y: Math.round(cy) };
      });

      // update SVG pixel width/height/viewBox to match pin - important for filter coords
      const svgEl = svgRef.current;
      if (svgEl) {
        const w = Math.max(120, Math.round(pinRect.width || 1100));
        const h = Math.max(80, Math.round(pinRect.height || 600));
        svgEl.setAttribute('width', String(w));
        svgEl.setAttribute('height', String(h));
        svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svgEl.style.width = '100%';
        svgEl.style.height = '100%';
        svgEl.style.overflow = 'visible';
      }

      // create simple pairwise line segments (i -> i+1)
      const segments = [];
      for (let i = 0; i < positions.length - 1; i++) {
        const a = positions[i];
        const b = positions[i + 1];
        segments.push({
          id: `seg-${i}`,
          x1: a.x,
          y1: a.y,
          x2: b.x,
          y2: b.y
        });
      }

      setLineSegments(segments);
      // bump tick so other effects see change
      setFlowReadyTick((t) => t + 1);
    }

    // initial recompute synchronously (layout effect -> accurate)
    recompute();

    // observe size changes of root/pin and recompute
    const rootEl = rootRef.current;
    if (rootEl && window.ResizeObserver) {
      resizeObserverRef.current = new ResizeObserver(() => {
        // use rAF to avoid layout thrash
        requestAnimationFrame(recompute);
      });
      resizeObserverRef.current.observe(rootEl);
      // also observe pin
      const pin = pinRef.current;
      if (pin) resizeObserverRef.current.observe(pin);
    }

    // also listen to window resize as fallback
    const onWinResize = () => requestAnimationFrame(recompute);
    window.addEventListener('resize', onWinResize);

    // guard: after images load (icons), recompute once more
    const imgs = pinRef.current ? Array.from(pinRef.current.querySelectorAll('img')) : [];
    let loadedCount = 0;
    const onImgLoad = () => {
      loadedCount++;
      if (loadedCount === imgs.length) requestAnimationFrame(recompute);
    };
    imgs.forEach((im) => im.addEventListener('load', onImgLoad));

    return () => {
      if (resizeObserverRef.current && rootEl) resizeObserverRef.current.disconnect();
      window.removeEventListener('resize', onWinResize);
      imgs.forEach((im) => im.removeEventListener('load', onImgLoad));
    };
    // we intentionally depend on COUNT, compact, radius and centerOffset so recompute runs when props change
  }, [COUNT, compact, radius, padding, safeTopInset, centerOffset]);

  // spacer height sync
  useEffect(() => {
    virtualConsumedRef.current = 0;
    const spacer = spacerRef.current;
    if (!spacer) return;
    spacer.style.height = `${revealDistance}px`;
    spacer.style.marginTop = `-${revealDistance}px`;
  }, [revealDistance]);

  // isMobile detection
  useEffect(() => {
    const check = () => { if (typeof window !== "undefined") setIsMobile(window.innerWidth < 768); };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // helpers for animating lines (works with <line>)
  function getPathElById(id) {
    const svg = svgRef.current;
    if (!svg || !id) return null;
    // lines live inside svg; query there
    return svg.querySelector(`#${CSS.escape ? CSS.escape(id) : id}`);
  }

  function animatePathOnce(pathEl, duration = 700) {
    if (!pathEl) return;
    const pid = pathEl.id;
    if (!pid) return;
    if (animatedPathsRef.current.has(pid)) return; // already drawn

    let len;
    try { len = pathEl.getTotalLength(); } catch (e) { len = 600; }
    pathEl.style.strokeDasharray = `${len}`;
    pathEl.style.strokeDashoffset = `${len}`;
    pathEl.style.opacity = '0';
    pathEl.getBoundingClientRect();

    pathEl.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(.22,.9,.36,1), opacity ${Math.min(220, Math.round(duration/6))}ms ease-out`;
    requestAnimationFrame(() => {
      pathEl.style.strokeDashoffset = '0';
      pathEl.style.opacity = '1';
    });

    const tidy = () => {
      pathEl.style.transition = '';
      pathEl.style.strokeDashoffset = '0';
      animatedPathsRef.current.add(pid);
      pathEl.removeEventListener('transitionend', tidy);
    };
    pathEl.addEventListener('transitionend', tidy);
  }

  function animatePathRemoveOnce(pathEl, duration = 520) {
    if (!pathEl) return;
    const pid = pathEl.id;
    if (!pid) return;

    let len;
    try { len = pathEl.getTotalLength(); } catch (e) { len = 600; }

    pathEl.style.strokeDasharray = `${len}`;
    pathEl.style.strokeDashoffset = `0`;
    pathEl.style.opacity = '1';
    pathEl.getBoundingClientRect();

    pathEl.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(.2,.6,.2,1), opacity ${Math.min(200, Math.round(duration/6))}ms ease`;
    requestAnimationFrame(() => {
      pathEl.style.strokeDashoffset = `${len}`;
      pathEl.style.opacity = '0';
    });

    const tidy = () => {
      pathEl.style.transition = '';
      pathEl.style.strokeDasharray = '';
      pathEl.style.strokeDashoffset = '';
      animatedPathsRef.current.delete(pid);
      pathEl.removeEventListener('transitionend', tidy);
    };
    pathEl.addEventListener('transitionend', tidy);
  }

  // main tick: show icons progressively and animate lines between visible icons
  useEffect(() => {
    if (isMobile) return undefined;

    function tick() {
      const root = rootRef.current;
      const pin = pinRef.current;
      const spacer = spacerRef.current;
      if (!root || !pin || !spacer) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const stickyTopPx = stickyOffset;
      const rootTopPage = root.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
      const startRevealScroll = Math.max(0, rootTopPage - stickyTopPx);
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

      let consumed = 0;
      let isVisuallyPinned = false;

      if (document.body.style.overflow === 'hidden') {
        consumed = virtualConsumedRef.current;
        isVisuallyPinned = consumed > 0 && consumed < revealDistance;
      } else {
        let rawConsumed = scrollY - startRevealScroll;
        if (rawConsumed > revealDistance) consumed = revealDistance;
        else consumed = Math.min(Math.max(rawConsumed, 0), revealDistance);
        isVisuallyPinned = consumed > 0 && consumed < revealDistance;
        virtualConsumedRef.current = consumed;
      }

      const progress = revealDistance > 0 ? consumed / revealDistance : 0;
      const showCount = Math.floor(progress * COUNT);
      const shouldLockScroll = isVisuallyPinned;
      const wasActive = activeStateRef.current !== null;

      if (typeof onTimelineActiveChange === 'function' && shouldLockScroll !== wasActive) {
        onTimelineActiveChange(shouldLockScroll);
        if (!shouldLockScroll && (consumed <= 0 || consumed >= revealDistance)) {
          const target = (consumed >= revealDistance) ? rootTopPage + spacer.offsetHeight : Math.max(0, startRevealScroll - 1);
          requestAnimationFrame(() => window.scrollTo({ top: target, behavior: 'auto' }));
        }
      }

      // animate icons in/out
      const items = pin.querySelectorAll('.arc-item');
      items.forEach((el, idx) => {
        const baseTransform = el.style.transform.replace(/\s*scale\([^)]+\)/, '');
        if (idx < showCount) {
          el.style.opacity = '1';
          el.style.transform = `${baseTransform} scale(1)`;
          el.style.boxShadow = '0 22px 70px rgba(10,8,30,0.6)';
        } else {
          el.style.opacity = '0';
          el.style.transform = `${baseTransform} scale(0.92)`;
          el.style.boxShadow = '0 8px 30px rgba(10,8,20,0.45)';
        }
      });

      const prev = prevShowCountRef.current || 0;

      // animate lines when icons appear/disappear
      if (showCount > prev) {
        for (let k = prev; k < showCount; k++) {
          const segIndex = k - 1;
          if (segIndex >= 0 && segIndex < lineSegments.length) {
            const sid = lineSegments[segIndex].id;
            const segEl = getPathElById(sid);
            if (segEl && !animatedPathsRef.current.has(sid)) {
              const dur = 420 + Math.min(500, Math.round(segIndex * 20));
              segEl.style.opacity = '0';
              animatePathOnce(segEl, dur);
            }
          }
        }
      } else if (showCount < prev) {
        for (let k = Math.max(1, showCount); k <= prev - 1; k++) {
          const segIndex = k - 1;
          if (segIndex >= 0 && segIndex < lineSegments.length) {
            const sid = lineSegments[segIndex].id;
            const segEl = getPathElById(sid);
            if (segEl && animatedPathsRef.current.has(sid)) {
              const dur = 360 + Math.min(420, Math.round(segIndex * 18));
              animatePathRemoveOnce(segEl, dur);
            } else if (segEl) {
              segEl.style.opacity = '0';
              animatedPathsRef.current.delete(sid);
            }
          }
        }
      }

      prevShowCountRef.current = showCount;

      // pin positioning (unchanged)
      if (isVisuallyPinned) {
        if (activeStateRef.current === null) {
          const rootRect = root.getBoundingClientRect();
          pin.style.position = 'fixed';
          pin.style.left = `${rootRect.left}px`;
          pin.style.width = `${rootRect.width}px`;
          pin.style.top = `${stickyOffset}px`;
          pin.style.zIndex = 9999;
          pin.style.pointerEvents = 'none';
          pin.style.opacity = '1';
          activeStateRef.current = stickyOffset;
        }
      } else {
        if (activeStateRef.current !== null) {
          pin.style.opacity = '0';
          activeStateRef.current = null;
          setTimeout(() => {
            pin.style.position = '';
            pin.style.left = '';
            pin.style.width = '';
            pin.style.top = '';
            pin.style.zIndex = '';
            pin.style.pointerEvents = '';
            pin.style.opacity = '';
          }, 60);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    // start tick
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // include flowReadyTick so we re-start tick after layout recompute
  }, [COUNT, revealDistance, stickyOffset, onTimelineActiveChange, safeTopInset, centerOffset, lineSegments, isMobile, flowReadyTick]);

  // body scroll locking handlers (unchanged)
  useEffect(() => {
    if (isMobile) return undefined;

    const handleScrollEvent = (e) => {
      if (document.body.style.overflow === 'hidden') {
        if (e.cancelable) e.preventDefault();
        let deltaY = 0;
        if (e.type === 'wheel') deltaY = e.deltaY;
        else if (e.type === 'touchmove' && e.touches.length > 0) {
          const lastY = lastTouchYRef.current;
          const currentY = e.touches[0].clientY;
          if (currentY > lastY) deltaY = -15; else if (currentY < lastY) deltaY = 15;
          lastTouchYRef.current = currentY;
        } else if (e.type === 'touchstart' && e.touches.length > 0) {
          lastTouchYRef.current = e.touches[0].clientY; return;
        }
        const sensitivity = 1;
        const newConsumed = virtualConsumedRef.current + deltaY * sensitivity;
        virtualConsumedRef.current = Math.max(0, Math.min(revealDistance, newConsumed));
      }
    };

    window.addEventListener('wheel', handleScrollEvent, { passive: false });
    window.addEventListener('touchstart', handleScrollEvent, { passive: false });
    window.addEventListener('touchmove', handleScrollEvent, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleScrollEvent);
      window.removeEventListener('touchstart', handleScrollEvent);
      window.removeEventListener('touchmove', handleScrollEvent);
    };
  }, [revealDistance, isMobile]);

  // tune svg filter and stroke widths when segments update
  useEffect(() => {
    const svgEl = svgRef.current;
    const pin = pinRef.current;
    if (!svgEl || !pin) return;

    const w = Math.max(120, Math.round(pin.clientWidth));
    const stdDev = Math.max(1, Math.round(w / 320)); // milder blur for straight lines

    if (lastSvgSizeRef.current.w === w && lastSvgSizeRef.current.std === stdDev) return;
    lastSvgSizeRef.current = { w, std: stdDev };

    const fe = svgEl.querySelector('feGaussianBlur');
    if (fe) fe.setAttribute('stdDeviation', String(stdDev));

    const primaryLines = svgEl.querySelectorAll('.integration-connection-line:not(.bg)');
    primaryLines.forEach((p) => {
      p.style.strokeWidth = `${Math.max(1.0, (w / 1100) * 2.2)}px`;
    });
    const bgLines = svgEl.querySelectorAll('.integration-connection-line.bg');
    bgLines.forEach((p) => {
      p.style.strokeWidth = `${Math.max(2.2, (w / 1100) * 3.8)}px`;
    });

    // ensure positions are up-to-date one more time
    requestAnimationFrame(() => {
      // trigger layout recompute via state (safe)
      setFlowReadyTick((t) => t + 1);
    });
  }, [lineSegments]);

  // ---------- RENDER ----------
  if (isMobile) {
    // simplified mobile layout (unchanged)
    const mobileIcons = list.slice();
    const n = mobileIcons.length;
    const spacingFactor = 12;
    const suggested = Math.max(80, Math.round(n * spacingFactor));
    const arcRadius = Math.min(170, suggested);
    const arcHeight = arcRadius + 40;
    const centerCardHeight = 52;
    const itemSize = 40;
    const imgSize = Math.round(itemSize * 0.72);

    function getTransformForIndex(i) {
      if (n === 1) {
        const x = 0;
        const y = -arcRadius;
        return `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      }
      const step = 180 / (n - 1);
      const angleDeg = 180 - (i * step);
      const rad = angleDeg * (Math.PI / 180);
      const x = Math.cos(rad) * arcRadius;
      const y = -Math.sin(rad) * arcRadius;
      return `translate(calc(-50% + ${Math.round(x)}px), calc(-50% + ${Math.round(y)}px))`;
    }

    const mobileRootStyle = {
      position: 'relative',
      padding: 12,
      textAlign: 'center',
      width: '100%',
      boxSizing: 'border-box',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
    };

    const arcWrapperStyle = {
      position: 'relative',
      width: '100%',
      maxWidth: 420,
      height: `${arcHeight}px`,
      boxSizing: 'border-box',
      marginBottom: 6,
      overflow: 'visible',
    };

    const centerCardStyle = {
      height: centerCardHeight,
      minWidth: 140,
      padding: '8px 14px',
      borderRadius: 12,
      background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
      border: '1px solid rgba(255,255,255,0.06)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      zIndex: 4,
      boxShadow: '0 8px 20px rgba(0,0,0,0.35)'
    };

    const itemBaseStyle = {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: `${itemSize}px`,
      height: `${itemSize}px`,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 6px 14px rgba(0,0,0,0.35)',
      transform: 'translate(-50%,-50%)',
      zIndex: 5,
    };

    return (
      <div ref={rootRef} style={mobileRootStyle} aria-label="Integrations mobile semicircle all icons">
        {premium && <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(14,10,24,0.72), rgba(28,20,45,0.74))', borderRadius: 12 }} aria-hidden />}

        <div style={arcWrapperStyle}>
          {mobileIcons.map((icon, i) => (
            <div
              key={icon.id ?? i}
              className="arc-mobile-item"
              style={{
                ...itemBaseStyle,
                width: `${itemSize}px`,
                height: `${itemSize}px`,
                transform: getTransformForIndex(i),
                transition: 'transform 220ms ease, opacity 160ms ease',
                opacity: 1,
              }}
              aria-hidden
            >
              <img src={icon.src} alt={icon.alt ?? `icon ${i + 1}`} style={{ width: imgSize, height: imgSize, objectFit: 'contain' }} draggable={false} />
            </div>
          ))}
        </div>

        <div style={centerCardStyle}>
          {centerLabel}
        </div>
      </div>
    );
  }

  // desktop: pairwise lines
  return (
    <div ref={rootRef} style={styles.root} aria-label="Integrations premium compact">
      <style>{`
        @keyframes sheenMove {
          0% { transform: translateX(-30%) rotate(-14deg); }
          50% { transform: translateX(30%) rotate(-14deg); }
          100% { transform: translateX(-30%) rotate(-14deg); }
        }

        .integration-connection-svg {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 5;
        }

        .integration-connection-line {
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke: url(#grad-arc);
          fill: none;
          opacity: 0;
        }

        .integration-connection-line.bg {
          opacity: 0.06;
          filter: blur(3px);
        }

        .arc-item img { pointer-events: none; user-select: none; -webkit-user-drag: none; }
      `}</style>

      {premium && <div style={styles.backdrop} aria-hidden />}
      {premium && <div style={styles.sheen} aria-hidden />}

      <div style={styles.card}>
        <div ref={pinRef} style={styles.pin}>
          <div style={styles.arc} aria-hidden>
            <svg
              ref={svgRef}
              className="integration-connection-svg"
              viewBox={`0 0 1100 600`}
              preserveAspectRatio="xMinYMin meet"
              aria-hidden
              style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5, overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="grad-arc" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9ec6ff" stopOpacity="1" />
                  <stop offset="50%" stopColor="#5bb0ff" stopOpacity="1" />
                  <stop offset="100%" stopColor="#66d0ff" stopOpacity="1" />
                </linearGradient>

                <filter id="glow" x="-60%" y="-60%" width="220%" height="220%" filterUnits="userSpaceOnUse">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* background faint lines */}
              {lineSegments.map((s) => (
                <line
                  key={`${s.id}-bg`}
                  id={`${s.id}-bg`}
                  x1={s.x1}
                  y1={s.y1}
                  x2={s.x2}
                  y2={s.y2}
                  className="integration-connection-line bg"
                  style={{
                    stroke: 'url(#grad-arc)',
                    vectorEffect: 'non-scaling-stroke',
                    strokeWidth: Math.max(2.2, (pinRef.current ? (pinRef.current.clientWidth / 1100) * 3.6 : 3)),
                    opacity: 0.06
                  }}
                />
              ))}

              {/* primary animated lines */}
              {lineSegments.map((s) => (
                <line
                  key={s.id}
                  id={s.id}
                  x1={s.x1}
                  y1={s.y1}
                  x2={s.x2}
                  y2={s.y2}
                  className="integration-connection-line"
                  style={{
                    filter: 'url(#glow)',
                    stroke: 'url(#grad-arc)',
                    strokeWidth: Math.max(1.0, (pinRef.current ? (pinRef.current.clientWidth / 1100) * 2.2 : 2.2)),
                    opacity: 0,
                    vectorEffect: 'non-scaling-stroke'
                  }}
                />
              ))}
            </svg>

            {/* icon items */}
            {list.map((icon, i) => (
              <div
                key={icon.id ?? i}
                className="arc-item"
                style={{
                  ...styles.arcItemBase,
                  width: compact ? 64 : 72,
                  height: compact ? 64 : 72,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%,-50%) scale(0.92)',
                  opacity: 0,
                }}
                aria-hidden
              >
                <img src={icon.src} alt={icon.alt ?? `icon ${i + 1}`} style={{ ...styles.imgBase, width: compact ? 44 : 48, height: compact ? 44 : 48 }} draggable={false} />
              </div>
            ))}

            {/* center card */}
            <div className="center-card" style={{
              ...styles.centerBase,
              width: compact ? 220 : 260,
              height: compact ? 100 : 120,
              fontSize: compact ? 16 : 20,
              transform: `translateY(${centerOffset}px)`
            }}>
              {centerLabel}
            </div>
          </div>
        </div>
      </div>

      <div ref={spacerRef} style={styles.spacer} aria-hidden />
    </div>
  );
}
