import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [error, setError] = useState<string>();
  useEffect(() => {
    getJson<{ activities: Activity[] }>('/api/activities')
      .then((data) => setActivities(data.activities))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setStatus('ready'));
  }, []);
  const items = activities.map((activity, index) => (
    <article key={index}><strong>{activity.type}</strong> - {activity.minutes} minutes ({activity.points} points)</article>
  ));
  return <CapabilityCard title="Activities" description="Track student activity minutes and points." status={status} items={items} emptyText="No activities yet." error={error} />;
}
