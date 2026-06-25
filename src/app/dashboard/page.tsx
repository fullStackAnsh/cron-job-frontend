'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Edit2, Globe, Link2 } from 'lucide-react';

interface Job {
  id: string;
  name: string;
  url: string;
  cron?: string;
  run_at?: string;
  timezone: string;
}

// Manual, dependency-free Skeleton Loader
function JobsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Desktop Skeleton */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-[#EFEFEC]/60 bg-white">
        <div className="h-12 bg-[#EFEFEC]/40 border-b border-[#EFEFEC]" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border-b border-[#EFEFEC]/40 animate-pulse flex gap-4">
            <div className="h-4 w-44 bg-[#EFEFEC] rounded-lg" />
            <div className="h-4 w-56 bg-[#EFEFEC] rounded-md" />
            <div className="h-6 w-28 bg-[#EFEFEC] rounded-xl" />
          </div>
        ))}
      </div>
      {/* Mobile Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white border border-[#EFEFEC]/60 rounded-2xl animate-pulse p-5" />
        ))}
      </div>
    </div>
  );
}

function JobsDisplay({ 
  jobs, 
  handleEditRedirect, 
  deleteJob, 
  router 
}: { 
  jobs: Job[] | null;
  handleEditRedirect: (job: Job, e: React.MouseEvent) => void; 
  deleteJob: (id: string, e: React.MouseEvent) => void;
  router: any;
}) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="border border-dashed border-[#EFEFEC] bg-[#EFEFEC]/30 rounded-3xl p-10 md:p-16 text-center max-w-2xl mx-auto my-4">
        <p className="text-sm font-semibold text-[#283711]/60 leading-relaxed">
          No managed hooks mapped to this account environment.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {jobs.map((job) => (
          <Link 
            key={job.id}
            href={`/dashboard/logs/${job.id}`}
            className="block border border-[#EFEFEC]/60 bg-white p-5 space-y-4 hover:bg-[#EFEFEC]/20 transition-all duration-500 rounded-2xl group relative"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-1">
                <h3 className="font-bold text-[#283711] text-base group-hover:text-[#89d45c] transition-colors">{job.name}</h3>
                <p className="text-xs text-[#BDBDBB] font-mono break-all flex items-center gap-1.5">
                  <Link2 className="h-3 w-3" /> {job.url}
                </p>
              </div>
              <div className="flex items-center space-x-1.5 relative z-10">
                <button onClick={(e) => handleEditRedirect(job, e)} className="text-[#283711]/60 hover:text-[#283711] p-2 bg-[#EFEFEC]/50 rounded-xl transition-all"><Edit2 className="h-3.5 w-3.5" /></button>
                <button onClick={(e) => deleteJob(job.id, e)} className="text-[#283711]/40 hover:text-red-600 p-2 bg-[#EFEFEC]/40 rounded-xl transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="pt-2 border-t border-[#EFEFEC]/40 space-y-2">
              <div className="text-xs text-[#283711]/80">
                <span className="font-bold text-[#BDBDBB] block mb-1 uppercase tracking-wider text-[10px]">Interval Profile</span>
                <span className="inline-block bg-[#EFEFEC]/80 text-[#283711] rounded-xl px-3 py-1 font-mono text-[11px] font-semibold">{job.cron ? `cron(${job.cron})` : `run_at(${job.run_at})`}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="hidden md:block overflow-hidden rounded-2xl border border-[#EFEFEC]/60 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EFEFEC] bg-[#EFEFEC]/40 text-xs font-bold uppercase tracking-[0.08em] text-[#283711]/70">
                <th className="p-4 pl-6">Job Name</th>
                <th className="p-4">Destination Endpoint</th>
                <th className="p-4">Interval Profile</th>
                <th className="p-4">Zone context</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEFEC]/40 text-sm font-medium">
              {jobs.map((job) => (
                <tr key={job.id} onClick={() => router.push(`/dashboard/logs/${job.id}`)} className="hover:bg-[#EFEFEC]/10 transition-colors cursor-pointer group">
                  <td className="p-4 pl-6 font-bold text-[#283711] group-hover:text-[#89d45c] transition-colors">{job.name}</td>
                  <td className="p-4 text-[#BDBDBB] font-mono text-xs">{job.url}</td>
                  <td className="p-4 text-[#283711]"><span className="bg-[#EFEFEC]/60 rounded-xl px-3 py-1 font-mono text-xs font-semibold">{job.cron ? `cron(${job.cron})` : `run_at(${job.run_at})`}</span></td>
                  <td className="p-4 text-[#BDBDBB] text-xs font-semibold flex items-center space-x-1.5 pt-5"><Globe className="h-3.5 w-3.5 text-[#283711]/30" /> <span>{job.timezone}</span></td>
                  <td className="p-4 pr-6 text-right space-x-1">
                    <button onClick={(e) => handleEditRedirect(job, e)} className="text-[#283711]/60 hover:text-[#89d45c] p-2 rounded-xl transition-all"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={(e) => deleteJob(job.id, e)} className="text-[#283711]/40 hover:text-red-600 p-2 rounded-xl transition-all"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const fetchJobs = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setJobs([]); setLoading(false); return; }
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/jobs?user_id=${user.id}`);
      if (!res.ok) throw new Error('Network error');
      setJobs(await res.json());
    } catch (err) { console.error(err); setJobs([]); } finally { setLoading(false); }
  }, [supabase]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const deleteJob = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!confirm('Are you sure?')) return;
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/jobs/${id}?user_id=${user?.id}`, { method: 'DELETE' });
    fetchJobs();
  };

  const handleEditRedirect = (job: Job, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const params = new URLSearchParams({ id: job.id, name: job.name, url: job.url, timezone: job.timezone, ...(job.cron && { cron: job.cron }), ...(job.run_at && { run_at: job.run_at }) });
    router.push(`/edit?${params.toString()}`);
  };

  return (
    <div className="space-y-8 px-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#283711]">Active Crons</h2>
          <p className="text-sm font-medium text-[#BDBDBB] mt-1">Monitor and update edge-triggered schedules</p>
        </div>
        <Link href="/dashboard/create" className="flex items-center justify-center space-x-2 bg-[#9EE970] text-[#283711] hover:bg-[#89d45c] px-5 py-3.5 text-sm font-semibold rounded-2xl transition-all w-full sm:w-auto">
          <Plus className="h-4 w-4 stroke-[2.5]" /> <span>Create New Job</span>
        </Link>
      </div>

      {loading ? (
        <JobsSkeleton />
      ) : (
        <JobsDisplay 
          jobs={jobs} 
          handleEditRedirect={handleEditRedirect} 
          deleteJob={deleteJob} 
          router={router} 
        />
      )}
    </div>
  );
}