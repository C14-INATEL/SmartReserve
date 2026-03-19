export type ResourceType = 'room' | 'lab' | 'equipment';

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  role: 'admin' | 'user';
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  type: ResourceType;
  availableHours: {
    start: string; // e.g., "08:00"
    end: string;   // e.g., "22:00"
  };
  imageUrl: string;
}

export interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export type View = 'home' | 'my-bookings' | 'resource-details' | 'login' | 'register' | 'settings';
