import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Ranking = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [error, setError] = useState<string>();
  useEffect(() => {
    getJson<{ leaderboard: Ranking[] }>('/api/leaderboard')
      .then((data) => setRankings(data.leaderboard))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setStatus('ready'));
  }, []);
  const items = rankings.map((ranking) => (
    <article key={ranking.rank}><strong>{ranking.teamName}</strong> - {ranking.totalPoints} points (rank {ranking.rank})</article>
  ));
  return <CapabilityCard title="Leaderboard" description="Compare team point totals." status={status} items={items} emptyText="No rankings or scores yet." error={error} />;
}
