"use client";

import { useSyncExternalStore } from "react";

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
}

function noopSubscribe() {
  return () => undefined;
}

function detectIosSafari(): boolean {
  const ua = navigator.userAgent;
  const iOS = /iPhone|iPad|iPod/i.test(ua);
  const webkit = /WebKit/i.test(ua);
  const criOS = /CriOS/i.test(ua);
  const fxIOS = /FxiOS/i.test(ua);
  return iOS && webkit && !criOS && !fxIOS;
}

function detectStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean(navigator.standalone)
  );
}

export function useIosSafari(): boolean {
  return useSyncExternalStore(noopSubscribe, detectIosSafari, () => false);
}

export function useStandaloneDisplay(): boolean {
  return useSyncExternalStore(noopSubscribe, detectStandalone, () => false);
}
