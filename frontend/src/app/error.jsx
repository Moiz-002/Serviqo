'use client';

import { useEffect } from 'react';
import RouteErrorState from '@/components/ui/RouteErrorState';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Application route error:', error);
  }, [error]);

  return <RouteErrorState error={error} reset={reset} />;
}
