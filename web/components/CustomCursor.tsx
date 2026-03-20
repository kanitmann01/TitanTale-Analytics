"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const LERP = 0.14;
const HOVER_SELECTORS =
  "a,button,input,textarea,select,label,[role='button'],[tabindex]:not([tabindex='-1']),summary,.btn-press,.link-profile";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hasFinePointer(): boolean {
  return window.matchMedia("(pointer: fine) and (hover: hover)").matches;
}

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const ringRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const runningRef = useRef(false);
  const hoverRef = useRef(false);

  const ringWrapEl = useRef<HTMLDivElement>(null);
  const dotWrapEl = useRef<HTMLDivElement>(null);
  const rootEl = useRef<HTMLDivElement>(null);

  const applyTransforms = useCallback(() => {
    const { x: tx, y: ty } = targetRef.current;
    let { x: rx, y: ry } = ringRef.current;
    rx += (tx - rx) * LERP;
    ry += (ty - ry) * LERP;
    ringRef.current = { x: rx, y: ry };

    const dot = dotWrapEl.current;
    const ring = ringWrapEl.current;
    if (dot) {
      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
    }
    if (ring) {
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    }

    if (runningRef.current) {
      rafRef.current = requestAnimationFrame(applyTransforms);
    }
  }, []);

  useEffect(() => {
    if (prefersReducedMotion() || !hasFinePointer()) {
      return;
    }

    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");
    runningRef.current = true;

    const setHover = (on: boolean) => {
      if (hoverRef.current === on) return;
      hoverRef.current = on;
      rootEl.current?.classList.toggle("custom-cursor-root--hover", on);
    };

    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const hit =
        el instanceof Element ? el.closest(HOVER_SELECTORS) : null;
      setHover(Boolean(hit));
    };

    const onDown = () => {
      rootEl.current?.classList.add("custom-cursor-root--press");
    };

    const onUp = () => {
      rootEl.current?.classList.remove("custom-cursor-root--press");
    };

    const onLeaveWindow = () => {
      rootEl.current?.classList.add("custom-cursor-root--hidden");
    };

    const onEnterWindow = () => {
      rootEl.current?.classList.remove("custom-cursor-root--hidden");
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("mouseup", onUp, true);
    document.addEventListener("mouseleave", onLeaveWindow);
    document.addEventListener("mouseenter", onEnterWindow);

    rafRef.current = requestAnimationFrame(applyTransforms);

    return () => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
      document.documentElement.classList.remove("has-custom-cursor");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("mouseup", onUp, true);
      document.removeEventListener("mouseleave", onLeaveWindow);
      document.removeEventListener("mouseenter", onEnterWindow);
    };
  }, [applyTransforms]);

  if (!enabled) {
    return null;
  }

  return (
    <div ref={rootEl} className="custom-cursor-root" aria-hidden>
      <div ref={ringWrapEl} className="custom-cursor-ring-wrap">
        <div className="custom-cursor-ring" />
      </div>
      <div ref={dotWrapEl} className="custom-cursor-dot-wrap">
        <div className="custom-cursor-dot" />
      </div>
    </div>
  );
}
