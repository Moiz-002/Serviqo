'use client';

import RouteErrorState from '@/components/ui/RouteErrorState';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f7f8fc] font-sans">
        <RouteErrorState error={error} reset={reset} />
      </body>
    </html>
  );
}
