import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, Users, LayoutDashboard, MessageSquare, Settings, 
  LogOut, Bell, Plus, Search, CheckCircle, XCircle, Truck, 
  BarChart3, PieChart, BrainCircuit, ChevronRight, Menu, X
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell 
} from 'recharts';
import { User, UserRole, Parcel, ParcelStatus, Message } from './types';
import { generateDashboardAnalysis, simulateChatResponse } from './services/geminiService';

// --- Mock Data Initialization ---
const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@eparcel.com', role: UserRole.ADMIN, isActive: true, password: 'password' },
  { id: 'u2', name: 'John Staff', email: 'john@eparcel.com', role: UserRole.STAFF, isActive: true, assignedClients: ['u4'], password: 'password' },
  { id: 'u3', name: 'Sarah Staff', email: 'sarah@eparcel.com', role: UserRole.STAFF, isActive: false, assignedClients: [], password: 'password' },
  { id: 'u4', name: 'Client A Corp', email: 'clienta@corp.com', role: UserRole.CLIENT, isActive: true, password: 'password' },
  { id: 'u5', name: 'Client B Ltd', email: 'clientb@ltd.com', role: UserRole.CLIENT, isActive: true, password: 'password' },
];

const INITIAL_PARCELS: Parcel[] = [
  { id: 'p1', trackingNumber: 'EP-8832', sender: 'Warehouse A', clientId: 'u4', description: 'Electronics', status: ParcelStatus.DELIVERED, dateCreated: '2023-10-01', dateUpdated: '2023-10-05', handledBy: 'u2' },
  { id: 'p2', trackingNumber: 'EP-9941', sender: 'Warehouse B', clientId: 'u4', description: 'Documents', status: ParcelStatus.PENDING, dateCreated: '2023-10-25', dateUpdated: '2023-10-25' },
  { id: 'p3', trackingNumber: 'EP-1122', sender: 'Supplier X', clientId: 'u5', description: 'Furniture', status: ParcelStatus.IN_TRANSIT, dateCreated: '2023-10-24', dateUpdated: '2023-10-26', handledBy: 'u2' },
  { id: 'p4', trackingNumber: 'EP-3344', sender: 'Amazon', clientId: 'u4', description: 'Books', status: ParcelStatus.DECLINED, dateCreated: '2023-10-20', dateUpdated: '2023-10-21', handledBy: 'u3' },
];

// --- Components ---

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

// --- Application ---

