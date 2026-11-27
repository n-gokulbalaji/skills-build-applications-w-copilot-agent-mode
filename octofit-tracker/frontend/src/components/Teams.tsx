import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members?: string[] };

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [error, setError] = useState<string>();
  useEffect(() => {
    getJson<{ teams: Team[] }>('/api/teams')
      .then((data) => setTeams(data.teams))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setStatus('ready'));
  }, []);
  const items = teams.map((team, index) => (
    <article key={index}><strong>{team.name}</strong>{team.members?.length ? ` - ${team.members.length} members` : ''}</article>
  ));
  return <CapabilityCard title="Teams" description="Manage teams and members." status={status} items={items} emptyText="No teams yet." error={error} />;
}
