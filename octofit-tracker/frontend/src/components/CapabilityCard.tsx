import type { ReactNode } from 'react';

type Props = {
  title: string;
  description: string;
  status: 'loading' | 'ready';
  items: ReactNode[];
  emptyText: string;
  error?: string;
};

export function CapabilityCard({ title, description, status, items, emptyText, error }: Props) {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {error && <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>}
        {status === 'ready' && !error && items.length === 0 && <p>{emptyText}</p>}
        {status === 'ready' && !error && items.length > 0 && <div>{items}</div>}
      </div>
    </section>
  );
}
