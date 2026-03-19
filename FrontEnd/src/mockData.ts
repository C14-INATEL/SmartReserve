import { Resource, Booking } from './types';
import { addHours, startOfToday, setHours } from 'date-fns';

export const MOCK_RESOURCES: Resource[] = [
  {
    id: '1',
    name: 'Sala de Reunião Alpha',
    description: 'Sala equipada com projetor, ar-condicionado e mesa para 10 pessoas.',
    type: 'room',
    availableHours: { start: '08:00', end: '20:00' },
    imageUrl: 'https://picsum.photos/seed/meeting1/800/600'
  },
  {
    id: '2',
    name: 'Laboratório de Informática 01',
    description: '20 computadores de alto desempenho com softwares de engenharia instalados.',
    type: 'lab',
    availableHours: { start: '07:00', end: '22:00' },
    imageUrl: 'https://picsum.photos/seed/lab1/800/600'
  },
  {
    id: '3',
    name: 'Projetor Epson 4K',
    description: 'Equipamento portátil de alta resolução para apresentações externas.',
    type: 'equipment',
    availableHours: { start: '08:00', end: '18:00' },
    imageUrl: 'https://picsum.photos/seed/projector1/800/600'
  },
  {
    id: '4',
    name: 'Auditório Principal',
    description: 'Espaço para grandes eventos com capacidade para 200 pessoas e sistema de som completo.',
    type: 'room',
    availableHours: { start: '08:00', end: '23:00' },
    imageUrl: 'https://picsum.photos/seed/auditorium/800/600'
  },
  {
    id: '5',
    name: 'Laboratório de Química',
    description: 'Bancadas equipadas com bicos de Bunsen e reagentes básicos para experimentos.',
    type: 'lab',
    availableHours: { start: '08:00', end: '17:00' },
    imageUrl: 'https://picsum.photos/seed/chemistry/800/600'
  },
  {
    id: '6',
    name: 'Microscópio Óptico Nikon',
    description: 'Equipamento de alta precisão para análise biológica.',
    type: 'equipment',
    availableHours: { start: '09:00', end: '18:00' },
    imageUrl: 'https://picsum.photos/seed/microscope/800/600'
  }
];

const today = startOfToday();

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    resourceId: '1',
    userId: 'u1',
    startTime: setHours(today, 10),
    endTime: setHours(today, 12),
    status: 'confirmed'
  },
  {
    id: 'b2',
    resourceId: '2',
    userId: 'u1',
    startTime: setHours(today, 14),
    endTime: setHours(today, 16),
    status: 'confirmed'
  }
];
