import type { Resource, Booking, ResourceType } from '../types';

const base = () => import.meta.env.VITE_API_URL || 'http://localhost:4000';

export type ApiUser = {
  id: string;
  nome: string;
  matricula: string;
  role: string;
};

export async function apiLogin(matricula: string, senha: string): Promise<ApiUser> {
  const res = await fetch(`${base()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matricula: matricula.trim(), senha })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Falha no login');
  return data.user;
}

export async function apiFetchResources(): Promise<Resource[]> {
  const res = await fetch(`${base()}/api/resources`);
  if (!res.ok) throw new Error('Erro ao carregar recursos');
  const list = await res.json();
  return list.map(mapRecursoFromApi);
}

export async function apiFetchReservations(userId: string): Promise<Booking[]> {
  const res = await fetch(`${base()}/api/reservations?usuario=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('Erro ao carregar reservas');
  const list = await res.json();
  return list.map(mapReservaFromApi);
}

export async function apiCreateReservation(payload: {
  usuario: string;
  recurso: string;
  data: string;
  horaInicio: string;
  horaFim: string;
}): Promise<void> {
  const res = await fetch(`${base()}/api/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Erro ao criar reserva');
}

export async function apiDeleteReservation(id: string): Promise<void> {
  const res = await fetch(`${base()}/api/reservations/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Erro ao cancelar reserva');
  }
}

const tipoToFront: Record<string, ResourceType> = {
  sala: 'room',
  laboratorio: 'lab',
  equipamento: 'equipment'
};

const tipoToApi: Record<ResourceType, string> = {
  room: 'sala',
  lab: 'laboratorio',
  equipment: 'equipamento'
};

export function mapRecursoFromApi(r: {
  _id: string;
  nome: string;
  descricao: string;
  tipo: string;
  horariosDisponiveis?: { horaInicio: string; horaFim: string }[];
  imageUrl?: string;
}): Resource {
  let start = '08:00';
  let end = '18:00';
  if (r.horariosDisponiveis?.length) {
    const starts = [...r.horariosDisponiveis.map((h) => h.horaInicio)].sort();
    const ends = [...r.horariosDisponiveis.map((h) => h.horaFim)].sort();
    start = starts[0];
    end = ends[ends.length - 1];
  }
  return {
    id: String(r._id),
    name: r.nome,
    description: r.descricao,
    type: tipoToFront[r.tipo] || 'room',
    availableHours: { start, end },
    imageUrl: r.imageUrl || `https://picsum.photos/seed/${r._id}/800/600`
  };
}

export function mapReservaFromApi(r: {
  _id: string;
  usuario: string;
  recurso: string | { _id: string };
  data: string;
  horaInicio: string;
  horaFim: string;
}): Booking {
  const d = new Date(r.data);
  const [hi, mi] = r.horaInicio.split(':').map(Number);
  const [hf, mf] = r.horaFim.split(':').map(Number);
  const startTime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hi, mi, 0, 0);
  const endTime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hf, mf, 0, 0);
  const resourceId =
    typeof r.recurso === 'object' && r.recurso && '_id' in r.recurso
      ? String(r.recurso._id)
      : String(r.recurso);
  return {
    id: r._id,
    resourceId,
    userId: String(r.usuario),
    startTime,
    endTime,
    status: 'confirmed'
  };
}

export async function apiCreateResource(input: {
  name: string;
  description: string;
  type: ResourceType;
  imageUrl: string;
  horaInicio: string;
  horaFim: string;
}): Promise<Resource> {
  const res = await fetch(`${base()}/api/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: input.name,
      descricao: input.description,
      tipo: tipoToApi[input.type],
      imageUrl: input.imageUrl,
      horaInicioGlobal: input.horaInicio,
      horaFimGlobal: input.horaFim
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Erro ao criar recurso');
  return mapRecursoFromApi(data);
}
