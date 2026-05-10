import type { Page } from '@playwright/test';

// ─── Mock data in backend API format ────────────────────────────────────────

export const mockUser = {
  id: 'user123',
  name: 'Álvaro Belarmino',
  matricula: '180',
  role: 'user' as const,
  photoUrl: 'https://picsum.photos/seed/m180/200/200',
};

export const mockAdmin = {
  id: 'admin123',
  name: 'Admin Silva',
  matricula: '999',
  role: 'admin' as const,
  photoUrl: 'https://picsum.photos/seed/m999/200/200',
};

// Backend API format (as returned by Express)
export const mockResourcesApi = [
  {
    _id: 'res1',
    nome: 'Sala de Reunião Alpha',
    descricao: 'Sala equipada com projetor e capacidade para 20 pessoas.',
    tipo: 'sala',
    horariosDisponiveis: [{ diaSemana: 'Segunda', horaInicio: '08:00', horaFim: '20:00' }],
    imageUrl: 'https://picsum.photos/seed/res1/800/600',
  },
  {
    _id: 'res2',
    nome: 'Laboratório de Informática 01',
    descricao: 'Lab com 30 computadores e acesso à internet de alta velocidade.',
    tipo: 'laboratorio',
    horariosDisponiveis: [{ diaSemana: 'Segunda', horaInicio: '07:00', horaFim: '22:00' }],
    imageUrl: 'https://picsum.photos/seed/res2/800/600',
  },
  {
    _id: 'res3',
    nome: 'Projetor 4K',
    descricao: 'Projetor de alta definição para apresentações e eventos.',
    tipo: 'equipamento',
    horariosDisponiveis: [{ diaSemana: 'Segunda', horaInicio: '08:00', horaFim: '18:00' }],
    imageUrl: 'https://picsum.photos/seed/res3/800/600',
  },
];

// A booking at 10:00–11:00 today for res1
const today = new Date();
today.setHours(0, 0, 0, 0);

export const mockBookingsApi = [
  {
    _id: 'book1',
    usuario: 'user123',
    recurso: 'res1',
    data: today.toISOString(),
    horaInicio: '10:00',
    horaFim: '11:00',
  },
];

// ─── API route mocking helpers ───────────────────────────────────────────────

/**
 * Mocks all API endpoints for a logged-in regular user.
 * Call BEFORE page.goto('/').
 */
export async function setupApiMocks(page: Page, bookings = mockBookingsApi) {
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({
      status: 200,
      json: { user: { id: 'user123', nome: 'Álvaro Belarmino', matricula: '180', role: 'user' } },
    })
  );

  await page.route('**/api/resources', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({ status: 200, json: mockResourcesApi });
    } else {
      route.continue();
    }
  });

  await page.route('**/api/reservations**', (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      route.fulfill({ status: 200, json: bookings });
    } else if (method === 'POST') {
      route.fulfill({ status: 201, json: { message: 'Reserva criada' } });
    } else if (method === 'DELETE') {
      route.fulfill({ status: 200, json: { message: 'Reserva cancelada' } });
    } else {
      route.continue();
    }
  });
}

/**
 * Sets up sessionStorage with user data and mocks the API, then navigates to '/'.
 */
export async function setupAuthenticatedPage(page: Page, user = mockUser) {
  await page.addInitScript((userData) => {
    window.sessionStorage.setItem('smartreserve_user', JSON.stringify(userData));
  }, user);

  await setupApiMocks(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

/**
 * Sets up an authenticated admin page.
 */
export async function setupAdminPage(page: Page) {
  await setupAuthenticatedPage(page, mockAdmin);
}
