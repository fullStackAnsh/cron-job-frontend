'use client';
import { useEffect, useState, useCallback, MouseEvent } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Edit2, Activity, Clock, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

interface Job {
  id: string;
  name: string;
  url: string;
  cron?: string;
  run_at?: string;
  timezone: string;
}

const formatProfile = (job: Job) => {
  if (job.cron) return job.cron;
  if (job.run_at) {
    const date = new Date(job.run_at);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  return '—';
};

// --- Stats Summary Component ---
function StatsSummary({ jobs }: { jobs: Job[] | null }) {
  const [stats, setStats] = useState({ total: 0, lastRun: 'No runs yet' });
 
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      if (!jobs || jobs.length === 0) return;
      const jobIds = jobs.map(j => j.id);
      const { data, count } = await supabase
        .from('job_logs')
        .select('triggered_at', { count: 'exact' })
        .in('job_id', jobIds)
        .order('triggered_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const date = new Date(data[0].triggered_at);
        setStats({
          total: count || 0,
          lastRun: new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          }).format(date)
        });
      }
    }
    fetchStats();
  }, [jobs, supabase]);

  return (
    <div className="bg-white border border-[#EFEFEC]/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div className="space-y-6">
        <h3 className="text-sm font-bold text-[#283711] uppercase tracking-wider">Overview</h3>
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-[#BDBDBB]">Total Executions</p>
          <div className="flex items-center gap-4">
            <p className="text-5xl font-extrabold text-[#283711] tracking-tight">{stats.total}</p>
            <div className="flex flex-col gap-1 items-start">
              <div className="flex items-center gap-1 text-[#89d45c]">
                <TrendingUp className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase">Recent</span>
              </div>
              <div className="px-2 py-0.5 rounded-md bg-[#EFEFEC]/50 border border-[#EFEFEC] text-[10px] font-medium text-[#283711]">
                {stats.lastRun}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Link href="/dashboard/create" className="mt-8 flex items-center justify-center gap-2 bg-[#9EE970] text-[#283711] hover:bg-[#89d45c] py-3 rounded-xl font-bold transition-all shadow-sm">
        <Plus className="h-4 w-4" /> Create New Cron
      </Link>
    </div>
  );
}

// --- Chart Component ---
function JobActivityGraph({ jobs }: { jobs: Job[] | null }) {
  const [data, setData] = useState<{ time: string; count: number }[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchLogs() {
      if (!jobs || jobs.length === 0) return;
      const jobIds = jobs.map(j => j.id);
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: logs } = await supabase.from('job_logs').select('triggered_at').in('job_id', jobIds).gte('triggered_at', twentyFourHoursAgo);
      
      const hourlyData: Record<string, number> = {};
      for (let i = 0; i < 24; i++) {
        const time = new Date(Date.now() - (23 - i) * 60 * 60 * 1000);
        hourlyData[`${time.getHours()}:00`] = 0;
      }
      logs?.forEach((log) => {
        const hourLabel = `${new Date(log.triggered_at).getHours()}:00`;
        if (hourlyData.hasOwnProperty(hourLabel)) hourlyData[hourLabel]++;
      });
      setData(Object.entries(hourlyData).map(([time, count]) => ({ time, count })));
    }
    fetchLogs();
  }, [jobs, supabase]);

  return (
    <div className="bg-white border border-[#EFEFEC]/60 rounded-2xl p-6 shadow-sm flex-1">
      <h3 className="text-sm font-bold text-[#283711] uppercase tracking-wider mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-[#89d45c]" /> Execution Flow
      </h3>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs><linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#89d45c" stopOpacity={0.3}/><stop offset="95%" stopColor="#89d45c" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEFEC" />
            <XAxis dataKey="time" tick={{fontSize: 10}} stroke="#BDBDBB" />
            <YAxis tick={{fontSize: 10}} stroke="#BDBDBB" allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
            <Area type="monotone" dataKey="count" stroke="#89d45c" fill="url(#colorCount)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Table Skeleton */}
      <div className="rounded-2xl border border-[#EFEFEC]/60 bg-white p-6 space-y-4">
        <div className="h-6 w-32 bg-[#EFEFEC] rounded-md" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 w-full bg-[#EFEFEC]/40 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Stats & Chart Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 h-52 bg-[#EFEFEC]/40 rounded-2xl" />
        <div className="h-52 bg-[#EFEFEC]/40 rounded-2xl" />
      </div>
    </div>
  );
}

// --- Main Page ---
export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const fetchJobs = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setJobs([]); setLoading(false); return; }
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/jobs?user_id=${user.id}`);
      setJobs(await res.json());
    } catch (err) { setJobs([]); } finally { setLoading(false); }
  }, [supabase]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  function openDeleteModal(id: string, e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    setJobToDelete(id); // Opens modal by setting the ID
  }

  function handleEditRedirect(job: any, e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    
    const params = new URLSearchParams({
      id: job.id,
      name: job.name || '',
      url: job.url || '',
      method: job.method || 'POST',
      timezone: job.timezone || 'Asia/Kolkata',
    });

    router.push(`/edit?${params.toString()}`);
  }

  async function proceedWithDeletion() {
    if (!jobToDelete) return;
    
    setIsDeleting(true);
    const { data: { session } } = await supabase.auth.getSession();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/jobs/${jobToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        },
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Failed to delete job');
      }

      // Optimistic Update: Immediately remove the deleted job from local state 
      setJobs((prevJobs) => prevJobs ? prevJobs.filter(job => job.id !== jobToDelete) : null);

      setJobToDelete(null); // Close Modal
      router.refresh();     // Sync Next.js server component data in background
    } catch (err: any) {
      alert(err.message);   
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-8 px-1">
      <div>
        <h2 className="text-2xl font-bold text-[#283711]">Active Crons</h2>
        <p className="text-sm text-[#BDBDBB]">Monitor and update edge-triggered schedules</p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-8">
          <div className="rounded-2xl border border-[#EFEFEC]/60 bg-white overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#EFEFEC]/40 text-xs font-bold uppercase text-[#283711]/70">
                <tr>
                  <th className="p-4 pl-6 w-1/3">Job Name</th>
                  <th className="p-4 w-1/3">Endpoint</th>
                  <th className="p-4 w-1/6">Profile</th>
                  <th className="p-4 text-right w-1/6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEFEC]/40">
                {jobs?.map((job) => (
                  <tr key={job.id} onClick={() => router.push(`/dashboard/logs/${job.id}`)} className="hover:bg-[#EFEFEC]/10 cursor-pointer">
                    <td className="p-4 pl-6 font-bold text-[#283711]">{job.name}</td>
                    <td className="p-4 font-mono text-xs text-[#BDBDBB] truncate max-w-[200px]">{job.url}</td>
                    <td className="p-4">
                      <span className="bg-[#EFEFEC]/60 rounded-xl px-3 py-1 font-mono text-xs">
                        {formatProfile(job)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={(e) => handleEditRedirect(job, e)} className="text-[#283711]/60 hover:text-[#89d45c] p-2 rounded-xl transition-all"><Edit2 className="h-4 w-4" /></button>
                      <button 
                        onClick={(e) => openDeleteModal(job.id, e)} 
                        className="text-[#283711]/40 hover:text-red-600 p-2 rounded-xl transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2"><JobActivityGraph jobs={jobs} /></div>
            <StatsSummary jobs={jobs} />
          </div>
        </div>
      )}

      {jobToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setJobToDelete(null)}
        >
          <div 
            className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4 flex flex-col gap-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Job Listing</h3>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to delete this job? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setJobToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={proceedWithDeletion}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}