export default function App() {
  // Global State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [parcels, setParcels] = useState<Parcel[]>(INITIAL_PARCELS);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // UI State
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // --- Actions ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      if (!user.isActive) {
        setError("Account is inactive. Contact Admin.");
        return;
      }
      setCurrentUser(user);
      setActiveView('dashboard');
      setError('');
      setAiAnalysis(''); 
    } else {
      setError("Invalid credentials");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `u${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: UserRole.CLIENT, // Only clients register externally
      isActive: false, // Requires approval
      password
    };
    setUsers([...users, newUser]);
    alert("Registration successful! Please wait for Administrator approval.");
    setAuthMode('login');
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
    
    // Calculate stats for AI
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

  // --- Views ---

  const LoginScreen = () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Truck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">eParcel System</h1>
          <p className="text-slate-500 mt-2">Logistics Management Platform</p>
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
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-md shadow-indigo-200">
              Sign In
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
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors">
              Register as Client
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

  // --- Internal Dashboard Components ---

  const DashboardStats = () => {
    // Calculate stats based on role
    const roleStats = useMemo(() => {
      const totalParcels = parcels.length;
      const delivered = parcels.filter(p => p.status === ParcelStatus.DELIVERED).length;
      const pending = parcels.filter(p => p.status === ParcelStatus.PENDING).length;
      const staffActive = users.filter(u => u.role === UserRole.STAFF && u.isActive).length;
      
      // Charts Data
      const statusData = [
        { name: 'Delivered', value: delivered, color: '#10b981' },
        { name: 'Pending', value: pending, color: '#f59e0b' },
        { name: 'In Transit', value: totalParcels - delivered - pending, color: '#6366f1' },
      ];

      return { totalParcels, delivered, pending, staffActive, statusData };
    }, [parcels, users]);

    return (
      <div className="space-y-6">
        {/* Top Cards */}
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

        {/* AI Insight Section */}
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

        {/* Charts Area */}
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
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Activity (Simulated)</h3>
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

  const ManageUsers = ({ targetRole }: { targetRole: UserRole }) => {
    const targetUsers = users.filter(u => u.role === targetRole);

    const toggleUserStatus = (id: string) => {
      setUsers(users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
    };

    return (
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Manage {targetRole === UserRole.STAFF ? 'Staff' : 'Clients'}</h2>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
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
              {targetUsers.map(user => (
                <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                  <td className="py-4 text-slate-800 font-medium">{user.name}</td>
                  <td className="py-4 text-slate-500">{user.email}</td>
                  <td className="py-4">
                    <Badge status={user.isActive ? 'Active' : 'Inactive'} />
                  </td>
                  <td className="py-4 text-right">
                    <button 
                      onClick={() => toggleUserStatus(user.id)}
                      className={`text-sm px-3 py-1 rounded-md transition ${user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                    >
                      {user.isActive ? 'Deactivate' : 'Approve/Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  const ParcelList = () => {
    // Filter parcels based on user role
    const visibleParcels = parcels.filter(p => {
      if (currentUser?.role === UserRole.ADMIN) return true;
      if (currentUser?.role === UserRole.STAFF) return true; // Staff sees all (or assigned, simplified here)
      if (currentUser?.role === UserRole.CLIENT) return p.clientId === currentUser.id;
      return false;
    });

    return (
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Parcel Records</h2>
          {(currentUser?.role === UserRole.STAFF || currentUser?.role === UserRole.ADMIN) && (
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
              <Plus className="w-4 h-4" /> Register Parcel
            </button>
          )}
        </div>
        <div className="flex gap-4 mb-6">
           <div className="relative flex-1 max-w-sm">
             <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
             <input type="text" placeholder="Search tracking number..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
           </div>
           <select className="border border-slate-200 rounded-lg px-4 py-2 text-slate-600 outline-none">
             <option>All Status</option>
             <option>Delivered</option>
             <option>Pending</option>
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
              {visibleParcels.map(parcel => (
                <tr key={parcel.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                  <td className="py-4 font-mono text-indigo-600 font-medium">{parcel.trackingNumber}</td>
                  <td className="py-4 text-slate-600">{parcel.description}</td>
                  <td className="py-4"><Badge status={parcel.status} /></td>
                  <td className="py-4 text-slate-500 text-sm">{parcel.dateUpdated}</td>
                  <td className="py-4 text-right flex justify-end gap-2">
                    {currentUser?.role !== UserRole.CLIENT && (
                      <>
                        <button title="Accept" className="p-1.5 text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100"><CheckCircle className="w-4 h-4" /></button>
                        <button title="Decline" className="p-1.5 text-red-600 bg-red-50 rounded hover:bg-red-100"><XCircle className="w-4 h-4" /></button>
                      </>
                    )}
                     <button className="text-slate-400 hover:text-slate-600"><ChevronRight className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  const ChatSystem = () => {
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

      // Simulate AI reply
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
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-5 pr-12 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition">
            <MessageSquare className="w-4 h-4" />
          </button>
        </form>
      </Card>
    );
  };

  // --- Main Layout ---

  if (!currentUser) return <LoginScreen />;

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
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
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
          
          {/* Admin Menus */}
          {currentUser.role === UserRole.ADMIN && (
            <>
              <NavItem id="staff" icon={Users} label="Staff Settings" />
              <NavItem id="clients" icon={Users} label="Client Settings" />
              <NavItem id="parcels" icon={Package} label="All Parcels" />
            </>
          )}

          {/* Staff Menus */}
          {currentUser.role === UserRole.STAFF && (
            <>
              <NavItem id="parcels" icon={Package} label="Parcel Set" />
              <NavItem id="chat" icon={MessageSquare} label="Messages" />
              <NavItem id="notifications" icon={Bell} label="Notifications" />
            </>
          )}

          {/* Client Menus */}
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
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

        {/* Page Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeView === 'dashboard' && <DashboardStats />}
            {activeView === 'staff' && <ManageUsers targetRole={UserRole.STAFF} />}
            {activeView === 'clients' && <ManageUsers targetRole={UserRole.CLIENT} />}
            {(activeView === 'parcels' || activeView === 'my-parcels' || activeView === 'history') && <ParcelList />}
            {activeView === 'chat' && <ChatSystem />}
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