
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Package, Users, LayoutDashboard, MessageSquare, Settings, 
  LogOut, Bell, Plus, Search, CheckCircle, XCircle, Truck, 
  BarChart3, BrainCircuit, ChevronRight, Menu, X, Trash2, Eye, Loader2, Database, Code, ArrowRight,
  FileText, Mail, CheckCheck, Clock
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
  <div className={`bg-white rounded-lg shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    [ParcelStatus.DELIVERED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    [ParcelStatus.PENDING]: 'bg-amber-50 text-amber-700 border-amber-200',
    [ParcelStatus.IN_TRANSIT]: 'bg-blue-50 text-blue-700 border-blue-200',
    [ParcelStatus.DECLINED]: 'bg-red-50 text-red-700 border-red-200',
    [ParcelStatus.ACCEPTED]: 'bg-sky-50 text-sky-700 border-sky-200',
    'Active': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Inactive': 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
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

const SetupGuideModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col relative overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" /> Backend Setup Guide (PHP + MySQL)
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
        <div>
          <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">1</span> 
            Create Database
          </h4>
          <p className="text-slate-600 text-sm mb-3 ml-8">Go to <a href="http://localhost/phpmyadmin" target="_blank" className="text-blue-600 underline hover:text-blue-800">PHPMyAdmin</a>, create a database named <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-xs border border-slate-200">eparcel_db</code>, and run this SQL:</p>
          <div className="ml-8 relative group">
            <pre className="bg-slate-900 text-blue-100 p-4 rounded-lg text-xs overflow-x-auto font-mono border border-slate-700 shadow-inner">
{`CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'STAFF', 'CLIENT') NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    assigned_clients TEXT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parcels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    sender VARCHAR(255),
    client_id INT NOT NULL,
    handled_by INT NULL,
    status ENUM('Pending', 'Accepted', 'In Transit', 'Delivered', 'Declined') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO users (name, email, password, role, is_active) VALUES 
('System Admin', 'admin@eparcel.com', 'password', 'ADMIN', 1);`}
            </pre>
          </div>
        </div>

        <div>
           <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">2</span> 
            Create PHP Files
          </h4>
          <p className="text-slate-600 text-sm mb-3 ml-8">Navigate to <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-xs border border-slate-200">C:\xampp\htdocs\eparcel_api</code> and create these files:</p>
          
          <div className="space-y-6 ml-8">
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-600 flex justify-between items-center">
                <span>db_connect.php</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Required</span>
              </div>
              <pre className="bg-white text-slate-600 p-4 text-xs overflow-x-auto font-mono">
{`<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

$conn = new mysqli("localhost", "root", "", "eparcel_db");
if ($conn->connect_error) { die(json_encode(["error" => "Connection failed"])); }
$data = json_decode(file_get_contents("php://input"), true);
?>`}
              </pre>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-600">
                login.php
              </div>
              <pre className="bg-white text-slate-600 p-4 text-xs overflow-x-auto font-mono">
{`<?php
include 'db_connect.php';
$email = $conn->real_escape_string($data['email']);
$password = $data['password'];
$sql = "SELECT * FROM users WHERE email = '$email' AND password = '$password'";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    if ($user['is_active'] == 0) { echo json_encode(["error" => "Account inactive"]); } 
    else { echo json_encode(["user" => $user]); }
} else { echo json_encode(["error" => "Invalid credentials"]); }
$conn->close();
?>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
        <button onClick={onClose} className="bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition shadow-lg shadow-blue-900/20">Close Guide</button>
      </div>
    </div>
  </div>
);

