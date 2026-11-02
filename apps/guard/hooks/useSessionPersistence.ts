'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Prevents hydration mismatches with Zustand persist + sessionStorage.
 * Returns false during SSR and initial client render, true after hydration.
 * Wrap client-side store-consuming UI with this guard.
 */
export function useHasHydrated(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
