import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Workout = { title: string; reason?: string };

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [error, setError] = useState<string>();
  useEffect(() => {
    getJson<{ suggestions: Workout[] }>('/api/workouts/suggestions/mona@example.com')
      .then((data) => setWorkouts(data.suggestions))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setStatus('ready'));
  }, []);
  const items = workouts.map((workout, index) => (
    <article key={index}><strong>{workout.title}</strong>{workout.reason ? ` - ${workout.reason}` : ''}</article>
  ));
  return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." status={status} items={items} emptyText="No workout suggestions yet." error={error} />;
}
