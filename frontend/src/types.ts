export type ResourceType = 'room' | 'lab' | 'equipment';

export interface User {
  id: string;
  name: string;
  matricula: string;
  photoUrl?: string;
  role: 'admin' | 'user';
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  type: ResourceType;
  availableHours: {
    start: string;
    end: string;
  };
  imageUrl: string;
  location?: string;
  capacity?: number;
}

export interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export type View = 'home' | 'my-bookings' | 'resource-details' | 'login' | 'settings';
