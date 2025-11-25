
import { User, Parcel, ParcelStatus, UserRole } from '../types';

// ==========================================
// CONFIGURATION
// ==========================================

// SET THIS TO 'true' WHEN RUNNING ON LOCALHOST WITH XAMPP
// SET THIS TO 'false' WHEN RUNNING IN AI STUDIO OR DEMO MODE
const USE_LIVE_API = false; 

// Your XAMPP API URL
const API_URL = 'http://localhost/eparcel_api';

// ==========================================

// --- HELPERS: Map Database (snake_case) to React (camelCase) ---

const mapUserFromDb = (dbUser: any): User => ({
  id: dbUser.id.toString(),
  name: dbUser.name,
  email: dbUser.email,
  role: dbUser.role as UserRole,
  isActive: Boolean(Number(dbUser.is_active)), // PHP often returns '1' or '0'
  password: dbUser.password, // Be careful returning passwords in real apps
  assignedClients: dbUser.assigned_clients ? JSON.parse(dbUser.assigned_clients) : [],
  avatar: dbUser.avatar
});

const mapParcelFromDb = (dbParcel: any): Parcel => ({
  id: dbParcel.id.toString(),
  trackingNumber: dbParcel.tracking_number,
  sender: dbParcel.sender,
  clientId: dbParcel.client_id.toString(),
  description: dbParcel.description,
  status: dbParcel.status as ParcelStatus,
  dateCreated: dbParcel.created_at?.split(' ')[0] || new Date().toISOString().split('T')[0],
  dateUpdated: dbParcel.updated_at?.split(' ')[0] || new Date().toISOString().split('T')[0],
  handledBy: dbParcel.handled_by ? dbParcel.handled_by.toString() : undefined
});

// --- MOCK DATA FALLBACKS (Used if USE_LIVE_API is false) ---
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

// Helper to handle requests
async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  // If Mock Mode is enabled, skip network request
  if (!USE_LIVE_API) {
    console.log(`[Mock API] ${options.method || 'GET'} ${endpoint}`);
    await new Promise(r => setTimeout(r, 600)); // Simulate latency
    throw new Error("Using Mock Data"); // Throwing error triggers the catch block in specific methods to load mock data
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    const text = await response.text();
    try {
        const json = JSON.parse(text);
        if (json.error) throw new Error(json.error);
        return json;
    } catch (e) {
        console.error("Invalid JSON from PHP:", text);
        throw new Error("Server Error or Invalid JSON");
    }
  } catch (e) {
    console.error("API Request Failed:", e);
    return null; 
  }
}

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      if (USE_LIVE_API) {
        const data = await request('/login.php', { method: 'POST', body: JSON.stringify({ email, password }) });
        if (data && data.user) return mapUserFromDb(data.user);
        throw new Error("Invalid credentials from server");
      }

      // Mock Fallback
      const user = MOCK_USERS.find(u => u.email === email && u.password === password);
      if (!user) throw new Error("Invalid credentials");
      if (!user.isActive) throw new Error("Account is inactive. Contact Admin.");
      return user;
    },
    register: async (user: Partial<User>) => {
      if (USE_LIVE_API) {
        await request('/register.php', { 
          method: 'POST', 
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            password: user.password,
            role: 'CLIENT'
          }) 
        });
        return { ...user, id: 'temp', isActive: false };
      }

      // Mock Fallback
      return { ...user, id: `u${Date.now()}`, isActive: false };
    }
  },
  
  users: {
    getAll: async () => {
      if (USE_LIVE_API) {
        const data = await request('/get_users.php');
        if (data && Array.isArray(data)) return data.map(mapUserFromDb);
      }
      return MOCK_USERS;
    },
    create: async (user: User) => {
      if (USE_LIVE_API) {
        const dbUser = await request('/create_user.php', { 
          method: 'POST', 
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
            is_active: user.isActive ? 1 : 0
          }) 
        });
        if (dbUser) return mapUserFromDb(dbUser);
      }
      return user;
    },
    toggleStatus: async (userId: string, isActive: boolean) => {
      if (USE_LIVE_API) {
        await request('/update_user_status.php', { 
          method: 'POST', 
          body: JSON.stringify({ id: userId, is_active: isActive ? 1 : 0 }) 
        });
      }
      return true;
    }
  },

  parcels: {
    getAll: async () => {
      if (USE_LIVE_API) {
        const data = await request('/get_parcels.php');
        if (data && Array.isArray(data)) return data.map(mapParcelFromDb);
      }
      return MOCK_PARCELS;
    },
    create: async (parcel: Parcel) => {
      if (USE_LIVE_API) {
        const dbParcel = await request('/create_parcel.php', { 
          method: 'POST', 
          body: JSON.stringify({
            tracking_number: parcel.trackingNumber,
            sender: parcel.sender,
            client_id: parcel.clientId,
            description: parcel.description,
            handled_by: parcel.handledBy
          }) 
        });
        if (dbParcel) return mapParcelFromDb(dbParcel);
      }
      return parcel;
    },
    updateStatus: async (id: string, status: ParcelStatus) => {
      if (USE_LIVE_API) {
        await request('/update_parcel_status.php', { 
          method: 'POST', 
          body: JSON.stringify({ id, status }) 
        });
      }
      return true;
    },
    delete: async (id: string) => {
      if (USE_LIVE_API) {
        await request('/delete_parcel.php', { 
          method: 'POST', 
          body: JSON.stringify({ id }) 
        });
      }
      return true;
    }
  }
};
