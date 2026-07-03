import { useState } from 'react';
import { Users, Shield, User, Hash, Mail, Search, UserPlus, X, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MOCK_USERS } from '../../data/mockData';
import type { User as UserType } from '../../types';

const EXTRA_USERS: UserType[] = [
  ...MOCK_USERS,
  {
    id: 4, full_name: 'Ibrahim Bello', institutional_email: 'ibrahim@kwasu.edu.ng',
    role: 'standard_user', matric_or_staff_id: 'CSC/2020/088', created_at: '2024-09-01T08:00:00Z',
  },
  {
    id: 5, full_name: 'Aisha Mohammed', institutional_email: 'aisha@kwasu.edu.ng',
    role: 'standard_user', matric_or_staff_id: 'CSC/2023/012', created_at: '2024-09-01T08:00:00Z',
  },
  {
    id: 6, full_name: 'Officer James Bello', institutional_email: 'james.bello@kwasu.edu.ng',
    role: 'security_admin', matric_or_staff_id: 'SEC/008', created_at: '2024-01-15T08:00:00Z',
  },
];

const roleVariant = (role: string): 'danger' | 'info' | 'default' => {
  if (role === 'super_admin') return 'danger';
  if (role === 'security_admin') return 'info';
  return 'default';
};

const roleLabel = (role: string) => {
  if (role === 'super_admin') return 'Super Admin';
  if (role === 'security_admin') return 'Security Admin';
  return 'Student / Staff';
};

export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [usersList, setUsersList] = useState<UserType[]>(EXTRA_USERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ full_name: '', institutional_email: '', role: 'standard_user', matric_or_staff_id: '' });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserType = {
      id: Date.now(),
      full_name: newUserData.full_name,
      institutional_email: newUserData.institutional_email,
      role: newUserData.role as any,
      matric_or_staff_id: newUserData.matric_or_staff_id,
      created_at: new Date().toISOString()
    };
    setUsersList([newUser, ...usersList]);
    setShowAddModal(false);
    setNewUserData({ full_name: '', institutional_email: '', role: 'standard_user', matric_or_staff_id: '' });
  };

  const filtered = usersList
    .filter(u => filter === 'all' || u.role === filter)
    .filter(u =>
      search === '' ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.institutional_email.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        <div>
          <button onClick={() => window.location.href = '/admin-dashboard'} className="inline-flex items-center gap-1 text-sm text-red-700 hover:bg-red-50 px-2 py-1 -ml-2 rounded-lg transition font-medium mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              User Management
            </h2>
            <p className="text-sm text-gray-500">Manage all registered users and their access roles.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white text-sm font-semibold rounded-lg hover:bg-red-800 transition"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total Users', value: usersList.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Security Staff', value: usersList.filter(u => u.role !== 'standard_user').length, icon: Shield, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Students/Staff', value: usersList.filter(u => u.role === 'standard_user').length, icon: User, color: 'text-green-600', bg: 'bg-green-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardContent className="py-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex gap-2">
            {[
              { val: 'all', label: 'All' },
              { val: 'standard_user', label: 'Users' },
              { val: 'security_admin', label: 'Security' },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  filter === val ? 'bg-red-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* User list */}
        <div className="space-y-2">
          {filtered.map(user => (
            <Card key={user.id}>
              <CardContent className="py-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 ${
                      user.role !== 'standard_user' ? 'bg-red-700' : 'bg-blue-600'
                    }`}>
                      {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-0.5">
                        <span className="font-semibold text-sm text-gray-900 truncate">{user.full_name}</span>
                        <Badge variant={roleVariant(user.role)}>
                          {user.role !== 'standard_user' && <Shield className="w-3 h-3" />}
                          {roleLabel(user.role)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1 min-w-0"><Mail className="w-3 h-3 shrink-0" /><span className="truncate">{user.institutional_email}</span></span>
                        {user.matric_or_staff_id && (
                          <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{user.matric_or_staff_id}</span>
                        )}
                        <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0 sm:ml-auto">
                    <button className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition w-full sm:w-auto">
                      Edit
                    </button>
                    {user.role === 'standard_user' && (
                      <button className="text-xs px-3 py-1.5 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition w-full sm:w-auto">
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" value={newUserData.full_name} onChange={e => setNewUserData({...newUserData, full_name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. Adebayo Yusuf" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Institutional Email</label>
                <input required type="email" value={newUserData.institutional_email} onChange={e => setNewUserData({...newUserData, institutional_email: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. adebayo@kwasu.edu.ng" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Matric or Staff ID</label>
                <input required type="text" value={newUserData.matric_or_staff_id} onChange={e => setNewUserData({...newUserData, matric_or_staff_id: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. CSC/2021/010" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                <select value={newUserData.role} onChange={e => setNewUserData({...newUserData, role: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                  <option value="standard_user">Student / Staff</option>
                  <option value="security_admin">Security Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-red-700 text-white font-medium py-2.5 rounded-lg text-sm hover:bg-red-800 transition">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