const LoginScreen = ({ 
  authMode, setAuthMode, email, setEmail, password, setPassword, 
  handleLogin, handleRegister, error, isLoading
}: LoginScreenProps) => {
  const [showSetup, setShowSetup] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 relative z-10 border border-white/10">
        <div className="text-center mb-8">
          <div className="bg-blue-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-900/30">
            <Truck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">eParcel</h1>
          <p className="text-slate-500 mt-2 font-medium">Logistics Management System</p>
          <div className="mt-4 flex justify-center">
             <button onClick={() => setShowSetup(true)} className="text-xs flex items-center gap-1.5 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full font-medium hover:bg-blue-100 transition border border-blue-100">
               <Code className="w-3 h-3" /> Get PHP Backend Files
             </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg flex items-center border border-red-100">
            <XCircle className="w-5 h-5 mr-3 flex-shrink-0" /> {error}
          </div>
        )}

        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 tracking-wider">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 tracking-wider">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-slate-800 placeholder:text-slate-400"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-blue-700/30 flex justify-center items-center gap-2 mt-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
            <div className="flex justify-between text-sm mt-6">
              <button type="button" onClick={() => setAuthMode('forgot')} className="text-slate-500 hover:text-blue-700 font-medium">Forgot Password?</button>
              <button type="button" onClick={() => setAuthMode('register')} className="text-blue-700 font-bold hover:text-blue-800">Create Client Account</button>
            </div>
          </form>
        )}

        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 tracking-wider">Email Address</label>
              <input type="email" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 tracking-wider">Set Password</label>
              <input type="password" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 rounded-lg transition-colors flex justify-center shadow-lg shadow-blue-700/30">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register as Client'}
            </button>
            <button type="button" onClick={() => setAuthMode('login')} className="w-full text-slate-500 text-sm hover:text-slate-700 font-medium mt-2">
              Back to Login
            </button>
          </form>
        )}

        {authMode === 'forgot' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 text-center mb-2">Enter your email address and we'll send you a link to reset your password.</p>
            <input type="email" className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" placeholder="Email address" />
            <button onClick={() => { alert('Reset link sent (simulated)'); setAuthMode('login'); }} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-lg shadow-lg">Send Reset Link</button>
            <button type="button" onClick={() => setAuthMode('login')} className="w-full text-slate-500 text-sm hover:text-slate-700 font-medium">Back</button>
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-[11px] text-slate-400 text-center font-mono space-y-1">
          <p>Admin: admin@eparcel.com / password</p>
          <p>Staff: john@eparcel.com / password</p>
          <p>Client: clienta@corp.com / password</p>
        </div>
      </div>

      {showSetup && <SetupGuideModal onClose={() => setShowSetup(false)} />}
    </div>
  );
};

