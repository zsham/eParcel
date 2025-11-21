import React, { useState, useMemo, useEffect } from 'react';
import { 
  Package, Users, LayoutDashboard, MessageSquare, Settings, 
  LogOut, Bell, Plus, Search, CheckCircle, XCircle, Truck, 
  BarChart3, BrainCircuit, ChevronRight, Menu, X, Trash2, Eye, Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell 
} from 'recharts';
import { User, UserRole, Parcel, ParcelStatus, Message } from './types';
import { generateDashboardAnalysis, simulateChatResponse } from './services/geminiService';
import { api } from './services/api';

// --- Shared Components ---

const Card = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    [ParcelStatus.DELIVERED]: 'bg-emerald-100 text-emerald-700',
    [ParcelStatus.PENDING]: 'bg-amber-100 text-amber-700',
    [ParcelStatus.IN_TRANSIT]: 'bg-blue-100 text-blue-700',
    [ParcelStatus.DECLINED]: 'bg-red-100 text-red-700',
    [ParcelStatus.ACCEPTED]: 'bg-indigo-100 text-indigo-700',
    'Active': 'bg-emerald-100 text-emerald-700',
    'Inactive': 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

// --- Sub-components ---

interface LoginScreenProps {
  authMode: 'login' | 'register' | 'forgot';
  setAuthMode: (mode: 'login' | 'register' | 'forgot') => void;
  email: string;
  setEmail: (e: string) => void;
  password: string;
  setPassword: (e: string) => void;
  handleLogin: (e: React.FormEvent) => void;
  handleRegister: (e: React.FormEvent) => void;
  error: string;
  isLoading: boolean;
}

const LoginScreen = ({ 
  authMode, setAuthMode, email, setEmail, password, setPassword, 
  handleLogin, handleRegister, error, isLoading
}: LoginScreenProps) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="bg-indigo-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
          <Truck className="text-white w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">eParcel System</h1>
        <p className="text-slate-500 mt-2">Logistics Management Platform</p>
        <p className="text-xs text-emerald-600 mt-1 font-mono">Connected to: Localhost API</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
          <XCircle className="w-4 h-4 mr-2" /> {error}
        </div>
      )}

      {authMode === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="user@eparcel.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-md shadow-indigo-200 flex justify-center items-center"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
          <div className="flex justify-between text-sm mt-4">
            <button type="button" onClick={() => setAuthMode('forgot')} className="text-slate-500 hover:text-indigo-600">Forgot Password?</button>
            <button type="button" onClick={() => setAuthMode('register')} className="text-indigo-600 font-medium hover:text-indigo-700">Create Client Account</button>
          </div>
        </form>
      )}

      {authMode === 'register' && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input type="email" required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Set Password</label>
            <input type="password" required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex justify-center">
             {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register as Client'}
          </button>
          <button type="button" onClick={() => setAuthMode('login')} className="w-full text-slate-500 text-sm hover:text-slate-700">
            Back to Login
          </button>
        </form>
      )}

      {authMode === 'forgot' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 text-center">Enter your email to receive a reset link.</p>
          <input type="email" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" placeholder="Email address" />
          <button onClick={() => { alert('Reset link sent (simulated)'); setAuthMode('login'); }} className="w-full bg-slate-800 text-white py-2.5 rounded-lg">Send Reset Link</button>
          <button type="button" onClick={() => setAuthMode('login')} className="w-full text-slate-500 text-sm">Back</button>
        </div>
      )}
      
      <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400 text-center">
         <p>Demo Credentials:</p>
         <p>Admin: admin@eparcel.com / password</p>
         <p>Staff: john@eparcel.com / password</p>
         <p>Client: clienta@corp.com / password</p>
      </div>
    </div>
  </div>
);

