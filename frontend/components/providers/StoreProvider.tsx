'use client';

import { useEffect } from 'react';
import { useAssignmentStore } from '@/store/assignmentStore';

/**
 * Initializes the global Zustand store on app mount.
 * This ensures sidebar badge count is always correct regardless of which page loads first.
 */
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const fetchAssignments = useAssignmentStore((s) => s.fetchAssignments);

  useEffect(() => {
    // Load assignments globally so sidebar count is always up to date
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
