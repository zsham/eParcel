export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CLIENT = 'CLIENT'
}

export enum ParcelStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  IN_TRANSIT = 'In Transit',
  DELIVERED = 'Delivered',
  DECLINED = 'Declined'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  password?: string; // In a real app, this would be hashed
  assignedClients?: string[]; // For Staff: list of Client IDs they handle
  avatar?: string;
}

export interface Parcel {
  id: string;
  trackingNumber: string;
  sender: string;
  clientId: string; // The recipient client
  description: string;
  status: ParcelStatus;
  dateCreated: string;
  dateUpdated: string;
  handledBy?: string; // Staff ID
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string; // Or 'GROUP' context
  content: string;
  timestamp: string;
  isAiGenerated?: boolean;
}
