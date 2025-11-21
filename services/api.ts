import { User, Parcel, ParcelStatus, UserRole } from '../types';

const API_URL = 'http://localhost:8000/api';

// --- MOCK DATA FALLBACKS (Used if API is offline) ---
const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@eparcel.com', role: UserRole.ADMIN, isActive: true, password: 'password' },
  { id: 'u2', name: 'John Staff', email: 'john@eparcel.com', role: UserRole.STAFF, isActive: true, assignedClients: ['u4'], password: 'password' },
  { id: 'u3', name: 'Sarah Staff', email: 'sarah@eparcel.com', role: UserRole.STAFF, isActive: false, assignedClients: [], password: 'password' },
  { id: 'u4', name: 'Client A Corp', email: 'clienta@corp.com', role: UserRole.CLIENT, isActive: true, password: 'password' },
  { id: 'u5', name: 'Client B Ltd', email: 'clientb@ltd.com', role: UserRole.CLIENT, isActive: true, password: 'password' },
];

const MOCK_PARCELS: Parcel[] = [
  { id: 'p1', trackingNumber: 'EP-8832', sender: 'Warehouse A', clientId: 'u4', description: 'Electronics', status: ParcelStatus.DELIVERED, dateCreated: '2023-10-01', dateUpdated: '2023-10-05', handledBy: 'u2' },
  { id: 'p2', trackingNumber: 'EP-9941', sender: 'Warehouse B', clientId: 'u4', description: 'Documents', status: ParcelStatus.PENDING, dateCreated: '2023-10-25', dateUpdated: '2023-10-25' },
  { id: 'p3', trackingNumber: 'EP-1122', sender: 'Supplier X', clientId: 'u5', description: 'Furniture', status: ParcelStatus.IN_TRANSIT, dateCreated: '2023-10-24', dateUpdated: '2023-10-26', handledBy: 'u2' },
  { id: 'p4', trackingNumber: 'EP-3344', sender: 'Amazon', clientId: 'u4', description: 'Books', status: ParcelStatus.DECLINED, dateCreated: '2023-10-20', dateUpdated: '2023-10-21', handledBy: 'u3' },
];

// Helper to simulate delay or fetch real data
async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  try {
    // UNCOMMENT THE LINES BELOW TO ENABLE REAL LARAVEL CONNECTION
    // const response = await fetch(`${API_URL}${endpoint}`, {
    //   ...options,
    //   headers: { 'Content-Type': 'application/json', ...options.headers },
    // });
    // if (!response.ok) throw new Error('API Error');
    // return await response.json();

    // --- SIMULATED RESPONSE FOR DEMO ---
    await new Promise(r => setTimeout(r, 500)); // Fake network delay
    throw new Error("Mock Mode"); 
  } catch (e) {
    console.log(`[API Mock] ${options.method || 'GET'} ${endpoint}`);
    return null; // Signal to use mock data
  }
}

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      // Try Real API
      // const data = await request('/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      // if (data) return data.user;

      // Mock Fallback
      const user = MOCK_USERS.find(u => u.email === email && u.password === password);
      if (!user) throw new Error("Invalid credentials");
      if (!user.isActive) throw new Error("Account is inactive. Contact Admin.");
      return user;
    },
    register: async (user: Partial<User>) => {
      // await request('/register', { method: 'POST', body: JSON.stringify(user) });
      return { ...user, id: `u${Date.now()}`, isActive: false };
    }
  },
  
  users: {
    getAll: async () => {
      // const data = await request('/users');
      // if (data) return data;
      return MOCK_USERS;
    },
    create: async (user: User) => {
      // await request('/users', { method: 'POST', body: JSON.stringify(user) });
      return user;
    },
    toggleStatus: async (userId: string, isActive: boolean) => {
      // await request(`/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ isActive }) });
      return true;
    }
  },

  parcels: {
    getAll: async () => {
      // const data = await request('/parcels');
      // if (data) return data;
      return MOCK_PARCELS;
    },
    create: async (parcel: Parcel) => {
      // await request('/parcels', { method: 'POST', body: JSON.stringify(parcel) });
      return parcel;
    },
    updateStatus: async (id: string, status: ParcelStatus) => {
      // await request(`/parcels/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      return true;
    },
    delete: async (id: string) => {
      // await request(`/parcels/${id}`, { method: 'DELETE' });
      return true;
    }
  }
};
