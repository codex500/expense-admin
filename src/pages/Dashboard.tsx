import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Send, LogOut, Bell, Link as LinkIcon, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) {
      toast.error('Title and message are required');
      return;
    }

    setIsSending(true);
    try {
      const token = localStorage.getItem('admin_token');
      const payload = {
        title,
        body,
        data: url ? { url } : {}
      };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const { data } = await axios.post(
        `${apiUrl}/api/v3/notifications/admin/broadcast`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success(data.data?.message || 'Broadcast sent successfully!');
      setTitle('');
      setBody('');
      setUrl('');
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to send broadcast');
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Trackify Admin</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Push Notifications</h2>
          <p className="text-slate-400">Broadcast a message to all users instantly.</p>
        </div>

        <div className="glass-panel rounded-2xl p-6 md:p-8">
          <form onSubmit={handleBroadcast} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Notification Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="e.g. New Feature Alert! 🚀"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Message Body</label>
              <textarea 
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                placeholder="Write your message here..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Deep Link (Optional)</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="trackifyapp://analytics"
                />
              </div>
              <p className="text-xs text-slate-500 ml-1 mt-1">
                Where should the app open when the user taps the notification?
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button 
                type="submit" 
                disabled={isSending}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Broadcast</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
