import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  db,
  auth,
  signInWithCustomToken,
  signOut,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  getDoc,
} from '../config/firebaseConfig';
import {
  Users,
  Database,
  Settings,
  ShieldAlert,
  Activity,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
  LogOut,
  Download,
  Search,
  Filter,
} from 'lucide-react';
import { Toast } from '../../components/Toast';
import { INTEREST_OPTIONS, ANDROID_VERSION_OPTIONS } from '../utils/validation';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'early_birds' | 'requests' | 'users' | 'database'>('early_birds');

  const [earlyBirds, setEarlyBirds] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters for Early Birds Lead Management
  const [searchQuery, setSearchQuery] = useState('');
  const [androidFilter, setAndroidFilter] = useState<string>('ALL');
  const [interestFilter, setInterestFilter] = useState<string>('ALL');
  const [selectionFilter, setSelectionFilter] = useState<string>('ALL');

  useEffect(() => {
    const savedToken = sessionStorage.getItem('af_admin_token');
    if (savedToken) {
      setAdminToken(savedToken);
      setIsAdminLoggedIn(true);
      fetchData(savedToken);
    }
  }, []);

  const fetchData = async (tokenOverride?: string | null) => {
    const token = tokenOverride ?? adminToken;
    setLoading(true);
    try {
      // 1. Fetch Early Birds applications from authorized admin endpoint
      if (token) {
        const ebRes = await fetch('/api/admin/early-birds', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ebRes.ok) {
          const ebJson = await ebRes.json();
          if (Array.isArray(ebJson.items)) {
            setEarlyBirds(ebJson.items);
          }
        }
      }

      // 2. Also attempt Firestore read if signed in with Firebase admin account
      try {
        if (auth.currentUser && !auth.currentUser.isAnonymous) {
          const ebSnap = await getDocs(query(collection(db, 'early_birds'), orderBy('createdAt', 'desc')));
          if (!ebSnap.empty) {
            const fsItems = ebSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setEarlyBirds((prev) => {
              const map = new Map(prev.map((i) => [i.id, i]));
              fsItems.forEach((f) => map.set(f.id, f));
              return Array.from(map.values());
            });
          }
        }
      } catch {
        // Fallback to server-side API list
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to fetch data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      sessionStorage.setItem('af_admin_token', data.token);
      setAdminToken(data.token);
      setIsAdminLoggedIn(true);
      setToast({ message: 'Admin login successful', type: 'success' });
      await fetchData(data.token);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('af_admin_token');
    setAdminToken(null);
    setIsAdminLoggedIn(false);
    try {
      await signOut(auth);
    } catch {}
    navigate('/');
  };

  const handleUpdateEarlyBird = async (id: string, patch: Record<string, any>) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/early-birds/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Update failed');
      }
      setEarlyBirds((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
      );
      setToast({ message: 'Applicant record updated.', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Could not update record', type: 'error' });
    }
  };

  const filteredEarlyBirds = useMemo(() => {
    return earlyBirds.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchEmail = (item.email || '').toLowerCase().includes(q);
        const matchName = (item.name || '').toLowerCase().includes(q);
        if (!matchEmail && !matchName) return false;
      }
      if (androidFilter !== 'ALL' && item.androidVersion !== androidFilter) {
        return false;
      }
      if (
        interestFilter !== 'ALL' &&
        (!Array.isArray(item.interests) || !item.interests.includes(interestFilter))
      ) {
        return false;
      }
      if (selectionFilter !== 'ALL' && item.selectionStatus !== selectionFilter) {
        return false;
      }
      return true;
    });
  }, [earlyBirds, searchQuery, androidFilter, interestFilter, selectionFilter]);

  const handleExportCsv = () => {
    const headers = [
      'Name',
      'Email',
      'NormalizedEmail',
      'AndroidVersion',
      'Interests',
      'Status',
      'SelectionStatus',
      'InvitationSent',
      'TestingCompleted',
      'FeedbackReceived',
      'MarketingUpdates',
      'CreatedAt',
    ];
    const rows = filteredEarlyBirds.map((item) => [
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `"${(item.normalizedEmail || '').replace(/"/g, '""')}"`,
      `"${item.androidVersion || ''}"`,
      `"${Array.isArray(item.interests) ? item.interests.join('; ') : ''}"`,
      `"${item.status || 'applied'}"`,
      `"${item.selectionStatus || 'pending'}"`,
      item.testingInvitationSent ? 'true' : 'false',
      item.testingCompleted ? 'true' : 'false',
      item.testingFeedbackReceived ? 'true' : 'false',
      item.consent?.marketingUpdates ? 'true' : 'false',
      `"${item.createdAt || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audiofactory_early_birds_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-white mb-2">AudioFACTORY Admin</h1>
          <p className="text-zinc-400 text-center mb-8 text-sm">
            Restricted Early Birds &amp; Studio Lead Console
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
              Authorize Access
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Admin Header */}
      <header className="bg-zinc-900 text-white border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
            <h1 className="font-bold text-lg tracking-tight">AudioFACTORY Admin Console</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-60 shrink-0">
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('early_birds')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'early_birds'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <Activity className="w-5 h-5" />
              Early Birds 🕊️ Leads
              <span className="ml-auto font-mono text-xs tabular-nums opacity-80">
                {earlyBirds.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'database'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <Database className="w-5 h-5" />
              System Diagnostics
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden"
            >
              {activeTab === 'early_birds' && (
                <div>
                  <div className="px-6 py-5 border-b border-zinc-200 bg-zinc-50/70 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <h2 className="font-semibold text-lg">Early Birds v2.0.0 Applications</h2>
                      <p className="text-xs text-zinc-500">
                        Manage Google Play testing invitations, selection status, and feedback completion.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fetchData()}
                        className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 cursor-pointer"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={handleExportCsv}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV ({filteredEarlyBirds.length})
                      </button>
                    </div>
                  </div>

                  {/* Filter Bar */}
                  <div className="p-4 border-b border-zinc-200 bg-white grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search email or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
                      />
                    </div>

                    <select
                      value={androidFilter}
                      onChange={(e) => setAndroidFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs border border-zinc-300 rounded-lg bg-white"
                    >
                      <option value="ALL">All Android Versions</option>
                      {ANDROID_VERSION_OPTIONS.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>

                    <select
                      value={interestFilter}
                      onChange={(e) => setInterestFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs border border-zinc-300 rounded-lg bg-white"
                    >
                      <option value="ALL">All Interests</option>
                      {INTEREST_OPTIONS.map((i) => (
                        <option key={i.value} value={i.value}>
                          {i.value}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectionFilter}
                      onChange={(e) => setSelectionFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs border border-zinc-300 rounded-lg bg-white"
                    >
                      <option value="ALL">All Selection Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="selected">Selected</option>
                      <option value="waitlisted">Waitlisted</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>

                  {/* Applications List */}
                  <div className="divide-y divide-zinc-200">
                    {filteredEarlyBirds.length === 0 ? (
                      <div className="p-10 text-center text-zinc-500 text-sm">
                        No Early Birds applications match the current filters.
                      </div>
                    ) : (
                      filteredEarlyBirds.map((app) => (
                        <div key={app.id} className="p-5 hover:bg-zinc-50/70 transition-colors space-y-3">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-zinc-900">{app.name}</span>
                                <span className="text-zinc-400">·</span>
                                <span className="font-mono text-xs text-zinc-700">{app.email}</span>
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 font-mono tabular-nums">
                                <span>{app.androidVersion || 'Not sure'}</span>
                                <span>·</span>
                                <span>
                                  Interests:{' '}
                                  {Array.isArray(app.interests) && app.interests.length > 0
                                    ? app.interests.join(', ')
                                    : 'None specified'}
                                </span>
                                <span>·</span>
                                <span>
                                  Marketing Opt-In: {app.consent?.marketingUpdates ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                value={app.selectionStatus || 'pending'}
                                onChange={(e) =>
                                  handleUpdateEarlyBird(app.id, { selectionStatus: e.target.value })
                                }
                                className="px-2.5 py-1 text-xs font-medium border border-zinc-300 rounded-lg bg-white"
                              >
                                <option value="pending">Pending</option>
                                <option value="selected">Selected</option>
                                <option value="waitlisted">Waitlisted</option>
                                <option value="declined">Declined</option>
                              </select>
                            </div>
                          </div>

                          {/* Participation Checkboxes */}
                          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-zinc-100 text-xs text-zinc-700">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(app.testingInvitationSent)}
                                onChange={(e) =>
                                  handleUpdateEarlyBird(app.id, {
                                    testingInvitationSent: e.target.checked,
                                  })
                                }
                                className="rounded border-zinc-300"
                              />
                              <span>Invitation Sent</span>
                            </label>

                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(app.testingCompleted)}
                                onChange={(e) =>
                                  handleUpdateEarlyBird(app.id, {
                                    testingCompleted: e.target.checked,
                                  })
                                }
                                className="rounded border-zinc-300"
                              />
                              <span>Testing Completed</span>
                            </label>

                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(app.testingFeedbackReceived)}
                                onChange={(e) =>
                                  handleUpdateEarlyBird(app.id, {
                                    testingFeedbackReceived: e.target.checked,
                                  })
                                }
                                className="rounded border-zinc-300"
                              />
                              <span>Feedback Received</span>
                            </label>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'database' && (
                <div className="p-8 text-center text-zinc-500">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-medium text-zinc-900 mb-2">Firebase Firestore Project: audiofactory-eia</p>
                  <p className="text-sm max-w-md mx-auto">
                    All Early Birds records are stored in the <span className="font-mono">early_birds</span> collection with server-salted HMAC-SHA256 document keys and strict admin-only read rules.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