const DashboardStats = ({ parcels, users, currentUser, aiAnalysis, isLoadingAi, triggerAiAnalysis }: any) => {
  const roleStats = useMemo(() => {
    const totalParcels = parcels.length;
    const delivered = parcels.filter((p: Parcel) => p.status === ParcelStatus.DELIVERED).length;
    const pending = parcels.filter((p: Parcel) => p.status === ParcelStatus.PENDING).length;
    const staffActive = users.filter((u: User) => u.role === UserRole.STAFF && u.isActive).length;
    
    const statusData = [
      { name: 'Delivered', value: delivered, color: '#10b981' },
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'In Transit', value: totalParcels - delivered - pending, color: '#6366f1' },
    ];

    return { totalParcels, delivered, pending, staffActive, statusData };
  }, [parcels, users]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-indigo-500">
          <h3 className="text-slate-500 text-sm font-medium">Total Parcels</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{roleStats.totalParcels}</p>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <h3 className="text-slate-500 text-sm font-medium">Delivered</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{roleStats.delivered}</p>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <h3 className="text-slate-500 text-sm font-medium">Pending</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{roleStats.pending}</p>
        </Card>
        {currentUser?.role === UserRole.ADMIN && (
          <Card className="border-l-4 border-l-blue-500">
            <h3 className="text-slate-500 text-sm font-medium">Active Staff</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">{roleStats.staffActive}</p>
          </Card>
        )}
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="text-indigo-600 w-5 h-5" />
              <h3 className="font-semibold text-indigo-900">Gemini Smart Analysis</h3>
            </div>
            <button 
              onClick={triggerAiAnalysis}
              disabled={isLoadingAi}
              className="text-xs bg-white text-indigo-600 border border-indigo-200 px-3 py-1 rounded-full hover:bg-indigo-50 transition"
            >
              {isLoadingAi ? 'Thinking...' : 'Generate Insight'}
            </button>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            {aiAnalysis || "Click 'Generate Insight' to get an AI-powered executive summary of your current logistics performance."}
          </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Parcel Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie 
                  data={roleStats.statusData} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {roleStats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Jan', val: 40 }, { name: 'Feb', val: 30 }, { name: 'Mar', val: 20 },
                { name: 'Apr', val: 27 }, { name: 'May', val: 18 }, { name: 'Jun', val: 23 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="val" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

const ManageUsers = ({ users, setUsers, targetRole }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  const targetUsers = users.filter((u: User) => u.role === targetRole);

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    await api.users.toggleStatus(id, !currentStatus);
    // Optimistic Update
    setUsers(users.map((u: User) => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) return;
    
    setIsLoading(true);
    try {
      const user: User = {
        id: `temp-${Date.now()}`, // Will be replaced by backend ID usually
        name: newUser.name,
        email: newUser.email,
        role: targetRole,
        isActive: true,
        password: newUser.password,
        assignedClients: []
      };
      
      const createdUser = await api.users.create(user);
      setUsers([...users, createdUser]);
      setIsModalOpen(false);
      setNewUser({ name: '', email: '', password: '' });
    } catch (err) {
      alert('Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Manage {targetRole === UserRole.STAFF ? 'Staff' : 'Clients'}</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-500 text-sm border-b border-slate-100">
                <th className="py-3 font-medium">Name</th>
                <th className="py-3 font-medium">Email</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {targetUsers.map((user: User) => (
                <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                  <td className="py-4 text-slate-800 font-medium">{user.name}</td>
                  <td className="py-4 text-slate-500">{user.email}</td>
                  <td className="py-4">
                    <Badge status={user.isActive ? 'Active' : 'Inactive'} />
                  </td>
                  <td className="py-4 text-right">
                    <button 
                      onClick={() => toggleUserStatus(user.id, user.isActive)}
                      className={`text-sm px-3 py-1 rounded-md transition ${user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                    >
                      {user.isActive ? 'Deactivate' : 'Approve/Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {targetUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-800 mb-1">Add New {targetRole === UserRole.STAFF ? 'Staff' : 'Client'}</h3>
            <p className="text-slate-500 text-sm mb-6">Enter the details to create a new account.</p>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Default Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex justify-center"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const ParcelList = ({ parcels, setParcels, currentUser, users }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [newParcel, setNewParcel] = useState({
    trackingNumber: '',
    sender: '',
    clientId: '',
    description: ''
  });

  const visibleParcels = parcels.filter((p: Parcel) => {
    if (currentUser?.role === UserRole.CLIENT && p.clientId !== currentUser.id) return false;
    if (filterStatus !== 'All' && p.status !== filterStatus) return false;
    if (searchQuery && !p.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const clients = users ? users.filter((u: User) => u.role === UserRole.CLIENT) : [];

  const handleUpdateStatus = async (id: string, newStatus: ParcelStatus) => {
    await api.parcels.updateStatus(id, newStatus);
    setParcels(parcels.map((p: Parcel) => 
      p.id === id ? { ...p, status: newStatus, dateUpdated: new Date().toISOString().split('T')[0] } : p
    ));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this parcel record?')) {
      await api.parcels.delete(id);
      setParcels(parcels.filter((p: Parcel) => p.id !== id));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParcel.trackingNumber || !newParcel.clientId) return;
    setIsLoading(true);

    try {
      const parcelData: Parcel = {
        id: `p${Date.now()}`,
        trackingNumber: newParcel.trackingNumber,
        sender: newParcel.sender,
        clientId: newParcel.clientId,
        description: newParcel.description,
        status: ParcelStatus.PENDING,
        dateCreated: new Date().toISOString().split('T')[0],
        dateUpdated: new Date().toISOString().split('T')[0],
        handledBy: currentUser.id
      };
      const createdParcel = await api.parcels.create(parcelData);
      setParcels([createdParcel, ...parcels]);
      setIsModalOpen(false);
      setNewParcel({ trackingNumber: '', sender: '', clientId: '', description: '' });
    } catch (err) {
      alert("Error creating parcel");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Parcel Records</h2>
          {(currentUser?.role === UserRole.STAFF) && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" /> Register Parcel
            </button>
          )}
        </div>
        <div className="flex gap-4 mb-6">
           <div className="relative flex-1 max-w-sm">
             <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Search tracking number..." 
               className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)} 
             />
           </div>
           <select 
             className="border border-slate-200 rounded-lg px-4 py-2 text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
             value={filterStatus}
             onChange={(e) => setFilterStatus(e.target.value)}
           >
             <option value="All">All Status</option>
             {Object.values(ParcelStatus).map((status) => (
               <option key={status} value={status}>{status}</option>
             ))}
           </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-sm border-b border-slate-100">
                <th className="py-3 font-medium">Tracking ID</th>
                <th className="py-3 font-medium">Description</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Updated</th>
                <th className="py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleParcels.map((parcel: Parcel) => (
                <tr key={parcel.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                  <td className="py-4 font-mono text-indigo-600 font-medium">{parcel.trackingNumber}</td>
                  <td className="py-4 text-slate-600">{parcel.description}</td>
                  <td className="py-4"><Badge status={parcel.status} /></td>
                  <td className="py-4 text-slate-500 text-sm">{parcel.dateUpdated}</td>
                  <td className="py-4 text-right flex justify-end gap-2">
                    {currentUser?.role === UserRole.STAFF && (
                      <>
                        <button onClick={() => handleUpdateStatus(parcel.id, ParcelStatus.ACCEPTED)} className="p-1.5 text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100 transition"><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={() => handleUpdateStatus(parcel.id, ParcelStatus.DECLINED)} className="p-1.5 text-amber-600 bg-amber-50 rounded hover:bg-amber-100 transition"><XCircle className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(parcel.id)} className="p-1.5 text-red-600 bg-red-50 rounded hover:bg-red-100 transition"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                    {currentUser?.role === UserRole.CLIENT && (
                      <>
                        {parcel.status !== ParcelStatus.DELIVERED && parcel.status !== ParcelStatus.DECLINED && (
                          <>
                            <button onClick={() => handleUpdateStatus(parcel.id, ParcelStatus.DELIVERED)} className="p-1.5 text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100 transition"><CheckCircle className="w-4 h-4" /></button>
                            <button onClick={() => handleUpdateStatus(parcel.id, ParcelStatus.DECLINED)} className="p-1.5 text-amber-600 bg-amber-50 rounded hover:bg-amber-100 transition"><XCircle className="w-4 h-4" /></button>
                          </>
                        )}
                      </>
                    )}
                     <button onClick={() => setSelectedParcel(parcel)} className="text-slate-400 hover:text-indigo-600 p-1.5" title="View Details"><Eye className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
              {visibleParcels.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">No parcels found matching your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-slate-800 mb-1">Register New Parcel</h3>
            <p className="text-slate-500 text-sm mb-6">Enter the details to create a new parcel record.</p>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tracking Number</label>
                <input type="text" required placeholder="e.g. EP-1001" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" value={newParcel.trackingNumber} onChange={e => setNewParcel({...newParcel, trackingNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input type="text" required placeholder="e.g. Office Supplies" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" value={newParcel.description} onChange={e => setNewParcel({...newParcel, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sender</label>
                <input type="text" required placeholder="e.g. Amazon" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" value={newParcel.sender} onChange={e => setNewParcel({...newParcel, sender: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assign to Client</label>
                <select required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" value={newParcel.clientId} onChange={e => setNewParcel({...newParcel, clientId: e.target.value})}>
                  <option value="">Select a Client</option>
                  {clients.map((client: User) => (
                    <option key={client.id} value={client.id}>{client.name} ({client.email})</option>
                  ))}
                </select>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition flex justify-center">{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* View Details Modal (Same as before) */}
      {selectedParcel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
            <button onClick={() => setSelectedParcel(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            <div className="mb-6">
               <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-semibold tracking-wide">PARCEL DETAILS</span>
               <h3 className="text-2xl font-bold text-slate-800 mt-2">{selectedParcel.trackingNumber}</h3>
               <div className="mt-2 flex items-center gap-2"><span className="text-slate-500 text-sm">Current Status:</span><Badge status={selectedParcel.status} /></div>
            </div>
            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
              <div className="flex justify-between"><span className="text-slate-500 text-sm">Description</span><span className="text-slate-800 font-medium text-sm">{selectedParcel.description}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 text-sm">Sender</span><span className="text-slate-800 font-medium text-sm">{selectedParcel.sender}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 text-sm">Date Created</span><span className="text-slate-800 font-medium text-sm">{selectedParcel.dateCreated}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 text-sm">Last Updated</span><span className="text-slate-800 font-medium text-sm">{selectedParcel.dateUpdated}</span></div>
              {selectedParcel.handledBy && (<div className="flex justify-between"><span className="text-slate-500 text-sm">Handled By Staff ID</span><span className="text-slate-800 font-medium text-sm">{selectedParcel.handledBy}</span></div>)}
            </div>
            <div className="flex justify-end"><button onClick={() => setSelectedParcel(null)} className="px-6 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition">Close</button></div>
          </div>
        </div>
      )}
    </>
  );
};

const ChatSystem = ({ currentUser }: any) => {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{text: string, sender: 'me' | 'other'}[]>([
    { text: "Hello, I have a question about parcel EP-8832.", sender: 'other' }
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!input.trim()) return;

    const userMsg = input;
    setChatHistory(prev => [...prev, { text: userMsg, sender: 'me' }]);
    setInput('');

    const aiReply = await simulateChatResponse(
      userMsg, 
      currentUser?.role || 'GUEST', 
      "The user is asking about parcel status or logistics support."
    );
    
    setChatHistory(prev => [...prev, { text: aiReply, sender: 'other' }]);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <div className="border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800">Messages</h2>
        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">AI Support Active</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="relative">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-5 pr-12 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"><MessageSquare className="w-4 h-4" /></button>
      </form>
    </Card>
  );
};

// --- Main Application ---

export default function App() {
  // Global State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  
  // UI State
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);

  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Load Data on Mount (from API or Mock)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, parcelsData] = await Promise.all([
          api.users.getAll(),
          api.parcels.getAll()
        ]);
        setUsers(usersData);
        setParcels(parcelsData);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsAppLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Actions ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const user = await api.auth.login(email, password);
      setCurrentUser(user);
      setActiveView('dashboard');
      setError('');
      setAiAnalysis(''); 
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      await api.auth.register({
        name: email.split('@')[0],
        email,
        role: UserRole.CLIENT,
        password
      });
      alert("Registration successful! Please wait for Administrator approval.");
      setAuthMode('login');
    } catch (err) {
      setError("Registration failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    setAuthMode('login');
  };

  const triggerAiAnalysis = async () => {
    if (!currentUser) return;
    setIsLoadingAi(true);
    
    const stats = {
      totalParcels: parcels.length,
      delivered: parcels.filter(p => p.status === ParcelStatus.DELIVERED).length,
      pending: parcels.filter(p => p.status === ParcelStatus.PENDING).length,
      users: users.length
    };

    const result = await generateDashboardAnalysis(stats, currentUser.role);
    setAiAnalysis(result);
    setIsLoadingAi(false);
  };

  if (isAppLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>;
  }

  if (!currentUser) {
    return (
      <LoginScreen 
        authMode={authMode}
        setAuthMode={setAuthMode}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        error={error}
        isLoading={authLoading}
      />
    );
  }

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveView(id); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        activeView === id 
        ? 'bg-indigo-50 text-indigo-600 font-semibold' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6">
          <div className="flex items-center gap-3 text-indigo-600 font-bold text-xl">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Truck className="w-5 h-5" />
            </div>
            eParcel
          </div>
        </div>
        
        <div className="px-4 space-y-1">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          
          {currentUser.role === UserRole.ADMIN && (
            <>
              <NavItem id="staff" icon={Users} label="Staff Settings" />
              <NavItem id="clients" icon={Users} label="Client Settings" />
              <NavItem id="parcels" icon={Package} label="All Parcels" />
            </>
          )}

          {currentUser.role === UserRole.STAFF && (
            <>
              <NavItem id="parcels" icon={Package} label="Parcel Set" />
              <NavItem id="chat" icon={MessageSquare} label="Messages" />
              <NavItem id="notifications" icon={Bell} label="Notifications" />
            </>
          )}

          {currentUser.role === UserRole.CLIENT && (
            <>
              <NavItem id="my-parcels" icon={Package} label="My Parcels" />
              <NavItem id="chat" icon={MessageSquare} label="Support Chat" />
              <NavItem id="history" icon={BarChart3} label="History" />
            </>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="flex items-center gap-3 text-slate-500 px-4 py-2 hover:text-red-600 w-full transition">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <button className="lg:hidden text-slate-500" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          
          <h2 className="text-lg font-semibold text-slate-800 capitalize">
            {activeView.replace('-', ' ')}
          </h2>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-500 capitalize">{currentUser.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeView === 'dashboard' && (
              <DashboardStats 
                parcels={parcels} 
                users={users} 
                currentUser={currentUser} 
                aiAnalysis={aiAnalysis} 
                isLoadingAi={isLoadingAi} 
                triggerAiAnalysis={triggerAiAnalysis}
              />
            )}
            {activeView === 'staff' && (
              <ManageUsers 
                users={users} 
                setUsers={setUsers} 
                targetRole={UserRole.STAFF} 
              />
            )}
            {activeView === 'clients' && (
              <ManageUsers 
                users={users} 
                setUsers={setUsers} 
                targetRole={UserRole.CLIENT} 
              />
            )}
            {(activeView === 'parcels' || activeView === 'my-parcels' || activeView === 'history') && (
              <ParcelList 
                parcels={parcels} 
                setParcels={setParcels}
                currentUser={currentUser} 
                users={users}
              />
            )}
            {activeView === 'chat' && (
              <ChatSystem currentUser={currentUser} />
            )}
            {activeView === 'notifications' && (
                <Card>
                  <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                  <p className="text-slate-500">You have no pending email notifications to send.</p>
                </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