const DashboardStats = ({ parcels, users, currentUser, aiAnalysis, isLoadingAi, triggerAiAnalysis }: any) => {
  const roleStats = useMemo(() => {
    const totalParcels = parcels.length;
    const delivered = parcels.filter((p: Parcel) => p.status === ParcelStatus.DELIVERED).length;
    const pending = parcels.filter((p: Parcel) => p.status === ParcelStatus.PENDING).length;
    const staffActive = users.filter((u: User) => u.role === UserRole.STAFF && u.isActive).length;
    
    // Updated chart colors for professional look
    const statusData = [
      { name: 'Delivered', value: delivered, color: '#059669' }, // Emerald 600
      { name: 'Pending', value: pending, color: '#d97706' }, // Amber 600
      { name: 'In Transit', value: totalParcels - delivered - pending, color: '#2563eb' }, // Blue 600
    ];

    return { totalParcels, delivered, pending, staffActive, statusData };
  }, [parcels, users]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-[6px] border-l-blue-700 hover:shadow-lg transition-shadow">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Parcels</h3>
          <p className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight">{roleStats.totalParcels}</p>
        </Card>
        <Card className="border-l-[6px] border-l-emerald-600 hover:shadow-lg transition-shadow">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Delivered</h3>
          <p className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight">{roleStats.delivered}</p>
        </Card>
        <Card className="border-l-[6px] border-l-amber-500 hover:shadow-lg transition-shadow">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending</h3>
          <p className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight">{roleStats.pending}</p>
        </Card>
        {currentUser?.role === UserRole.ADMIN && (
          <Card className="border-l-[6px] border-l-violet-600 hover:shadow-lg transition-shadow">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Staff</h3>
            <p className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight">{roleStats.staffActive}</p>
          </Card>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <BrainCircuit className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <BrainCircuit className="text-blue-700 w-5 h-5" />
              </div>
              <h3 className="font-bold text-blue-900 text-lg">AI Executive Summary</h3>
            </div>
            <button 
              onClick={triggerAiAnalysis}
              disabled={isLoadingAi}
              className="text-xs font-semibold bg-white text-blue-700 border border-blue-200 px-4 py-2 rounded-full hover:bg-blue-50 transition shadow-sm"
            >
              {isLoadingAi ? 'Analyzing Data...' : 'Generate Insight'}
            </button>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed max-w-3xl relative z-10 mt-2">
            {aiAnalysis || "Click 'Generate Insight' to receive an AI-powered strategic analysis of your current logistics performance and key operational metrics."}
          </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-400" /> Parcel Status Distribution
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie 
                  data={roleStats.statusData} 
                  innerRadius={70} 
                  outerRadius={90} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {roleStats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-400" /> Monthly Activity
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Jan', val: 40 }, { name: 'Feb', val: 30 }, { name: 'Mar', val: 20 },
                { name: 'Apr', val: 27 }, { name: 'May', val: 18 }, { name: 'Jun', val: 23 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="val" fill="#1e40af" radius={[4, 4, 0, 0]} barSize={40} />
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
          <h2 className="text-xl font-bold text-slate-800">Manage {targetRole === UserRole.STAFF ? 'Staff' : 'Clients'}</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-lg hover:bg-blue-800 transition shadow-md shadow-blue-900/10 font-medium"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {targetUsers.map((user: User) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 text-slate-900 font-semibold">{user.name}</td>
                  <td className="py-4 px-6 text-slate-600">{user.email}</td>
                  <td className="py-4 px-6">
                    <Badge status={user.isActive ? 'Active' : 'Inactive'} />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => toggleUserStatus(user.id, user.isActive)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-md transition border ${user.isActive ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' : 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700'}`}
                    >
                      {user.isActive ? 'Deactivate' : 'Approve Access'}
                    </button>
                  </td>
                </tr>
              ))}
              {targetUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400 italic">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
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
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Default Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition shadow-lg shadow-blue-700/20 flex justify-center"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create User'}
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-slate-800">Parcel Records</h2>
          {(currentUser?.role === UserRole.STAFF) && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-lg hover:bg-blue-800 transition shadow-md shadow-blue-900/10 font-medium"
            >
              <Plus className="w-4 h-4" /> Register Parcel
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Search by Tracking ID..." 
               className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 bg-white"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)} 
             />
           </div>
           <select 
             className="border border-slate-200 rounded-lg px-4 py-2 text-slate-600 outline-none focus:ring-2 focus:ring-blue-600 bg-white min-w-[150px]"
             value={filterStatus}
             onChange={(e) => setFilterStatus(e.target.value)}
           >
             <option value="All">All Status</option>
             {Object.values(ParcelStatus).map((status) => (
               <option key={status} value={status}>{status}</option>
             ))}
           </select>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-4 px-6">Tracking ID</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Last Update</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleParcels.map((parcel: Parcel) => (
                <tr key={parcel.id} className="hover:bg-slate-50/50 transition group">
                  <td className="py-4 px-6 font-mono text-blue-700 font-bold">{parcel.trackingNumber}</td>
                  <td className="py-4 px-6 text-slate-700 font-medium">{parcel.description}</td>
                  <td className="py-4 px-6"><Badge status={parcel.status} /></td>
                  <td className="py-4 px-6 text-slate-500 text-sm">{parcel.dateUpdated}</td>
                  <td className="py-4 px-6 text-right flex justify-end gap-2 items-center">
                    {currentUser?.role === UserRole.STAFF && (
                      <>
                        <button onClick={() => handleUpdateStatus(parcel.id, ParcelStatus.ACCEPTED)} className="p-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded hover:bg-emerald-100 transition" title="Accept"><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={() => handleUpdateStatus(parcel.id, ParcelStatus.DECLINED)} className="p-1.5 text-amber-600 bg-amber-50 border border-amber-100 rounded hover:bg-amber-100 transition" title="Decline"><XCircle className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(parcel.id)} className="p-1.5 text-red-600 bg-red-50 border border-red-100 rounded hover:bg-red-100 transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                    {currentUser?.role === UserRole.CLIENT && (
                      <>
                        {parcel.status !== ParcelStatus.DELIVERED && parcel.status !== ParcelStatus.DECLINED && (
                          <>
                            <button onClick={() => handleUpdateStatus(parcel.id, ParcelStatus.DELIVERED)} className="px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition mr-1">Confirm Receipt</button>
                            <button onClick={() => handleUpdateStatus(parcel.id, ParcelStatus.DECLINED)} className="p-1.5 text-red-600 bg-red-50 border border-red-100 rounded hover:bg-red-100 transition" title="Report Issue"><XCircle className="w-4 h-4" /></button>
                          </>
                        )}
                      </>
                    )}
                     <button onClick={() => setSelectedParcel(parcel)} className="text-slate-400 hover:text-blue-600 p-1.5 transition ml-1" title="View Full Details"><Eye className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
              {visibleParcels.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 italic">No parcels found matching your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-slate-800 mb-1">Register New Parcel</h3>
            <p className="text-slate-500 text-sm mb-6">Enter the details to create a new parcel record.</p>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Tracking Number</label>
                <input type="text" required placeholder="e.g. EP-1001" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" value={newParcel.trackingNumber} onChange={e => setNewParcel({...newParcel, trackingNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Description</label>
                <input type="text" required placeholder="e.g. Office Supplies" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" value={newParcel.description} onChange={e => setNewParcel({...newParcel, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Sender</label>
                <input type="text" required placeholder="e.g. Amazon" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" value={newParcel.sender} onChange={e => setNewParcel({...newParcel, sender: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Assign to Client</label>
                <select required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" value={newParcel.clientId} onChange={e => setNewParcel({...newParcel, clientId: e.target.value})}>
                  <option value="">Select a Client</option>
                  {clients.map((client: User) => (
                    <option key={client.id} value={client.id}>{client.name} ({client.email})</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2.5 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition flex justify-center shadow-lg shadow-blue-700/20">{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Parcel'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* View Details Modal */}
      {selectedParcel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-0 relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 p-6 flex justify-between items-start">
               <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{selectedParcel.trackingNumber}</h3>
                  <p className="text-slate-400 text-sm mt-1">Parcel Details & History</p>
               </div>
               <button onClick={() => setSelectedParcel(null)} className="text-slate-400 hover:text-white transition"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-8">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                    <span className="text-slate-500 font-medium text-sm uppercase tracking-wide">Current Status</span>
                    <Badge status={selectedParcel.status} />
                </div>
                
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                        <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Description</p>
                        <p className="text-slate-800 font-medium">{selectedParcel.description}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Sender</p>
                        <p className="text-slate-800 font-medium">{selectedParcel.sender}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Created</p>
                        <p className="text-slate-800 font-medium">{selectedParcel.dateCreated}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Last Update</p>
                        <p className="text-slate-800 font-medium">{selectedParcel.dateUpdated}</p>
                    </div>
                    {selectedParcel.handledBy && (
                        <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Handled By Staff ID</p>
                            <p className="text-slate-800 font-mono text-sm">{selectedParcel.handledBy}</p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="bg-slate-50 p-4 flex justify-end border-t border-slate-100">
                <button onClick={() => setSelectedParcel(null)} className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition shadow-sm">Close View</button>
            </div>
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
    <Card className="h-[600px] flex flex-col p-0 overflow-hidden">
      <div className="border-b border-slate-200 p-4 bg-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-full text-white">
                <MessageSquare className="w-5 h-5" />
            </div>
            <div>
                <h2 className="font-bold text-slate-800 text-sm">Support Chat</h2>
                <p className="text-xs text-slate-500">Live Assistance</p>
            </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full border border-emerald-200">AI Active</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-6 p-6 bg-white">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <form onSubmit={handleSend} className="relative">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." className="w-full bg-white border border-slate-200 rounded-lg py-3 pl-4 pr-12 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm" />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition"><ArrowRight className="w-4 h-4" /></button>
        </form>
      </div>
    </Card>
  );
};

// --- Notification History View ---
const NotificationHistory = ({ notifications, markAllAsRead, currentUser }: any) => {
  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
             <Bell className="w-5 h-5 text-blue-700" /> Notification History
           </h2>
           <p className="text-slate-500 text-sm mt-1">Alerts and system messages for {currentUser?.name}</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="text-sm font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 transition flex items-center gap-2"
        >
          <CheckCheck className="w-4 h-4" /> Mark All Read
        </button>
      </div>
      
      <div className="space-y-1">
        {notifications.length > 0 ? (
          notifications.map((n: any) => (
             <div key={n.id} className={`p-4 rounded-lg flex items-start gap-4 transition border ${n.unread ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-transparent hover:bg-slate-50'}`}>
                <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${n.unread ? 'bg-blue-600 ring-4 ring-blue-50' : 'bg-slate-300'}`}></div>
                <div className="flex-1">
                   <div className="flex justify-between items-start">
                      <h4 className={`text-sm ${n.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>{n.title}</h4>
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {n.time}</span>
                   </div>
                   <p className="text-slate-600 text-sm mt-1 leading-relaxed">{n.desc}</p>
                </div>
             </div>
          ))
        ) : (
          <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-lg border border-slate-100">
             <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
             <p>No notifications found.</p>
          </div>
        )}
      </div>
    </Card>
  );
}


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
  const [showNotifications, setShowNotifications] = useState(false);

  // Notification State
  const [notifications, setNotifications] = useState<any[]>([]);

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

  // --- Initialize Notifications based on User Role ---
  useEffect(() => {
    if (!currentUser) {
        setNotifications([]);
        return;
    }
    
    let initialNotifs: any[] = [];
    if (currentUser.role === UserRole.ADMIN) {
        initialNotifs = [
            { id: 1, title: 'New Client Registration', desc: 'Client Corp requested account approval.', time: '5m ago', unread: true },
            { id: 2, title: 'System Alert', desc: 'Database backup completed successfully.', time: '1h ago', unread: false },
             { id: 3, title: 'Staff Performance', desc: 'Weekly analytics report is ready.', time: '2h ago', unread: false },
        ];
    } else if (currentUser.role === UserRole.STAFF) {
        initialNotifs = [
            { id: 1, title: 'New Parcel Assigned', desc: 'You have been assigned to EP-9941.', time: '10m ago', unread: true },
            { id: 2, title: 'Urgent Message', desc: 'Client A is asking about delivery.', time: '30m ago', unread: true },
        ];
    } else {
        initialNotifs = [
            { id: 1, title: 'Parcel Delivered', desc: 'Package EP-8832 has been delivered.', time: 'Just now', unread: true },
            { id: 2, title: 'Out for Delivery', desc: 'Your parcel EP-1122 is near.', time: '4h ago', unread: false },
        ];
    }
    setNotifications(initialNotifs);
  }, [currentUser]);

  // --- Notification Handlers ---
  const handleNotificationClick = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleViewHistory = () => {
    setActiveView('notification-history');
    setShowNotifications(false);
  };

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
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 text-blue-700 animate-spin" /></div>;
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
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all text-sm font-medium ${
        activeView === id 
        ? 'bg-blue-700 text-white shadow-lg shadow-blue-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Modern Dark Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 text-white font-bold text-2xl tracking-tight">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
              <Truck className="w-6 h-6" />
            </div>
            eParcel
          </div>
          <p className="text-slate-500 text-xs font-medium ml-[3.25rem] mt-1 tracking-wider uppercase">Logistics Platform</p>
        </div>
        
        <div className="px-4 py-6 space-y-1.5 flex-1 overflow-y-auto">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-2 mt-2">Menu</div>
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          
          {currentUser.role === UserRole.ADMIN && (
            <>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-2 mt-6">Administration</div>
              <NavItem id="staff" icon={Users} label="Staff Management" />
              <NavItem id="clients" icon={Users} label="Client Management" />
              <NavItem id="parcels" icon={Package} label="All Parcels" />
            </>
          )}

          {currentUser.role === UserRole.STAFF && (
            <>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-2 mt-6">Operations</div>
              <NavItem id="parcels" icon={Package} label="Parcel Set" />
              <NavItem id="chat" icon={MessageSquare} label="Messages" />
              <NavItem id="notifications" icon={Bell} label="Notifications" />
            </>
          )}

          {currentUser.role === UserRole.CLIENT && (
            <>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-2 mt-6">My Account</div>
              <NavItem id="my-parcels" icon={Package} label="My Parcels" />
              <NavItem id="chat" icon={MessageSquare} label="Support Chat" />
              <NavItem id="history" icon={BarChart3} label="History" />
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 px-4 py-3 hover:text-white hover:bg-slate-800 w-full transition rounded-lg text-sm font-medium">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center shadow-sm sticky top-0 z-10">
          <button className="lg:hidden text-slate-500" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          
          <h2 className="text-xl font-bold text-slate-800 capitalize tracking-tight flex items-center gap-2">
            {activeView.replace('-', ' ')}
          </h2>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-blue-600 transition outline-none"
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>
              
              {showNotifications && (
                 <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                            <button onClick={markAllAsRead} className="text-xs text-blue-600 font-medium hover:text-blue-800">Mark all read</button>
                        </div>
                        <div className="max-h-[320px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map(n => (
                                    <div 
                                      key={n.id} 
                                      onClick={() => handleNotificationClick(n.id)}
                                      className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition cursor-pointer flex gap-3 ${n.unread ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.unread ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                                        <div>
                                            <p className={`text-sm ${n.unread ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>{n.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                                            <p className="text-[10px] text-slate-400 mt-1.5">{n.time}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-sm">No new notifications</div>
                            )}
                        </div>
                        <div className="p-2 border-t border-slate-50 bg-slate-50 text-center">
                            <button onClick={handleViewHistory} className="text-xs font-bold text-slate-600 hover:text-blue-700 transition">View All History</button>
                        </div>
                    </div>
                 </>
              )}
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
              <div className="text-right hidden md:block leading-tight">
                <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{currentUser.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-700 font-bold text-lg">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
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
                  <h3 className="text-lg font-bold mb-4 text-slate-800">Send Notification</h3>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-8 text-center text-slate-500">
                     <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                     <p>You have no pending email notifications to send to clients.</p>
                     <button className="mt-4 px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-sm font-medium hover:text-blue-700">Compose New Email</button>
                  </div>
                </Card>
            )}
             {activeView === 'notification-history' && (
              <NotificationHistory 
                notifications={notifications} 
                markAllAsRead={markAllAsRead} 
                currentUser={currentUser}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
